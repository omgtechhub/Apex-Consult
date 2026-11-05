import { BackdropImage } from "@/components/motion/BackdropImage";
import { blur } from "@/lib/imageBlur";
import { cn } from "@/lib/utils";

type ImageName = keyof typeof blur;

/**
 * PageHero
 * --------
 * The dark photographic hero at the top of an interior page, matching the home
 * page treatment: darkened image, light type, no animated glow.
 *
 * This *wraps* the header content rather than sitting behind it as a free
 * floating band. That is deliberate. An absolutely-positioned band has to guess
 * how tall the header will be, and when a heading wraps to an extra line on a
 * narrow screen the copy runs past the dark area and lands as light text on a
 * cream page — invisible, and invisible only at certain widths. Wrapping makes
 * the background and the text the same box, so they cannot desynchronise.
 *
 * The section starts at the very top of the document and clears the fixed
 * header with its own top padding, so the photograph runs edge-to-edge from
 * under the navbar with no gap above it.
 *
 * ACCENT IS PINNED TO GOLD, in both themes — `accent-gold-fixed`.
 * ----------------------------------------------------------------------------
 * This band is a darkened photograph, so the light theme has no light ground
 * to work against here. Letting the accent follow the theme meant red type on
 * a photograph: #630303 measures 1.27:1 on `surface-dark` and vanishes, and
 * even the lifted #ef4444 that `.bg-surface-dark` substitutes for it is a
 * saturated red laid over whatever colours the photo happens to contain, which
 * is where it stopped blending.
 *
 * Gold is the half of the palette built for dark grounds — it is what this
 * band already resolved to after dark, and what the home hero uses in both
 * themes. Pinning it here makes light mode agree with dark mode and with the
 * home page, instead of flipping to a red the band was never designed around.
 *
 * The flip is scoped to photographic bands on purpose. Red on the white page
 * body is the brand and clears AAA at 13.6:1; it is untouched. See the
 * `.accent-gold-fixed` block in globals.css.
 */
export function PageHero({
  image,
  position,
  className,
  children,
}: {
  image: ImageName;
  /** Object-position override, e.g. "object-[center_30%]" for tall crops. */
  position?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "accent-gold-fixed relative overflow-hidden bg-surface-dark pt-28 lg:pt-40 pb-16 lg:pb-20",
        className
      )}
    >
      <BackdropImage
        src={`/images/${image}.jpg`}
        blurDataURL={blur[image]}
        tone="dark"
        parallax={0.08}
        position={position}
        priority
      />
      <div className="relative">{children}</div>
    </section>
  );
}
