import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { Tactile } from "@/components/motion/Tactile";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 text-center">
      <Stagger className="max-w-lg" each={0.1}>
        {/*
          The 404 itself only fades — no travel, no scale.

          `background-clip: text` renders blank in Chrome when the same element
          is promoted to a compositor layer, which any transform does. The
          drifting gradient below is pure `background-position`, which animates
          without promotion, so the number stays painted while still feeling
          alive.
        */}
        <StaggerItem choreography="fade" duration={0.9}>
          <div
            className="text-[12rem] font-black leading-none font-display mb-0 animate-gradient bg-gradient-to-br from-gold-200 via-gold-500 to-gold-700 bg-clip-text text-transparent select-none"
            aria-hidden="true"
          >
            404
          </div>
        </StaggerItem>

        <StaggerItem choreography="rise">
          <h1 className="text-2xl font-black font-display text-ink-950 mb-3">
            Page not found
          </h1>
        </StaggerItem>

        <StaggerItem choreography="blurRise" as="p" className="text-ink-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let us help you find what you need.
        </StaggerItem>

        <StaggerItem choreography="rise">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Magnetic strength={0.2} contentStrength={0.35}>
              <Tactile
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold text-sm rounded-xl shadow-layered-gold"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Tactile>
            </Magnetic>
            <Tactile
              href="/services"
              rippleColor="rgba(201,152,26,0.25)"
              className="group flex items-center justify-center gap-2 px-6 py-3 border border-ink-200 text-ink-700 font-semibold text-sm rounded-xl hover:border-gold-500/30"
            >
              Our Services
              <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-standard group-hover:translate-x-1" />
            </Tactile>
          </div>
        </StaggerItem>

        <StaggerItem choreography="fade">
          <div className="mt-8 text-xs text-ink-400">
            Need immediate help?{" "}
            <a
              href="https://wa.me/2347084321204"
              className="text-gold-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
