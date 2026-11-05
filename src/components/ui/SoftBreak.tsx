/**
 * SoftBreak
 * ---------
 * A line break the design asks for, honoured only where there is room for it.
 *
 * Section headings across the site are hand-broken into balanced lines —
 * "Built on trust," / "delivered with excellence." — which is deliberate
 * typography at desktop widths. A plain `<br>` keeps that break at *every*
 * width, so on a phone the heading breaks a second time where the text has
 * already had to wrap, and the result is a stack of lines that stop less than
 * half way across the column.
 *
 * Measured in a 455px heading column at a 400px viewport, before this existed:
 *
 *   FAQ heading       168px / 88px / 158px   ("asked" alone on its own line)
 *   Process heading   194px / 169px / 155px
 *   Trust heading     191px / 350px
 *
 * Below `sm` the break is dropped and the words flow; from `sm` up the designed
 * break returns. `display: none` is the only thing that suppresses a `<br>` —
 * its break behaviour survives every other display value, which is why
 * `sm:block` restores it rather than needing `sm:inline`.
 *
 * The leading space is load-bearing. JSX strips the whitespace around a newline
 * between elements, and `TextReveal` emits no trailing space after its last
 * word, so without it the two halves run together as "trust,delivered" the
 * moment the break is suppressed. Consecutive whitespace collapses in HTML, so
 * it is harmless at the call sites that already have a space.
 *
 * Not for breaks that carry meaning. A postal address or a stacked
 * label/value pair has to break at every width — those keep a plain `<br>`
 * (see `app/privacy/page.tsx`).
 */
export function SoftBreak() {
  return (
    <>
      {" "}
      <br className="hidden sm:block" />
    </>
  );
}
