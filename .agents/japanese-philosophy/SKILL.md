---
name: japanese-philosophy
description: >-
  Apply authentic Japanese design philosophy — Ma, Kanso, Wabi-Sabi, Shibui, Fukinsei, Yūgen, Seijaku, Omotenashi — specifically to web design: hero sections, landing pages, full marketing sites, and web UI micro-interactions. Use whenever the user wants a "Japanese", "MUJI-style", "zen", "quiet", "understated luxury", or "elegant minimalism that isn't flat/generic" website, or references Kenya Hara, MUJI, Ma, wabi-sabi, negative space as material, or "In Praise of Shadows" for the web. Also trigger with no word "Japanese" present, whenever a web request describes negative space as active rather than leftover, emptiness that invites rather than just clears clutter, or a site that should feel expensive through restraint rather than ornament. This is the philosophy/decision layer for the web — pair with this library's frontend-design, web-design-pro, hero-section-architect, or creative-webgl skills for the actual code once direction is set.
---

# Japanese Design Philosophy for Web Design

## The distinction that unlocks everything

Western minimalism removes clutter to clarify: "nothing unnecessary remains." It's closed and solved — a Dieter Rams object tells you exactly what it does.

Japanese design removes clutter to invite: "space for you to complete." Kenya Hara's example is the plain wooden handle of a sushi knife — it imposes no grip, so it can receive the chef's own technique. It's open and waiting.

Practically: if a web page is empty and that emptiness has no job to do, it isn't Japanese minimalism — it's just unfinished. Every use of this skill should be able to answer "what is this space waiting for?"

Read `references/principles.md` for the full grounding (the nine principles, plus Tanizaki's *In Praise of Shadows*) before applying any of this to a real deliverable. It's the single source of truth for what each principle means — don't rely on the one-line table below for anything beyond a quick refresher.

## Step 0: Which Japan is this web brief actually asking for?

Real Japanese web design runs on a density paradox, and this skill only covers one side of it on purpose:

- **Elite / philosophical pole** — MUJI, UNIQLO, TeamLab, luxury and award-winning portfolios. Ma-driven, restrained, quiet. **This is what this skill is built for.**
- **Dense / commercial pole** — Yahoo! Japan, Rakuten, Kakaku.com. Packed screens, 30+ links above the fold. This is not bad design — in a risk-averse, high-context market, hiding content reads as hiding value, and density signals trust and scale. Kanji also carries more meaning per character than English, so density stays readable in a way it wouldn't in Latin script.

Default to the elite pole unless the brief is specifically a mass-market, trust-through-abundance web e-commerce context aimed at Japanese users — in that narrow case, applying Ma-heavy whitespace would work against the goal, and the right move is to say so rather than force this skill's aesthetic onto it.

## Workflow

1. **Identify the web surface** (hero section, landing page, full marketing site, web UI / micro-interaction). Read `references/applications.md` for how the principles execute differently per web surface — don't assume hero guidance transfers 1:1 to a full site scroll or checkout flow.
2. **Select 2–4 principles that solve the actual web problem**, not all nine at once. A cluttered hero needs Kanso + Ma. A flat, characterless landing page needs Shibui + Wabi-Sabi. A static, dead-feeling layout needs Fukinsei. Piling on every principle at once produces the same incoherence this skill exists to prevent.
3. **Pull concrete values from `references/design-tokens.md`** — colors, type approach, spacing/motion specs. Treat it as the single source of truth for tokens; don't invent a "zen palette" ad hoc when a considered one already exists there.
4. **Self-audit against `references/masters-and-pitfalls.md`** before delivering. It documents the specific ways this aesthetic gets cargo-culted, and a design that fails that check will read as costume, not philosophy.

## Quick reference (see principles.md for the real thing)

| Principle | Kanji | One-line cue |
|---|---|---|
| Kanso | 簡素 | Remove until removing more would remove meaning |
| Ma | 間 | The pause is doing work, not just sitting empty |
| Wabi-Sabi | 侘寂 | Beauty in the imperfect, aging, and handmade |
| Shibui | 渋い | Understated on the first look, richer on the tenth |
| Fukinsei | 不均整 | Balance through asymmetry, not mirrored symmetry |
| Yūgen | 幽玄 | Suggest, don't fully reveal |
| Seijaku | 静寂 | Stillness as the felt outcome of everything above |
| Omotenashi | おもてなし | Anticipate the user's need before they ask |
| Shizen | 自然 | Man-made, but never announces that it's man-made |

## Before you hand off the deliverable

- Can you name what the negative space is waiting for? If not, add function or remove the space.
- Is there one clear hierarchy anchor per viewport, not two or three competing ones?
- Are colors desaturated and chosen for a reason (season, material, ink), not just "muted because muted looks premium"?
- Is motion 0.8–1.2s with soft easing — nothing bouncy, nothing that announces itself?
- Would Kenya Hara's next question be "what else can come out"?

If any answer is no, revise before delivering — this is the fastest way this skill's output gets mistaken for generic minimalism instead of the philosophy it's meant to carry.

## Reference files

- `references/principles.md` — the nine principles in depth, the emptiness-vs-minimalism distinction, and Tanizaki's *In Praise of Shadows*. Read this first, every time.
- `references/design-tokens.md` — concrete hex palettes, typography approach (including when vertical `writing-mode` earns its place), spacing and motion specs. Read when you're about to write actual CSS/code, not just talk direction.
- `references/applications.md` — how the same principles translate differently across hero sections, landing pages, full sites, and web UI micro-interactions. Read for web-surface-specific execution.
- `references/masters-and-pitfalls.md` — MUJI/Kenya Hara, Tadao Ando, and Tanizaki as concrete references, plus the recurring mistakes that turn this into cargo-cult minimalism. Read before final delivery, or whenever the user wants sources to study further.
