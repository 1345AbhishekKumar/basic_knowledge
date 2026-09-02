# Applications by Medium

The nine principles don't execute the same way twice. This file is the per-medium translation layer — read `principles.md` for what each principle means, then come here for how it lands in the specific thing you're building.

## Web (hero sections, full sites, landing pages)

- Re-check Step 0 in `SKILL.md` first — a Japanese-market e-commerce brief may genuinely want the dense/commercial pole, which this skill doesn't cover.
- One dominant element per viewport, not a hero competing with a nav banner competing with a secondary CTA.
- Ma shows up as margin that has a job: room around a single headline, not padding applied uniformly everywhere as a style rule.
- Scroll pacing matters as much as any single screen — treat the scroll itself as the interval between sections (Ma applied in time, not just space).
- For product-focused sites, Yūgen-style partial reveals (crop, blur-to-focus, rotate-to-inspect) pair well with this library's `creative-webgl` / `3d-scene-architect` skills for the actual implementation — this file stays at the direction level, not the shader level.
- Cross-reference `frontend-design` or `web-design-pro` in this library for general layout/typography execution; use *this* skill to decide which restrained direction they should execute toward.

## Poster / static composition

- The composition has no scroll, no interaction, and no second chance — Ma has to do more work per square inch than it does on a page with pacing.
- Vertical type (`writing-mode: vertical-rl`) earns its place here more naturally than on a web page — it can be a genuine compositional block, not just a nod to a script system.
- Fukinsei matters most in poster work: a single subject placed off-center against a large empty field reads as considered; the same subject dead-centered reads as a placeholder.
- Yūgen: crop the subject rather than showing it whole. A poster that reveals everything has nothing left for the viewer to complete.

## Brand identity / logo

- Consider the MUJI extreme case explicitly: Su (plain) + Ryohin (quality without brand assertion) — sometimes the most Shibui move is a wordmark with no symbol at all, letting quality of typesetting alone carry the identity.
- Build the palette from a seasonal (Kisetsu) system rather than a single "brand color" — see `design-tokens.md`. A brand that shifts subtly across a small seasonal palette reads as considered; a single loud brand hue reads as Western brand-guideline thinking.
- Restraint should show up in the system's rules (grid, spacing, weight) more than in a single hero asset — Shibui rewards the tenth look, so the system needs to hold up under repeated, close inspection.

## Packaging / product

- Material honesty: let the substrate be visible rather than disguised — uncoated paper stock, visible fiber, a texture that shows what the material actually is.
- Wabi-Sabi here means tolerating (or designing in) slight variation between units — a texture or print effect that isn't pixel-identical run to run reads as more authentic than a perfectly repeating pattern, as long as the variation is bounded and intentional.

## Presentation decks

- Seijaku as the design goal for the whole deck: one idea per slide, no slide competing with itself via multiple bullet hierarchies.
- Ma between slides — pacing and pause matter as much as any individual slide's layout. A deck that never pauses visually reads as anxious regardless of how clean each slide is individually.
- Cross-reference this library's `html-presentation-architect` for build mechanics; use this skill to decide restraint level and pacing.

## UI micro-interactions

- Omotenashi is the operating principle here more than any visual one: anticipate the next need (sensible defaults, progressive disclosure) rather than decorating the current screen.
- Confirmation states should be quiet — a subtle shift, not a celebratory animation — unless the action is genuinely high-stakes enough to warrant more.
- Loading and transition states are also part of Seijaku: predictable, low-anxiety, not there to entertain.
