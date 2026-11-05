#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Lets other devices on your Wi-Fi reach the dev server. Run once per machine.

.DESCRIPTION
    Why this script exists
    ----------------------
    The dev server already listens on every interface (`next dev` defaults to
    0.0.0.0, and `package.json` now says so explicitly). The thing that stops a
    phone or tablet from loading http://<your-ip>:3000 is Windows Firewall.

    Windows keeps three firewall profiles — Domain, Private and Public — and
    applies whichever matches the network you are on. The "Node.js JavaScript
    Runtime" rules that Windows offers to create the first time you start a dev
    server are scoped to the **Private** profile only. Home and office Wi-Fi is
    very often classified **Public** (it is the default for any new network you
    do not explicitly mark as private), and on the Public profile inbound
    traffic is blocked. The server is running, the port is open, the phone is on
    the same Wi-Fi — and every connection is silently dropped before Node ever
    sees it. There is no error message anywhere, which is why this reads as
    "sharing the port just doesn't work".

    What this does
    --------------
    Creates two inbound allow rules, one for TCP 3000 (this site) and one for
    TCP 3001 (the scholarship pipeline), that apply on **all three profiles**,
    so the network's classification stops mattering.

    Why this is not just "turn the firewall off"
    -------------------------------------------
    Each rule is scoped with `-RemoteAddress LocalSubnet`, so only devices on
    the same local network can connect. Plugging into airport or café Wi-Fi does
    not expose your dev server, your database connection or your API keys to
    everyone else on that network. That is the whole reason not to simply mark
    every network as Private or disable the Public profile.

.NOTES
    Run from an elevated PowerShell:

        powershell -ExecutionPolicy Bypass -File scripts\enable-lan-testing.ps1

    To undo it later:

        Remove-NetFirewallRule -Group "Altivance dev servers"
#>

[CmdletBinding()]
param(
    # Ports to open. 3000 = this site, 3001 = the scholarship pipeline API.
    [int[]] $Ports = @(3000, 3001),

    # Remove the rules instead of creating them.
    [switch] $Remove
)

$ErrorActionPreference = 'Stop'

$group = 'Altivance dev servers'

function Assert-Elevated {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)

    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host ''
        Write-Host '  This script changes Windows Firewall, so it needs an elevated shell.' -ForegroundColor Yellow
        Write-Host '  Right-click PowerShell -> "Run as administrator", then run:' -ForegroundColor Yellow
        Write-Host ''
        Write-Host "    powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -ForegroundColor Cyan
        Write-Host ''
        exit 1
    }
}

Assert-Elevated

if ($Remove) {
    $existing = Get-NetFirewallRule -Group $group -ErrorAction SilentlyContinue

    if ($existing) {
        $existing | Remove-NetFirewallRule
        Write-Host "  Removed $($existing.Count) rule(s) in group '$group'." -ForegroundColor Green
    }
    else {
        Write-Host "  Nothing to remove — no rules in group '$group'." -ForegroundColor Gray
    }

    exit 0
}

Write-Host ''
Write-Host '  Opening dev server ports for local-network devices' -ForegroundColor White
Write-Host '  --------------------------------------------------' -ForegroundColor DarkGray

foreach ($port in $Ports) {
    $name = "Altivance dev server (TCP $port)"

    # Idempotent: re-running must not stack duplicate rules, which is how a
    # firewall ends up with nine copies of the same allow and no one able to
    # say which one is in force.
    $existing = Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue

    if ($existing) {
        $existing | Remove-NetFirewallRule
    }

    New-NetFirewallRule `
        -DisplayName $name `
        -Group $group `
        -Description "Allows phones, tablets and other computers on the same local network to load the Next.js dev server on port $port. Scoped to LocalSubnet, so it is not reachable from the wider internet or from other devices on a public hotspot." `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $port `
        -Profile Domain, Private, Public `
        -RemoteAddress LocalSubnet `
        -Enabled True | Out-Null

    Write-Host "  [ok] TCP $port  allowed inbound on all profiles, LocalSubnet only" -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Print the addresses to hand out. The Wi-Fi adapter is on DHCP, so this
# changes whenever the lease does — which is exactly why it is printed rather
# than written down anywhere.
# ---------------------------------------------------------------------------

Write-Host ''
Write-Host '  Share one of these with the test device:' -ForegroundColor White

$addresses = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -ne '127.0.0.1' -and
        # 169.254.x.x means "this adapter has no DHCP lease" — a dead end.
        $_.IPAddress -notlike '169.254.*' -and
        $_.InterfaceAlias -notlike 'vEthernet*' -and
        $_.InterfaceAlias -notlike 'Loopback*'
    } |
    Sort-Object -Property @{ Expression = { $_.InterfaceAlias -notlike 'Wi-Fi*' } }

if (-not $addresses) {
    Write-Host '  (no usable network address — is Wi-Fi connected?)' -ForegroundColor Yellow
}

foreach ($address in $addresses) {
    foreach ($port in $Ports) {
        Write-Host ("    http://{0}:{1}" -f $address.IPAddress, $port) -ForegroundColor Cyan -NoNewline
        Write-Host ("   ({0})" -f $address.InterfaceAlias) -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host '  The test device must be on the same Wi-Fi network as this PC.' -ForegroundColor Gray
Write-Host '  Run `npm run lan` any time to print these addresses again.' -ForegroundColor Gray
Write-Host ''
