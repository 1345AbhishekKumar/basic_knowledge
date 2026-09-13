# Design Tokens for Web — Concrete Values

Use this file as the source of truth once a site moves from direction into actual CSS/code. Don't improvise "zen" colors or spacing ad hoc when considered values already exist here — and don't duplicate these values into other reference files; point back here instead.

## Color

Pulled from natural, seasonal (Kisetsu) references rather than a trend palette. Desaturated, warm-leaning, low contrast by default (see `principles.md` → *In Praise of Shadows*).

| Name | Hex | Use |
|---|---|---|
| Washi (paper beige) | `#F5F2ED` / `#F7F5F0` | Primary background — warm off-white, never pure `#FFFFFF` |
| Sumi (ink black) | `#1C1C1C` | Primary text / dark accents |
| True black (OLED) | `#000000` | Dark-mode background specifically — treated as ink, not "inverted light mode" |
| Ai-iro (indigo) | `#2B4565` | Accent, links, restrained brand color |
| Rikyushiro (tea-master grey-green) | `#B0B7A8` | Secondary/muted accent |
| Sakura (cherry blossom pink) | Use sparingly, desaturated — not a saturated "brand pink" | Seasonal accent only, not a primary |

Rule of thumb: 2–3 hues total, one of them doing almost all the work, the others reserved for a single deliberate accent. If you find yourself reaching for a fourth hue, that's a Kanso violation — solve it with value/shade variation on the existing palette instead.

## Typography

Japanese elite sites treat the mix of scripts (Kanji, Hiragana, Katakana, Romaji) as visual texture, not just as content. For non-Japanese-language work, the equivalent move is treating typography as a textural/compositional element, not purely a delivery mechanism for words.

- **Type family:** one serif or one well-chosen sans, used consistently. Thin/light weights read as more Shibui than bold ones — reserve bold for the single hierarchy anchor, not for emphasis generally.
- **Line height & tracking:** generous. Tight, efficient type-setting reads as Western-efficient, not Japanese-restrained.
- **Vertical writing (`writing-mode: vertical-rl`):** use as a *compositional/textural* element — a headline treated as a vertical block that breaks the horizontal grid (Fukinsei) — not as the primary reading direction for a non-Japanese-language audience. It signals editorial elegance; it shouldn't create an accessibility or comprehension problem.
- **Variable fonts:** prefer them over static weights when the budget allows — they let you dial in exactly the right weight for restraint rather than snapping to a default 400/700.

## Spacing & Layout

- **The Ma test:** take the current layout, remove roughly half the elements, and increase padding around what remains by ~300%. If the remaining message hits harder, the original was under-using Ma. If it now feels merely empty, the remaining content doesn't have enough weight to be the "guest" the space is waiting for — fix the content, not just the spacing.
- **Single-column focus:** prefer one column carrying attention at a time over multi-column layouts competing for it, especially above the fold.
- **Asymmetry (Fukinsei):** one dominant element balanced against several small ones, or an off-center grid, rather than mirrored/centered symmetry. A broken-grid overflow — one block intentionally crossing a container boundary — reads as intentional imbalance, not a bug, as long as it happens once and with purpose.

## Motion

- **Duration:** 0.8–1.2s for fades and reveals. Faster reads as Western-snappy; slower starts to feel sluggish rather than deliberate.
- **Easing:** soft, organic curves. No bounce, no elastic, nothing that calls attention to the mechanism of the animation itself.
- **Shadows:** soft and diffuse (ambient-occlusion style), not hard drop-shadows with a crisp offset — ties back to the *In Praise of Shadows* preference for soft darkness over hard contrast.
- **Micro-interactions (Omotenashi):** should confirm an action happened without interrupting the user's flow to do it — a subtle state change, not a modal or a loud toast, unless the action genuinely warrants interruption.
- **High-fidelity product reveals:** where the brief calls for inspecting an object closely (a garment, a knife, a product), WebGL/Three.js slow-rotation views suit this aesthetic well — implement via this library's `creative-webgl` skill rather than duplicating 3D setup guidance here.

## Texture (Wabi-Sabi, applied digitally)

- Subtle grain/noise overlay on large flat color areas, kept faint — the goal is "paper," not "VHS filter."
- Avoid perfectly uniform, machine-precise repetition where the brief calls for a handmade feel — slight, deliberate irregularity in spacing or alignment can read as craft rather than error, but only when it's consistent enough to look intentional. When in doubt, keep it uniform; inconsistent-looking irregularity reads as a bug, not as wabi-sabi.
