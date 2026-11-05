"use client";

/**
 * Admin chrome: sidebar, role badge, sign-out.
 *
 * Navigation is filtered by capability rather than hidden by CSS — a
 * consultant never receives the moderation links in their HTML at all. That is
 * presentation only, though; every one of those routes re-checks the role
 * server-side, because a hidden link is not a permission.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  MessagesSquare,
  MessageSquareText,
  Quote,
  Users,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { StaffUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/posts", label: "Blog posts", icon: FileText, adminOnly: false },
  { href: "/admin/threads", label: "Client messages", icon: MessagesSquare, adminOnly: false },
  { href: "/admin/comments", label: "Comments", icon: MessageSquareText, adminOnly: true },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote, adminOnly: true },
  { href: "/admin/staff", label: "Staff", icon: Users, adminOnly: true },
  { href: "/admin/activity", label: "Activity", icon: Activity, adminOnly: true },
];

export function AdminShell({
  user,
  children,
}: {
  user: StaffUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-[1500px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-8">
            <Link href="/" className="mb-8 flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              <div>
                <div className="font-display text-sm font-bold text-ink-950">ALTIVANCE ADMIN</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-brand-500">
                  {user.role}
                </div>
              </div>
            </Link>

            <nav className="space-y-1" aria-label="Admin sections">
              {items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "text-ink-950"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-950"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active"
                        className="absolute inset-0 rounded-xl bg-surface shadow-sm ring-1 ring-ink-200/60"
                        transition={spring.snappy}
                      />
                    )}
                    <item.icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10 font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-xl border border-ink-200/60 bg-surface p-4">
              <div className="text-sm font-semibold text-ink-950">{user.name}</div>
              <div className="truncate text-xs text-ink-500">{user.email}</div>
              <form action="/api/admin/signout" method="POST" className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Mobile section switcher */}
        <div className="lg:hidden">
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Admin sections">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-ink-200 bg-surface px-3.5 py-2 text-xs font-medium text-ink-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
