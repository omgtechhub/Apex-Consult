"use client";

import { Marquee } from "@/components/motion/Marquee";

const items = [
  "✦ Project Writing",
  "✦ PhD Research",
  "✦ SPSS Analysis",
  "✦ Study Abroad",
  "✦ Scholarships",
  "✦ Proofreading",
  "✦ Business Proposals",
  "✦ SOP Writing",
  "✦ Admission Guidance",
  "✦ Journal Formatting",
  "✦ Data Analysis",
  "✦ CV Writing",
  "✦ Research Assistance",
  "✦ Literature Review",
  "✦ Visa Documentation",
];

/**
 * The strip is coupled to scroll velocity rather than running on a fixed CSS
 * timer: it accelerates with a downward flick and reverses when the user
 * scrolls back up. That coupling is what makes the band read as part of the
 * page's physics instead of a looping GIF.
 */
export function MarqueeStrip() {
  return (
    /*
      `ruby-*` rather than `brand-*`: this strip is red in BOTH themes.
      `brand-*` turns gold after dark, which put a gold band directly beneath
      the (also gold) hero and lost the separation the strip exists to provide.
      See the `ruby` family in globals.css.
    */
    <div
      className="py-4 bg-gradient-to-r from-ruby-500 to-ruby-600 overflow-hidden"
      aria-hidden="true"
    >
      <Marquee baseVelocity={-2.5} scrollInfluence={4} pauseOnHover={false}>
        {items.map((item) => (
          <span
            key={item}
            className="text-white text-xs font-bold tracking-widest uppercase mx-6 flex-shrink-0"
          >
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
