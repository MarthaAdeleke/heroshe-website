# Heroshe Website — Handoff

Static HTML/CSS build of the Heroshe marketing site, implemented from the Figma file
[`Portfolio` (jF30lHhApwjMbD2oV2DTCO)](https://www.figma.com/design/jF30lHhApwjMbD2oV2DTCO/Portfolio).
No build step, no framework, no dependencies — plain HTML files sharing one stylesheet and one script.

**⚠️ There is a second Figma file.** [`Heroshe Website Redesign`
(BqQ7ISVe69j1EM52X5A4dN)](https://www.figma.com/design/BqQ7ISVe69j1EM52X5A4dN/Heroshe-Website-Redesign)
contains at least some of the same screens as `Portfolio`, and where they overlap the
redesign file is the more current/correct one — the "Who We Serve" row there ships the
"You!" wordmark as a proper exported graphic where `Portfolio` had it as a text layer
(see §3). **Everything in this build so far was implemented from `Portfolio`.** Nobody has
audited the two files against each other, so assume other screens may have drifted too —
check the redesign file first before treating `Portfolio` as authoritative on any detail.

**Under version control as of the initial commit** (`9ca13cf`). Note that everything
predating that commit has no history — the whole build landed as one import, so `git log`
won't explain why any individual pre-existing decision was made. This file is the record
for those; keep using it for decisions that the diff alone won't convey.

---

## 1. What's built

Eight pages, all cross-linked, all responsive at 1440px / ~1000px / 393px / 320px:

| Page | File | Figma node |
|---|---|---|
| Home | `index.html` | 2686:1385 (+ mobile frame 2686:1885) |
| About Us | `about.html` | 2686:1703 |
| Ship for Me | `ship-for-me.html` | 2686:2378 |
| Buy for Me | `buy-for-me.html` | 2686:2670 |
| Buy for Others | `buy-for-others.html` | 2686:2881 |
| Fulfil for Me | `fulfil-for-me.html` | 2686:3134 |
| Contact Us | `contact-us.html` | 2686:3571 |
| Pricing | `pricing.html` | 2686:4078 |

Pricing isn't in the header nav (see §4) — it's reached from Ship for Me's calculator via
"Check pricing details here" (`.calcbox__link`, previously `href="#"`).

Pricing's "Compare all features" table is the site's first genuinely interactive
component — everywhere else that *looks* interactive (the Ship for Me calculator, the
Quarterly/Annual toggle on this same page) is a static mockup with no real behavior. On
mobile, comparing 3 plans side-by-side doesn't fit without horizontal scroll, which is a
poor experience for a table people specifically want to compare — so below 767px the
table collapses to 2 columns (Features + one selected plan), switched by real `.ptabs`
buttons wired in `site.js`. Above 767px nothing changes: same table, all three plan
columns, no JS involved.

Every page shares one `<header>`, one `<footer>`, `styles.css`, and `site.js`. The header's
**Products** dropdown links all four service pages and marks the current page with
`aria-current="page"`; the home page's "Our Offerings" cards and the footer's Services
column link to the matching pages too.

Home is the only page with a real Figma-supplied mobile frame (2686:1885) — its mobile
layout is design-accurate. Every other page's mobile behavior is my own responsive
adaptation of the 1440px design (see §4).

The footer's **Contact us** link now points to `contact-us.html` on all seven pages
(previously `#` everywhere). The header's **Company** dropdown (previously inert) now
works the same way **Products** does, linking to About and Contact Us.

**Contact Us deliberately has no Figma hero and no form.** Both existed at one point —
the Figma-specified teal `ahero` hero, and a hand-built "Send Us A Message" form with real
`<input>`/`<select>`/`<textarea>` elements reusing the Ship for Me calculator's `.field`/
`.control` shell — but both were cut after a design review: the hero's copy was redundant
with the form's own intro and pushed the actual content below the fold, and the form
would have needed a real backend (submission endpoint, spam handling, etc.) that this
static-file project isn't set up to own right now. What's there instead is a single
plain `.section-head` at the top of the (white) offices section, doing triple duty as the
page's H1, a one-line "why you'd be here" blurb, and — restoring the one thing worth
keeping from the form — a `mailto:helpdesk@heroshe.com` / `tel:` line so the page still has
*some* direct way to reach the company. Office-card phone numbers are `tel:` links too.
(The cut hero/form markup predates the initial commit, so it isn't recoverable from
`git log` — a future contact form would be built fresh rather than resurrected.)

---

## 2. Architecture

```
index.html, about.html, ship-for-me.html,       ← one file per page, semantic markup,
buy-for-me.html, buy-for-others.html,             BEM-ish class names, no inline styles
fulfil-for-me.html                                except the occasional footer-column width

styles.css   (~2250 lines)                       ← single shared stylesheet
site.js      (~95 lines)                         ← mobile drawer + Products dropdown +
                                                     footer-accordion behavior (every page),
                                                     plus Pricing's mobile plan-tabs (guarded,
                                                     no-ops on every other page)

assets/
  icons/     (108K, SVGs)                        ← nav chevrons, hamburger, star, compass,
                                                     bell, service-specific glyphs, plus
                                                     Pricing's check-circle / dash-circle /
                                                     cube icons
  img/
    about/   (3.1M)   ship/  (1.4M)   fulfil/ (1.4M)
    others/  (1.0M)   buy/   (604K)   pricing/ (new)
                                                   ← one folder per page, JPGs re-encoded
                                                     from Figma PNG exports (sips -Z 1800,
                                                     format + resize as separate passes —
                                                     see the sips gotcha in §3). Contact Us
                                                     has no image of its own — its hero was
                                                     cut (see §1) — so there's no contact/
                                                     folder. pricing/map.png is a transparent
                                                     PNG, not a JPG — it's a decorative
                                                     watermark, not a photo (see §3).
```

### `styles.css` layout (top to bottom)

1. Design tokens (`:root`) — colors, `--gutter`, `--frame`
2. Reset + typography base
3. Header / nav (incl. Products dropdown, mobile drawer)
4. Home page sections (hero, offerings, stories, footer)
5. About Us page block
6. Ship for Me page block
7. Buy for Me page block
8. Buy for Others page block
9. Fulfil for Me page block
10. Contact Us page block
11. Pricing page block
12. **Tablet breakpoint** (`max-width: 1300px` down through `900px`, several nested queries)
13. **Mobile breakpoint** (`max-width: 767px`, plus a `359px` tightening)

Each page-specific block is a comment-delimited section with the Figma node ID in the
header comment, e.g.:
```css
/* ============================================================
   Fulfil for Me page — Figma "Fulfil for Me" frame (1440px, node 2686:3134)
   ============================================================ */
```

### Shared components (reused across pages, not duplicated)

- **`.ahero` / `.shero__*`** — the four "inner page" hero layouts (About, Ship, Buy for
  Me, Buy for Others, Fulfil for Me all reuse this with width modifiers like
  `.ohero__left`, `.shero__left`).
- **`.howto` / `.step`** — the numbered "How it works" list + photo pattern, reused on
  Ship for Me, Buy for Me, Buy for Others, Fulfil for Me, each with a `.howto--*` modifier
  for its own image crop and figure height.
- **`.scard`** — icon-tile feature card (Buy for Me's "Sourcing Made Simple", Fulfil for
  Me's 6-card "Expansion Easy" grid).
- **`.fcard` / `.phone`** — phone-mockup feature card (Ship for Me's "Stress-Free
  Shipping", Buy for Others' "Ultimate Plug").
- **`.faq` / `.qa`** — the `<details>`-based FAQ accordion, identical on every service page.
- **`.customers__viewport` / `.customers__stage`** — see §3, the floating-card-composition
  component. Reused verbatim (different content, different colors) by Buy for Others'
  "Customers to Serve" and Fulfil for Me's "Grow Your Business Beyond Borders" (`.grow`).
- **`.chip`** — small colored status pill (dot + label). Originally built for the home
  hero's floating cards, reused by Fulfil for Me's "Grow" section cards.

---

## 3. Key technical decisions

**No build tooling.** Plain files, Google Fonts (Onest) loaded via `<link>`, images
manually re-encoded to JPG and resized with `sips`. Chosen for simplicity — there's no
bundler, no package.json, nothing to install.

**Fixed-composition sections scale as one unit via CSS container queries, not
transform-per-breakpoint.** Two sections (Buy for Others' "Customers to Serve", Fulfil
for Me's "Grow Your Business Beyond Borders") are a photo + several absolutely-positioned
floating cards + decorative rings, authored in Figma as one fixed-pixel 688×480
composition. Reflowing that into a "stacked" mobile layout looked wrong and broke the
overlap the design relies on. Instead:

```css
.customers__viewport {
  container-type: inline-size;
  width: 100%;
  max-width: 688px;
  aspect-ratio: 688 / 480;
}
.customers__stage {
  position: absolute;
  width: 688px; height: 480px;      /* always the Figma-native size */
  transform-origin: top left;
  transform: scale(calc(100cqi / 688px));   /* shrinks to fit, never reflows */
}
```
Everything inside `.customers__stage` keeps its exact Figma-derived `left`/`top`/`width`
in pixels; the whole composition (photo, cards, rings) scales together as a single
image would, all the way down to 320px. This is the correct pattern for any future
"pinned collage" section — don't reach for flex/grid reflow on these.

**Tinted sections need `overflow: hidden`, and the section-to-section gap needs to be
`padding`, not `margin`, whenever a tinted section is not preceded by another tinted
section.** Two related bugs, both now fixed and documented in code comments:
- Decorative rings are taller than their own container and rely on the parent section
  clipping them at its own boundary. Without `overflow: hidden` on the section, an
  absolutely-positioned ring paints *through* the next section's background (CSS paints
  positioned descendants after non-positioned block boxes, regardless of DOM order — a
  real, easy-to-miss stacking rule, not a display-order bug).
- A gap implemented as `margin-top` on a tinted section is transparent — it shows the
  *page* background (white) underneath it, not the tinted section's own color. That's
  invisible when the previous section is also white, but produces a visible mismatched
  white band when the previous section is a differently-colored block (e.g. the dark
  teal hero). Fix: fold the gap into the tinted section's own `padding-top` instead of
  `margin-top`, so the space is filled with the section's own background.
  `.customers { overflow: hidden; }` + `.customers__inner { padding-top: 160px ...}` on
  Buy for Others; `.grow { margin-top: 160px; }` on Fulfil for Me is fine specifically
  *because* it follows a white section, not the hero.

**`flex: 1 1 0` breaks when a row-direction flex container becomes column-direction at
a breakpoint.** `.fcard` and `.features__grid` both reuse `flex: 1 1 0` to distribute
width evenly in the desktop row layout. At the breakpoint where `.features__grid` flips
to `flex-direction: column`, that same `flex-basis: 0` collapses each card's *height* to
near-zero (the flex-basis now applies to the new main axis). This was a real, silent bug
present on Ship for Me since it was built, only caught while building Buy for Others.
Fixed generically: `.fcard { flex: none; }` inside the `≤900px` block, alongside
`.features__grid { align-items: stretch; }` (needed because `align-items: flex-start`
also stops children from filling the new cross-axis).

**Compound-class CSS selectors need matching specificity at every breakpoint that
touches them.** Page-specific overrides like `.howto--fulfil .howto__figure { height:
840px; }` have two-class specificity (0,2,0). A later, *narrower*-breakpoint rule that's
supposed to override it — e.g. a bare `.howto__figure { height: 300px; }` inside a
`@media` block — has *lower* specificity (0,1,0) and loses regardless of source order,
so the override silently fails. Every `.howto--*`, `.customers__head`, and similar
page-modifier selector is now explicitly repeated in every breakpoint block that needs
to touch it, rather than relying on a bare shared selector to win. Grep for
`howto--fulfil`, `howto--others`, `howto--buy` in the two `@media` blocks to see the
pattern before adding a fourth `.howto--*` variant.

**Headless Chrome's `--screenshot` CLI flag has a real rendering bug** with
`overflow: hidden` clipping an absolutely-positioned descendant of a `transform`ed
ancestor — it shows content bleeding through that the actual browser (and real users)
correctly clip. This was chased as a real bug for a while before being confirmed as a
tool artifact by comparing the interactive Browser-pane tab against headless
screenshots directly. **Don't trust a headless screenshot alone for anything involving
`overflow: hidden` + `transform` together — verify in an interactive tab.**

**`sips -s format jpeg -Z N` in a single invocation can silently corrupt the image** —
confirmed on the Contact Us hero photo, where combining the format conversion and the
resize into one `sips` call produced a JPEG whose bottom ~55% was flat gray (the top
portion, oddly, was fine). The file reported correct dimensions and opened without
error; the corruption was only visible on inspection. Splitting into two passes — resize
first (`sips -Z 1800 in.png --out resized.png`), then convert format as a separate step
(`sips -s format jpeg resized.png --out out.jpg`) — produced a correct file every time.
**Always visually inspect a freshly-`sips`-processed image (read the actual output file)
before trusting it — this is a real, easy-to-miss tool bug, not a one-off.**

**A Figma node built from thousands of individually-placed vectors will blow the
MCP tool's output budget — go one level deeper in the tree, not lower resolution.**
Pricing's hero has a decorative dotted world-map illustration authored as ~6,500
individually-positioned 2px dot vectors. Calling `get_design_context` on the hero frame
(or even just `get_metadata`) failed outright — over 1M characters, past the tool's
token ceiling — even though the *visible* result is one flat, low-detail graphic.
The fix wasn't to ask for less detail; it was to stop asking for that subtree at all:
`get_metadata` on the *parent* frame first (small — it only lists direct children, not
their contents) to find the map's sibling (the actual text/toggle content, in its own
small "Hero Group" node) and pull design context on *that* instead, then export the
dotted-map node as one flattened PNG via `get_screenshot` and use it as an ordinary
`background`/`<img>`. Same principle as the "hidden/covered image layers" lesson below —
inspect structure before pulling content, especially when a single section's output
looks disproportionately large for what it renders as.

**A `flex-direction: column` container's children are NOT width-constrained by
`align-items: center` — they size to their own fit-content, which can silently overflow
a narrow viewport.** `.phero__text` (title + subtitle, centered in the hero) has no
`align-items: stretch`, so its width defaults to fit-content of its widest child — here,
`.phero__sub`'s explicit `width: 738px`. That 738px became `.phero__text`'s own
"natural" width at *every* viewport size, including 393px and 320px, where the title and
subtitle simply overflowed off both edges instead of wrapping (they were centered on an
invisible 738px-wide box, so the overflow was symmetric and easy to misread as some kind
of centering bug rather than a sizing one). Fix: `.phero__text { width: 100%; }` — once
the flex item has a real width tied to its actual container, `.phero__sub`'s own
`max-width: 100%` correctly caps against *that*, and normal text wrapping takes over.
Cross-axis sizing in a column flex layout is the one place `width: 100%` on a flex item
isn't redundant — don't assume a flex child is width-constrained by its container just
because the layout *looks* contained at desktop width.

**A Figma image-fill crop is only aspect-true at the card shape it was measured
against — so that card must keep its aspect ratio, not a fixed height.** Figma exports
these crops as independent `width`/`height` percentages of the frame
(`.serve__img--social { width: 158.07%; height: 140.41% }`). Those two percentages
resolve against the frame's width and height *separately*, so the photo only holds its
real aspect ratio while the frame holds the Figma card shape (197×292). The frame had a
fixed `height` instead (292px desktop / 220px mobile), so at in-between widths — 2
columns near 600px, 3 columns near 1120px — the card went landscape and stretched the
photos with it; the social shot rendered ~65% too wide at 600px. Fixed by giving
`.serve__frame` `aspect-ratio: 197.33 / 292` and deleting the fixed heights, which keeps
every crop exactly as designed at every width (measured distortion is now ≤0.4%
everywhere from 320px to 1440px).

Worth knowing what *doesn't* work here: swapping the crops for `object-fit: cover` +
`object-position` does stop the distortion, but `cover` picks its own zoom, so it loses
the design's much tighter framing (the "personal shoppers" crop is ~1.66× more zoomed
than `cover`). Trying to add that zoom back with `transform: scale()` also fails —
`object-position` and `transform-origin` are different coordinate systems and the
framing drifts. Constrain the frame's shape instead of fighting the image.

**Check whether a "styled text" element is actually an exported graphic before
reproducing it in CSS.** The "You!" card in Ship for Me's "Who We Serve" row was
originally built as live text — Onest + `text-shadow` — because that's what the
`Portfolio` file's text layer specified (`font-['Onest:Bold']`, `text-shadow-[9px_12px_0px]`).
It never matched, and a lot of time went into chasing it with `font-weight` and
`letter-spacing` tuning. It cannot match: the real artwork has a light knockout outline
*between* the front letters and their shadow, plus custom kerning — neither is expressible
with `text-shadow`. The redesign file settles it, shipping the same element as `image 42`,
a 167×84.5 PNG. It's now `assets/img/ship/you.png` (334×169, 2× retina, alpha, 9KB).
**Lesson: when a text layer is doing something a font can't do on its own, look for an
image version of it in the other file before writing CSS to fake it.**

**Hidden/covered Figma image layers.** Several composited photos in the Figma file have
two stacked image layers where the lower one is fully covered by the upper one (a
leftover from the designer's editing history, not an intentional double-exposure
effect). Every page only exports and uses the visible top layer — verified per-instance
by screenshotting the isolated Figma node before trusting the "which layer is visible"
call. If a future page shows an unexpected blank/wrong photo, check whether Figma has a
second layer underneath.

---

## 4. Known deviations from Figma (all deliberate, all disclosed at the time)

- **Section gaps normalized to a flat 160px** (desktop) / 96px (tablet) / 64px (mobile)
  rhythm across every page. Figma's actual gaps between sections drift between 128–163px
  in places, almost certainly from Figma's `calc(50% ± N)` auto-layout math rather than
  intentional design variance. Normalizing keeps the site's rhythm consistent instead of
  reproducing what look like rounding artifacts.
- **No mobile Figma frame exists** for About, Ship for Me, Buy for Me, Buy for Others,
  Fulfil for Me, Contact Us, or Pricing. Their mobile layouts (breakpoints, stacking
  order, the container-query scaling trick in §3) are my own responsive design, built to
  match the site's established visual language — not verified against a design file
  because none exists yet.
- **Pricing's header doesn't match its own Figma frame.** That frame specifies "Products
  / Company / Blog / Login / Get started" — a wider nav than any other page in the file.
  Per explicit instruction, it uses the same header every other page uses (Products /
  Company / Get started) instead. Same reasoning as the Contact Us footer deviation
  above: one frame's own variant isn't a reason to fork the shared component.
- **Pricing's "Quarterly pricing / Annual pricing" toggle is a static, non-functional
  mockup** — plain `<span>`s, not real controls, same convention as the Ship for Me
  calculator (`.calcbox`, which is also all static `<span>`s dressed as inputs). Figma
  only supplies the Quarterly-pricing state for this frame — no annual numbers exist
  anywhere in the file to switch to — so there's nothing to wire even if it were made
  interactive. If annual pricing ever gets designed, this is the thing to come back and
  make real.
- **Contact Us reuses the site's shared footer as-is**, not the page-specific footer
  Figma actually specifies for that frame (a "Contact Support" column with
  helpdesk@heroshe.com / 0201 887 0034 in place of the "Support" column, and "Blog"
  filed under Company instead). Treated as the same kind of Figma drift as the section-gap
  normalization above — one frame's own variant, not a deliberate per-page design —
  so every page keeps the identical shared `<footer>` for consistency instead of
  branching the markup for one page. The email/phone this would have surfaced are now
  shown in the page's own intro line instead (see §1), so the information isn't
  actually missing — it just lives at the top of the page rather than in the footer.
- **FAQ answer copy is placeholder on all four service pages — every question on a page
  shows the same answer.** Figma only supplies real answer text for the one expanded FAQ
  item per page, so that single answer got repeated under every question on that page:
  Ship for Me repeats its pricing answer ×6, Buy for Others its "add customers" answer ×5,
  Fulfil for Me a fulfilment answer ×5. **Buy for Me is the worst case — it repeats Ship
  for Me's US-to-Nigeria *pricing* answer ×6, which is the wrong page's content**, not
  just thin content. 22 answers across the four pages need real copy; this is a content
  gap, not a rendering bug.
- **The header's "Company" dropdown now links to About and Contact Us** (same
  `.has-menu`/`.navmenu` pattern as "Products" — no open-state exists for it in Figma
  either, so it follows the site's own surface/shadow language, same as Products always
  did). Still a stopgap: once Careers/Blog have real pages, they likely belong here too.
- **All primary CTAs point to `href="#"`**: "Get started" / "Get started today" (header
  + footer), "Book a Call" (every inner-page hero), the FAQ chevrons' target action, and
  every social icon in the footer (X, LinkedIn, Facebook, Instagram, YouTube). None of
  these have a real destination yet.

---

## 5. Running it locally

No build step. Serve the directory root and open any `.html` file:

```bash
cd "/Users/macbook/Documents/Projects/Heroshe Website"
python3 -m http.server 4599
```

then visit `http://localhost:4599/index.html`. **The server does not persist between
sessions** — it's been killed by session restarts at least twice during this build and
needs to be restarted manually each time (`curl -sS -o /dev/null -w "%{http_code}"
http://localhost:4599/index.html` is a quick way to check if it's already running before
starting a second one on the same port).

---

## 6. Next steps

Roughly in priority order:

1. **Audit `Portfolio` against `Heroshe Website Redesign`** (see the note at the top).
   Every page here was built from `Portfolio`; the redesign file is newer where they
   overlap. Until someone diffs them, any page could be carrying the same class of
   mismatch the "You!" wordmark did.
2. **Real FAQ copy — 22 answers across all four service pages** (see §4). Every question
   on a page currently shows that page's single Figma-supplied answer. Buy for Me is the
   urgent one: it repeats Ship for Me's pricing answer, so it's showing factually wrong
   content, not just placeholder content.
3. **Wire the remaining CTAs and footer/social links** to real destinations once they
   exist (signup flow, calendar booking, social profiles).
4. **Extend the "Company" dropdown** to Careers and Blog once those pages exist (it
   currently only has About and Contact Us — see §4).
5. **Get a mobile Figma frame for the four service pages, About, Contact Us, and
   Pricing**, or explicit sign-off that the current responsive adaptations (§4) are good
   enough as-is.
6. **Decide on a real backend/CMS story** if this moves past a static prototype —
   nothing here has any dynamic behavior; it's markup and CSS only. A Contact Us form
   was deliberately left out for exactly this reason (see §1) — revisit it once there's
   a backend able to receive submissions.
