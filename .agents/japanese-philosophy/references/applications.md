# Applications for Web Design

The nine principles don't execute the same way on every web surface. This file is the per-surface translation layer — read `principles.md` for what each principle means, then come here for how it lands in the specific web thing you're building.

## Web Hero Sections

- Re-check Step 0 in `SKILL.md` first — a Japanese-market e-commerce brief may genuinely want the dense/commercial pole, which this skill doesn't cover.
- One dominant element per viewport, not a hero competing with a nav banner competing with a secondary CTA.
- Ma shows up as margin that has a job: room around a single headline + single CTA, not padding applied uniformly everywhere as a style rule.
- Fukinsei: place the headline off-center (e.g. 40/60 grid), balance one large type block against one small meta detail, or let one element intentionally break the container. One asymmetry per hero, not three.
- Yūgen: crop or partially fade the hero visual, blur-to-focus on load, or reveal a detail rather than the whole product. Let scroll be the invitation to see more.
- Cross-reference `frontend-design` or `web-design-pro` in this library for layout/typography execution; use *this* skill to decide which restrained direction they should execute toward.

## Landing Pages / Full Marketing Sites

- Scroll pacing matters as much as any single screen — treat the scroll itself as Ma applied in time, not just space. Alternate dense (proof, features) and open (statement, pause) sections; don't stack same-density sections uniformly.
- One message per section. If a section needs two competing CTAs, split it.
- Seijaku is the test for the whole page: if the page feels anxious despite clean sections, a section upstream is competing for attention — remove or demote it.
- Omotenashi: sensible defaults (pre-selected plan, remembered theme), sticky nav that stays quiet, forms that don't ask twice, fast load treated as respect for the user's time.
- For product-focused sites, Yūgen-style partial reveals (crop, blur-to-focus, rotate-to-inspect) pair well with this library's `creative-webgl` skill for the actual implementation — this file stays at the direction level, not the shader level.

## Web UI & Micro-interactions

- Omotenashi is the operating principle here more than any visual one: anticipate the next need (sensible defaults, progressive disclosure, inline validation) rather than decorating the current screen.
- Confirmation states should be quiet — a subtle shift, not a celebratory animation — unless the action is genuinely high-stakes enough to warrant more.
- Loading and transition states are also part of Seijaku: predictable, low-anxiety, 0.8–1.2s soft-ease fades, not spinners competing for attention or bouncy entrances.
- Kanso for UI: remove one field, one filter, one nav item at a time until removing more would remove meaning. Hide advanced options behind progressive disclosure, don't delete capability.
