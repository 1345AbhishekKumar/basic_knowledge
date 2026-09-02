# Principles — Full Reference

## Emptiness is not simplicity

Two things that look alike and aren't:

- **Simplicity (Western minimalism, e.g. Dieter Rams).** Removes to clarify. "Nothing unnecessary remains." Closed and solved — the object tells you exactly how to use it.
- **Emptiness (Ku/Mu, 空/無 — Japanese design, e.g. Kenya Hara).** Removes to invite. "Space for you to complete." Open and waiting — the object receives whatever the user brings to it.

Kenya Hara's reference example: a yanagiba sushi knife has a plain, undecorated wooden handle. It doesn't impose a single correct grip — its plainness is what lets it receive the chef's own technique, whatever that turns out to be. Hara's 2003 MUJI "Horizon" campaign made the same move at brand scale: a photograph of a vast salt flat, a tiny logo, no product, no call to action. It sold emptiness as hospitality — the design refuses to impose an identity so the viewer can supply their own.

MUJI's underlying discipline for this is **Su (素)** — plain, unadorned — combined with **Ryohin (良品)** — quality without a brand asserting itself. The stated goal is to be "the background to everybody's life," not the hero of it. This is the opposite instinct from most branding work, and it's worth naming explicitly to a client or teammate before you start removing their logo treatment — it's a deliberate act, not an absence of effort.

**The test to apply to your own work:** if you strip an element and the space left behind has no job — nothing for the eye to rest on, nothing being asked of the viewer — you've made something empty in the boring sense, not the Japanese sense. Emptiness needs a "guest": a single anchor the space is clearing room for.

## In Praise of Shadows (Tanizaki, 1933)

Junichiro Tanizaki's essay is the reason elite Japanese design reaches for shadow, warmth, and low contrast where Western design reaches for brightness and clarity. His core claim: Western taste treats any shadow as a problem to be lit away, while Japanese taste finds the shadow's particular beauty and sits inside it rather than eliminating it — the same way a lacquer bowl is beautiful specifically under candlelight, not despite the dim light but because of it.

**What this changes in practice:**
- Backgrounds: warm off-white washi tones (see `design-tokens.md`), not pure `#FFFFFF`.
- Contrast: soft, not maximal — text and background should be readable, not blazing.
- Shadows: soft and glowing (ambient occlusion, diffuse), not hard drop-shadows with a crisp offset.
- Dark mode: true black `#000000`, treated as ink-wash darkness and a deliberate material, not "the site but inverted."

If a design brief wants "premium" primarily through brightness, more white, more contrast — that's the Western move, and it's fine, but it's not this skill. This skill's premium comes from restraint and shadow, not from radiance.

## The nine principles

### Kanso (簡素) — Elimination of clutter
Every element must justify its presence. This is a subtractive discipline, not a style: the process is "what can I remove?" repeated until removing more would remove meaning, not "how few colors can I use and still call it done." A page with two colors and no hierarchy is bland, not Kansō — the two are often confused (see `masters-and-pitfalls.md`).

Design translation: restrained palettes (2–3 hues), a single typeface family, generous margins, one message per screen/section.

### Ma (間) — The charged interval
Not "whitespace" — the pause *between* things, the way silence between notes is part of the music. Ma is not empty space left over after layout; it's an active material that shapes the elements around it and gives the eye somewhere to land before moving on.

Design translation: large margins that have a job (separating one idea from the next, giving a single CTA room to be the only thing in view), single-column focus rather than competing columns, deliberate pacing between sections rather than uniform stacking.

### Wabi-Sabi (侘寂) — Beauty in imperfection and impermanence
Rooted in Zen Buddhism's acceptance of transience. Values things showing the marks of time, handwork, and use — not flaws to correct, but authenticity to preserve. This is not an excuse for sloppiness: wabi-sabi objects are still highly crafted, they just don't hide the evidence of craft or age.

Design translation: subtle grain/texture over flat gradients, organic materials (wood grain, paper fiber) over glossy plastic-perfect renders, hand-drawn or slightly irregular marks used deliberately — not glitch effects, not literal sloppiness. The imperfection has to read as intentional or it just reads as unfinished.

### Shibui / Shibumi (渋い) — Understated elegance
Looks simple on first glance, reveals more complexity the longer you look. The opposite of anything designed to be immediately, loudly impressive. A quiet taste, not a loud one.

Design translation: desaturated, natural palettes (see `design-tokens.md`) instead of saturated brand RGB, restraint in motion and iconography, quality that shows up in the details (spacing precision, type pairing) rather than in a single showy hero moment.

### Fukinsei (不均整) — Balanced asymmetry
Nature is never perfectly symmetrical, and perfect symmetry reads as static or dead. Fukinsei is controlled imbalance — asymmetry that still feels resolved, not accidental.

Design translation: off-center grids, one large element balanced against several small ones rather than a mirrored layout, broken-grid overflow where a content block intentionally crosses a boundary, vertical text breaking an otherwise horizontal flow.

### Yūgen (幽玄) — Suggestion over statement
A profound, hard-to-articulate sense of beauty — mountains suggested by mist rather than fully shown. Show less to make the viewer's imagination do part of the work.

Design translation: cropped or partially obscured imagery, soft blur or fade at content edges, product reveals that show a detail rather than the whole object (this pairs naturally with WebGL/Three.js work — see this library's `creative-webgl` or `3d-scene-architect` skills for the implementation side), text that trails off rather than over-explaining.

### Seijaku (静寂) — Stillness
Less a technique than the *outcome* of applying Kanso, Ma, and Shibui correctly: an interface that feels calm, predictable, and free of competing demands on attention. If a design has all the individual techniques right but still feels busy or anxious, something upstream didn't actually resolve.

Design translation: predictable interaction patterns, gentle transitions, few simultaneous choices presented to the user at once, muted rather than jarring feedback states.

### Omotenashi (おもてなし) — Anticipatory hospitality
The tea-ceremony host's discipline of meeting a guest's need before it's spoken. In design terms: not flashy delight through surprise, but delight through the absence of friction — because anticipating and removing friction *is* the form of care being offered.

Design translation: sensible defaults that reduce decisions, micro-interactions that confirm an action without interrupting it, fast load and lean code treated as a form of respect for the user's time, personalization that adapts quietly rather than announcing "we noticed you did X."

### Shizen (自然) — Naturalness without pretense
Man-made, but doesn't feel engineered — the way a bonsai or a golf course is entirely constructed yet reads as natural. The opposite of a design that visibly performs its own cleverness.

Design translation: rounded, organic forms over rigid geometric ones where the brief allows it, materials and textures that reference nature (wood, stone, paper) rather than glass/chrome futurism, restraint in anything that would make the design look "designed" rather than found.

## Two extra terms worth knowing (not separate principles, but frequently referenced)

- **Yohaku no Bi (余白の美)** — "the beauty of remaining white." A way of saying Ma applies to whitespace specifically: it's not waste, it's the most expensive element on the page precisely because it was deliberately preserved rather than filled.
- **Kisetsu (季節)** — seasonality as a color-selection discipline. Elite Japanese palettes are usually pulled from a season (sakura pink, indigo ai-iro, sumi black, washi beige) rather than from a trend forecast. See `design-tokens.md` for the actual values.
