# Interactive HTML Lesson Specification

This document defines every requirement a self-contained HTML lesson must satisfy.
All diagrams must be built with pure SVG, CSS, or Canvas — **except for (a) 3D scenes, where Three.js (CDN) is permitted, and (b) 2D physics scenes, where Matter.js (CDN) is permitted**. No other external libraries. The only allowed externals are the two pinned CDN URLs in §9.

## 1. File Naming Rules (Mandatory)

- **Transcript file:** Must be `<Real Video Title>.txt` sanitized (replace \ / : *? " < > | with _, collapse whitespace, trim, limit 120 chars, preserve Title Case). Example: "How Gravity Works? (Explained)" -> "How Gravity Works (Explained).txt". Never `transcript.txt`.
- **HTML file:** Must be `<Central Topic>.html` where central topic is distilled from transcript, typically same as or refined transcript filename stem (which equals the sanitized video/page title). Example: `Why Black Holes Evaporate.html`. Never `lesson.html`, `index.html`, or `transcript.html`.
- **Sanitization:** Replace invalid chars with _, collapse whitespace, limit 120 chars, preserve Title Case and spaces.
- **Repo boundary:** Both files must live inside the current repo. Never save or read outside the repo root.

## 2. Design Taste & Anti-Slop Rules (Mandatory)

- **Design system (per-lesson, never the same default):** Internalise Design Taste, structure, interactive and detail rules first — then pick a DIFFERENT aesthetic per lesson to fit THIS transcript's topic (e.g. marine biology → deep-sea palette, history → archival parchment, space → ink-black starfield, economics → ledger minimalism). Japanese philosophy (Ma, Kanso, Shibui, Wabi-Sabi) is one valid option, never the automatic one. When the skill is installed as a sibling (`../japanese-philosophy/`), its `references/design-tokens.md` is the source of truth ONLY when the Japanese option is chosen (see SKILL.md Step 6). Otherwise derive an equivalent token set for the chosen aesthetic and document it in 1 line (name + 2–3 tokens + why it fits the topic).
- **Palette (per-lesson):** Derive background / ink / accent / secondary from the chosen design system to fit the topic. Constraints always hold: 2–3 hues max, one hue doing almost all the work, body background never pure `#FFFFFF`, dark mode never an inverted light mode (true dark material with re-lightened accent for ≥4.5:1). Example (Japanese option): Washi `#F5F2ED`, Sumi `#1C1C1C`, Ai-iro `#2B4565`, Rikyushiro `#B0B7A8`; dark = true black `#000000` as ink-wash material.
- **Editorial minimalism:** Thin strokes (`stroke-width="1.5"`), generous whitespace, muted editorial palette. No heavy shadows, no gradients, no glassmorphism, no emojis in headings.
- **Typography:** One serif or one well-chosen sans — system: Georgia / Times headings, Inter / -apple-system body. Thin/light weights read as more Shibui — reserve bold for the single hierarchy anchor. Generous line height and tracking. Max 70ch line length. No more than 2 font weights.
- **Spacing (Ma):** The pause is active material, not leftover whitespace — every empty area must answer "what is it making room for?" Single-column focus. Asymmetry (Fukinsei): one dominant element balanced against several small ones, at most one deliberate broken-grid overflow.
- **Motion:** 0.8–1.2s fades/reveals with soft, organic easing — no bounce, no elastic. Soft diffuse shadows (ambient-occlusion style), not hard drop-shadows.
- **Texture (Wabi-Sabi):** Subtle grain/noise overlay on large flat color areas, kept faint — "paper", not "VHS filter".
- **No slop phrases:** Avoid "dive into", "delve", "unlock", "in today's fast-paced world", "game-changer", "revolutionary". Write like a clear human teacher.
- **Economy (Kanso):** Every visual must teach. No decorative icons or stock illustrations. Remove until removing more would remove meaning.
- **Layout Variation mandatory:** Never default to a single-column essay. Pick the layout per §2 on pedagogical fit for THIS transcript only — never by scanning sibling lessons.
- **Design Variation mandatory:** Never reuse the same aesthetic twice in a row by default. Layout is the skeleton, design system is the skin — both must be chosen per lesson for topic fit and noted before coding (layout name + design-system name + 1-line why).
- **Dark/light:** Toggle is small icon (top-right), smooth transition, respects prefers-color-scheme; dark mode is true-black ink, not inverted light.

### Layout Variation System — Pick one per lesson on content fit, never by scanning the workspace

The 7 layouts below are structural skeletons; the per-lesson design system (Section 2 above) is the aesthetic layer applied on top of whichever layout is chosen. Choose solely on what THIS transcript needs (process/sequence -> Timeline Rail or Lab Manual; reference-heavy -> Split Atlas or Magazine Grid; narrative -> Editorial Scroll or Field Notes; independent concepts -> Card Deck). Do NOT list, open, or compare sibling HTML files. Exclude Editorial Scroll unless the content genuinely demands it — it is the closest to a default essay. If the user named a theme, honour it.

1. **Editorial Scroll:** Long-form article with sticky side knowledge map, modules as chapters.
2. **Split Atlas:** Left nav rail with module cards, right content pane. Knowledge map top.
3. **Card Deck:** Horizontal scroll of module cards, each card expands into lesson.
4. **Timeline Rail:** Vertical timeline on left, modules are nodes.
5. **Field Notes:** Notebook aesthetic — margin notes for misconceptions and why-it-matters.
6. **Magazine Grid:** 2-col grid, visuals bleed, text in columns.
7. **Lab Manual:** Procedure-first layout with steps and visuals side-by-side.

### Self-sufficient token block (Japanese example + remap contract for any chosen system)

```css
:root {
  /* Palette */
  --washi: #F5F2ED;      /* background — warm off-white, never pure #FFFFFF */
  --sumi: #1C1C1C;       /* primary text — ink */
  --ai-iro: #2B4565;     /* accent — one hue doing almost all the work */
  --rikyushiro: #B0B7A8; /* secondary — muted sage grey */

  /* Typography */
  --font-heading: Georgia, 'Times New Roman', serif;
  --font-body: Inter, -apple-system, 'Segoe UI', sans-serif;

  /* Spacing (Ma) */
  --space-1: 8px;   /* intra-element */
  --space-2: 16px;  /* between related elements */
  --space-3: 32px;  /* between sections */
  --space-4: 64px;  /* major pauses — the pause is active material */
  --measure: 70ch;  /* max line length */

  /* Motion */
  --dur-fade: 0.9s;       /* range 0.8–1.2s */
  --ease-organic: cubic-bezier(0.25, 0.1, 0.25, 1); /* soft, no bounce/elastic */
}

body.dark {
  --washi: #000000;  /* true black treated as ink-wash material, not inverted light */
  --sumi: #EDEAE4;   /* lifted paper tone for text */
  --ai-iro: #7C97B8; /* accent lightened for >=4.5:1 contrast on black */
  --rikyushiro: #6E7566;
}
```

Additional fallback rules: max 2 font weights (reserve bold for the single hierarchy anchor); thin strokes 1.5 in all SVG; subtle grain overlay kept faint on large flat areas; soft diffuse ambient-occlusion shadows, no hard drop-shadows; no gradients, glassmorphism, or emojis in headings. When a non-Japanese system is chosen, keep these rules and the same var names (`--washi/--sumi/--ai-iro/--rikyushiro` = background/ink/accent/secondary) — only the hex values + fonts change to fit the topic — so §5B diagrams remap automatically.

## 3. Structure (brief, one win per module)

- **What You'll Learn:** outcome-focused, plain language. If N ≤ 5: one bullet per module (3–5 bullets). If N > 5: 5–8 outcome bullets grouping related modules (name covered modules in each bullet). Each bullet = one tangible win in ≤15 words.
- **Knowledge Map:** Minimal monochrome SVG, interactive hover to jump to module, line art only. Must list all N modules; when N > 12, group into labelled clusters but keep every module jumpable.
- **Modules (N modules, scaled to transcript — no 5-module cap):** First survey the FULL transcript, count distinct majors = N, then build N modules (3–5 for short, 6–12 for medium, 13+ up to 30–40 for long/course-length transcripts). Each has H2 with number, Core Explanation 80–120 words simple conversational, Step-by-Step Breakdown (3–5 short bullets max), 3 Short Examples, Visual Analogy Card (1–2 lines), What People Get Wrong (1 line), Why This Matters (1 line), Inter-Module Link (within THIS lesson only — never to sibling lessons), Compact Scenario (2–3 decision points with consequences, reveal-style).
- **Example quality (better for understanding):** Every module has exactly 3 concrete + everyday examples covering 3 angles: 1 obvious, 1 counter‑intuitive, 1 edge‑case/limit. Format: **What:** 1-line situation → **So what:** 1-line takeaway. Prefer daily-life / work situations over abstract definitions. One example = one use. No jargon without a plain-word definition first.
- **Brevity rule:** One tightly-scoped idea per module. Short sentences, Grade-8 reading level, one claim per paragraph. Cut anything not needed to use that idea. Order modules simple -> complex so each win builds on the last (within-lesson progression: challenging, never overwhelming). Assume a first-timer — never skip an explanation because a sibling lesson may have covered it.
- **Broad-topic / long-transcript rule:** NEVER cap at 5 modules. If the video covers many ideas (6+ majors, 3hrs+, course-length), give EACH major its own module (N modules, 30–40 allowed). CLUSTER only small sub-points, repeats, and asides as 1-line bullets inside the closest module, not new modules. Extra reminders go to FAQ / Cheat Sheet only — never park a first-teach major there. Keep each module brief (same 80–120 word budget) so long lessons stay manageable.
- **One tangible win:** Frame the whole lesson around a single thing the learner can now do; each module is a stepping stone to it. What You'll Learn bullets name those wins in plain language.
- **Primary source:** Explicitly recommend the original transcript/video/article as the primary source to read or watch — point to the exact segment each module came from. This goes in the footer source line and in Next Steps.
- **Footer (mandatory, tiny):** Source line linking the original video/article URL (the transcript source) + one line: "Stuck? Ask the agent a follow-up question about any module."

## 4. Content Depth (simple + brief, not deep)

- Conversational, second-person friendly, but precise. Short sentences. Define every term in plain words on first use.
- Teach the idea at use-level: what it is + when to use it + one gotcha. Skip deep theory, derivations, or edge-case debates unless the transcript makes them essential.
- Every module 80–120 words core explanation. If transcript says a term, define it in 1 line — no extra padding.
- **Grounding:** Teach only what is in the transcript. Never invent facts from parametric knowledge. If the transcript is thin on a point, say so briefly rather than padding.
- **Working memory:** Chunk aggressively. One claim per paragraph, one idea per visual. Progressive disclosure (expandables) over long scrolls.
- **Consistent terms:** Pick one name per concept, define on first use, reuse it everywhere including the Cheat Sheet. Never swap synonyms mid-lesson.
- **Simple-teaching rule:** Prefer everyday words over technical words. If you must use a technical word, follow it with "(= plain meaning)" once. Prefer "you" examples: "When you…".

## 4B. Teaching Craft (storage strength, not fluency)

Borrowed from teaching science, adapted to a single brief HTML lesson. No workspace files, no communities — just what makes the HTML teach better.

- **Storage over fluency:** An easy re-read feels like mastery but fades. Design for long-term retention via desirable difficulty: effortful recall beats passive review.
- **Effortless knowledge, effortful retrieval:** Reading should feel easy — short sentences, one claim per paragraph, every term defined before use (for acquiring knowledge, difficulty is the enemy). All desirable difficulty lives in the retrieval exercises, never in the comprehension itself.
- **Retrieval practice:** Every module ends with a 1-question recall prompt (answer hidden until the learner attempts). The final Cheat Sheet is recall-first: term visible, definition revealed on click.
- **Spacing (in-lesson):** Revisit each core idea twice — once in its module quiz, once in Summary/FAQ or the Knowledge Check. Never introduce-then-abandon.
- **Interleaving (skills only):** When quizzes drill related concepts, mix them (A-B-A-B) instead of blocking (AAA-BBB). Do not interleave pure facts that were just introduced.
- **Tight feedback loop:** Every interactive element gives immediate, automatic feedback with a one-sentence explanation of *why*. No dead buttons, no delayed scoring except the final test.
- **No-clue options:** Quiz/MCQ answers must be exactly the same number of words (identical character count where possible) and parallel phrasing. Never let formatting or length hint the answer.

## 5. Visualizations & Diagrams (simple first for brevity)

- One simple visual per module — prefer static SVG. Use image placeholder, SVG animation, Matter.js, or 3D only when they teach clearly better than a static diagram (choose per §13 three-question test; ask the user if unsure). For brief lessons, default to static SVG.
- **SVG Diagram Rules:** Pure SVG, viewBox, no external images, stroke-linecap round, labels via `<text>`, thin strokes. All diagrams MUST use the §5B diagram system (shell + 7 SVG classes + unique marker ids) — it is what makes diagrams look clean instead of ad-hoc.
- **Conditional diagram-design use (grammar only, technical topics only):**
  - USE ONLY for software / AI agents / architecture / data flow / infra / API / DB / dev workflow topics where a proper architecture / flowchart / sequence / state / ER / deployment / dependency diagram teaches better than a plain §5B sketch.
  - DO NOT USE for philosophy, economics, chemistry, general science appearance, history, biography, habits, psychology — never open diagram-design for these.
  - When used: borrow ONLY layout grammar (box roles, orthogonal routing, budgets, what to cut/split) from diagram-design §3 + one `type-*.md`. NEVER its design system: no `style-guide.md` defaults (`#f5f5f5` / `#2d3142` / `#eb6c36`), no Instrument Serif / Geist / JetBrains Mono, no dot-paper, no template chrome, no §0 onboarding gate. Always re-skin into §5B shell + 7 classes + per-lesson theme vars + dark-mode vars.
- **Image Placeholder Rules:** Use ONLY when photo reality needed. Never ship a placeholder without alt text + caption. Implement as:
  ```html
  <figure class="photo-placeholder">
    <div class="placeholder-box" role="img" aria-label="Detailed alt description here"></div>
    <figcaption>Caption: what learner should see, source suggestion.</figcaption>
  </figure>
  ```
  - **CSS:** dashed border 1.5px #bbb, background repeating linear pattern of transparent pixel, min-height 280px, centered alt text, muted.

## 5B. Diagram Design System (mandatory — this is what "clean" means)

Every SVG diagram in the lesson MUST share one shell, one class vocabulary, and one sizing contract, copied from the proven reference lesson. No per-diagram improvisation.

### 5B.1 Theme-aware tokens (works in washi light AND true-black dark)

Define once in `:root` and override in dark mode. SVG classes below reference ONLY these vars — never hardcode `#151518` etc., so diagrams adapt to the light/dark toggle:

```css
:root {
  --panel: #FFFFFF;  /* light-mode surface (washi lesson bg stays #F5F2ED; panels white) */
  --panel-2: #EFEAE2;
  --node: #FFFFFF;   /* .svg-node fill in light mode */
  --node-strong: #EDE8DF;
  --border: rgba(28,28,28,.14);
  --border-strong: rgba(28,28,28,.28);
  --text: #1C1C1C;
  --muted: #5A5A5E;
  --muted-2: #8A8A90;
  --line: rgba(28,28,28,.40);
  --line-dim: rgba(28,28,28,.16);
  --chip: #F0ECE5;
}
body.dark {
  --panel: #121214;
  --panel-2: #17171a;
  --node: #151518;
  --node-strong: #1a1a1e;
  --border: rgba(255,255,255,.10);
  --border-strong: rgba(255,255,255,.16);
  --text: #f4f4f5;
  --muted: #a1a1aa;
  --muted-2: #71717a;
  --line: rgba(255,255,255,.35);
  --line-dim: rgba(255,255,255,.15);
  --chip: #111114;
}
```

### 5B.2 Diagram shell (identical chrome on every diagram)

```html
<div class="diagram-wrap">
  <div class="diagram-toolbar">
    <div>
      <div class="diagram-title">From Chatbot to Worker</div>
      <div class="diagram-subtitle">One sentence: what the diagram proves.</div>
    </div>
  </div>
  <div class="diagram-stage">
    <svg viewBox="0 0 1000 400" role="img" aria-label="..."><title>...</title><!-- nodes --></svg>
  </div>
</div>
```

```css
.diagram-wrap { border: 1px solid var(--border); border-radius: 20px; background: var(--panel); overflow: hidden; margin-top: 34px; }
.diagram-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 13px 17px; border-bottom: 1px solid var(--border); gap: 10px; flex-wrap: wrap; }
.diagram-title { font-size: 12px; font-weight: 700; color: var(--text); }
.diagram-subtitle { font-size: 11px; color: var(--muted-2); }
.diagram-stage { min-height: 440px; padding: 25px; overflow: auto; } /* static SVG diagrams: 440px min. Separate from §13 .viz3d/.vizphys containers (320px min for 3D/physics). */
.diagram-stage svg { width: 100%; min-width: 680px; height: auto; display: block; }
/* Sole exception: hero illustration may use min-width:0 so it never scrolls. */
```

### 5B.3 The 7 SVG classes (only vocabulary allowed inside diagrams)

```css
.svg-node { fill: var(--node); stroke: var(--border-strong); stroke-width: 1; }
.svg-node-strong { fill: var(--node-strong); stroke: var(--border-strong); stroke-width: 1.2; }
.svg-text { fill: var(--text); font-size: 13px; font-weight: 700; }
.svg-small { fill: var(--muted); font-size: 10px; }
.svg-mono { fill: var(--muted-2); font-size: 10px; font-family: Consolas, monospace; }
.svg-line { stroke: var(--line); stroke-width: 1.2; fill: none; }
.svg-line-dim { stroke: var(--line-dim); stroke-width: 1; fill: none; }
```

Rules: exactly 3 text roles (TEXT = value, small = description, mono = meta/index). Exactly 2 line weights. ONE `-strong` node per diagram (the key concept); everything else is `.svg-node`. Corner radius 8–18px, no gradients, no glow filters, no drop shadows inside SVG. Arrows: 10px markers, `orient="auto"`.

### 5B.4 Unique marker ids (mandatory bug fix)

Each `<svg>` MUST define its own marker with a namespaced id (`arr-m2`, `arr-m3`, …) and reference only that id. NEVER reuse `id="arrow"` across diagrams — duplicate ids make all arrows after the first point at the wrong color/angle or disappear:

```html
<svg viewBox="0 0 1000 400" role="img" aria-label="Level diagram">
  <defs><marker id="arr-m2" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--line)"/></marker></defs>
  <path d="M315 197 L385 197" class="svg-line" marker-end="url(#arr-m2)"/>
</svg>
```

### 5B.5 Section rhythm (same header on every module)

```html
<div class="section-head">
  <div class="section-index">01 / FOUNDATION</div>
  <div>
    <div class="section-label">Start here</div>
    <h2>Chatbot ≠ agent ≠ worker.</h2>
    <p class="section-intro">2–3 lines of context, max 730px wide.</p>
  </div>
</div>
```

```css
.section-head { display: grid; grid-template-columns: 170px 1fr; gap: 35px; margin-bottom: 46px; }
.section-index { color: var(--muted-2); font-family: Consolas, monospace; font-size: 12px; padding-top: 8px; }
.section-label { color: var(--muted-2); font-size: 11px; text-transform: uppercase; letter-spacing: .15em; margin-bottom: 9px; }
/* h2: clamp(34px,5vw,58px), letter-spacing:-.055em, line-height:1. Collapse .section-head to 1 column under 780px. */
```

### 5B.6 Card grids (reuse, don't redesign)

- 3-col `comparison` / `concept-grid`, 2-col `terms-grid` / `deploy-grid`, 4→2→1-col `security-flow`, `cheat-table` rows (180px term + 1fr explain). All cards: `border:1px solid var(--border); border-radius:15–18px; background:var(--panel); padding:21–26px;` hover: `translateY(-3px)` + `border-color:var(--border-strong)`. Number/tag chips use `.svg-mono` styling (10–11px mono, muted-2).

## 6. Interactivity (scaled to N — minimum 4)

- Approved list: Flashcards (click to flip), Drag-and-drop match terms/definitions, Module quiz (1-2 Q per module — every module gets at least 1 Q, so long lessons have N+ quizzes), Slider to reveal steps, Toggle analogy, Expandable misconception, Copyable cheat-sheet, Progress-linked checklist, Compact scenario (2–3 decision points with consequences, reveal-style), Hotspot diagram (clickable labelled regions for part-identification, built with §5B SVG + buttons). Accordion term cards, live search filter, step-builder (`Trigger→Context→Think→Act→Verify→Report`), and a RAG-style staged pipeline all count when built per the canonical patterns below.
- All vanilla JS, no libs, styled with economy.
- **Feedback rule:** Each item above must reveal correctness instantly + one-sentence why. Module quizzes: 1 recall Q per module minimum (feeds the spacing rule in 4B).
- **Canonical patterns (copy these shapes — they are proven in the reference lesson):**
  - *Accordion (no height JS):* `.term-body { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; } .term-card.open .term-body { grid-template-rows:1fr; }` with inner `overflow:hidden`. Toggle `.open` on header click; chevron rotates. Add Expand-all + live count.
  - *Live search:* filter on `(card.dataset.term + ' ' + card.textContent).toLowerCase().includes(query)`; update `N / total visible`; `/` focuses, `Esc` clears.
  - *Step builder:* one `setWorkflowStep(i)` drives `data-step` buttons AND `data-flow` nodes AND explain panel (`innerHTML = stepDescriptions[i]`). Never three separate handlers.
  - *Quiz engine:* single `renderQuiz()` state machine (`quizIndex/quizScore/answered`), disable options after answer, mark correct green / wrong red + show correct, `Next` gated on `answered`.
  - *Reveal-once:* `IntersectionObserver(threshold:.08)` adds `.visible`, then `unobserve`. CSS: `.reveal{opacity:0;transform:translateY(18px);transition:.65s ease} .reveal.visible{opacity:1;transform:none}`. Never re-hide.

## 7. Progress & Navigation

- Sticky topbar (72px, blur) with brand, anchor nav, and `% complete` status. Thin top progress bar (2px) linked to scroll.
- Scrollspy: `IntersectionObserver` with `rootMargin:'-20% 0px -65% 0px'` toggles `.active` on the matching nav anchor. Knowledge Map highlights current module the same way.
- Smooth scroll with sticky-header offset (scroll to `rect.top + scrollY - 82`, `behavior:'smooth'`). Respect `scroll-padding-top:90px`. Keyboard accessible (`/` focuses search, `Esc` clears).
- Persist progress + theme in `localStorage` (keys `lesson-progress`, `lesson-theme`; JSON, try/catch so `file://` / private mode never throws). Restore theme before first paint, restore checklist/quiz progress on load. No cookies, no external store.

## 8. Memory Techniques

- Mnemonic sentence, spaced recall prompt, analogy recall — integrated as small pill cards, not noisy.
- Prefer recall-from-memory prompts ("Write the 3 steps before expanding") over re-reading. Each mnemonic must be testable by a quiz Q.

## 9. Code & Asset Rules

- Single HTML file, inline CSS + JS.
- Only externals allowed (default pins, no other CDNs):
  ```html
  <!-- default pins — Three.js only if a 3D scene exists -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- default pins — Matter.js only if a physics scene exists -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  ```
  Include a library `<script>` tag ONLY on lessons that actually use it (Three.js only if a 3D scene exists, Matter.js only if a physics scene exists). Never include an unused library.
- Why r128 global build is the default (not modules): it exposes a plain `THREE` global that works when the file is double-clicked via `file://`. Newer Three.js major builds typically require `<script type="module">` + import maps, which break on `file://` and break the single-file guarantee.
- Upgrade policy (mandatory before changing a pin): the pins above are defaults, not forever-frozen. A newer patch/minor version is allowed ONLY if ALL hold: (1) plain global `<script src>` build with no `type="module"`, no import maps, no `three/examples/*` / `three/addons/*` / `OrbitControls`; (2) `file://` double-click still runs with zero console errors; (3) the §13 boilerplates run unchanged except the version URL (same `THREE` / `Matter` globals, same inline orbit / runner API); (4) offline/CDN-blocked fallback still teaches via static SVG; (5) SKILL.md Step 8 QA re-run is all-PASS on one 3D lesson and one physics lesson. Record the chosen versions in an HTML comment at the top of the file. Never add other libraries (no Tailwind, GSAP, external fonts, analytics, or extra CDNs) without the same QA gate.
- No external fonts, no analytics, no Tailwind, no GSAP, no other CDN.

## 10. Accessibility

- All SVGs have `<title>` and aria-label.
- Keyboard navigable flashcards/quizzes.
- Color contrast >=4.5:1.
- Every animation/3D has caption or aria-label.

## 11. Summary, FAQ, Next Steps

- **Summary & Cheat Sheet:** table of concepts, definitions, formulas. This table is the canonical terminology — same terms as the modules, recall-first (click to reveal).
- **FAQ:** confusion points from transcript (“Still Confused?”). Short lessons: 3–5 questions. Long lessons (N > 12): scale to 8–12, grouped by module cluster. Each answer is paragraph-length (2–4 sentences), plain words, ends with the one takeaway to remember.
- **Next Steps:** 2-3 actions to apply knowledge, plus one real-world practice suggestion (wisdom): explain the topic to someone, apply it to a real situation, or try it in a relevant community.
- **Source + follow-up footer:** Link the original source URL under Summary and recommend it as the primary source to read or watch (with the segment each module came from), then the ask-the-agent reminder from Section 3.

## 12. Final Assessment — Test Your Knowledge (only when user says yes)

- 15 questions minimum (5 recall, 5 application, 5 synthesis) for short lessons (N ≤ 5) — jointly covering definitions, processes/steps, analogies, and application. For long lessons (N > 12), scale up so every module cluster is sampled (at least 1 Q per 2 modules, e.g. N=30 -> 20–30 Qs), keeping the recall/application/synthesis balance.
- Mix: MCQ, true/false with explanation, drag-match. Same rules as §4B/§6: immediate feedback + why, equal-length options. Every option (correct and distractors) gets a 1-sentence why — never bare “correct/incorrect”.
- Score + explanations on submit, no external deps. Related Qs interleaved, not blocked.

## 13. Animations & 3D

### When to Use

**This section is the canonical visual-medium decision table.** SKILL.md Steps 2–4 summarize it; if any wording conflicts, this section wins.

Pick the visual medium per concept with a three-question test, in order:

1. **Does the learner need to SEE the real thing?** (appearance, identity, actual parts/ports/components, a specific product/person/landmark/scene, histology slides, real apparatus) → **Image placeholder (photo)**, not 3D, not physics. Being physically 3D is not enough: a motherboard or CPU is 3D hardware, but learners need to recognize the real board and its slots, so a labelled photo teaches better than a 3D reconstruction.
2. **Does 2D Newtonian physics with gravity/collision/stacking teach what a staged diagram cannot?** (falling bodies landing together, pendulum knock-on, balance/stacking, seesaw, domino chain, bouncing projectile where restitution matters, and the learner benefits from play/replay with real motion) → **Matter.js physics scene**. If the motion is a fixed sequence with no forces (request lifecycle, blood-flow steps), prefer SVG animation even if things "move".
3. **Does interacting in 3D space teach what a photo or 2D diagram cannot?** (orbits, protein folding, cross product, mechanical assemblies best viewed from multiple angles) → **Three.js 3D Scene**. Otherwise → **SVG animation** for 2D processes, or **static SVG** for relational/data concepts.

**SVG Animation (default for processes):** For any dynamic process, mechanism, cycle, or sequence in 2D. This is the go-to medium for explaining how something works step-by-step. Examples:
- Mechanical actions (rifle bolt cycling, gear train, trigger mechanism sear/hammer/firing pin)
- Wave propagation, signal flow without collision physics
- Biological processes (blood flow, photosynthesis, cellular respiration steps)
- Technical workflows (data flow in a pipeline, request lifecycle, tool-call loop)
- Mathematical transformations (morphing shapes, equation evolution square->circle, secant->tangent)

**Matter.js physics scene (only for real 2D forces):** Falling objects / gravity demos, pendulums that collide, stacking / stability / balance, seesaws and levers under load, domino chains, projectile bounce. If there is no gravity, collision, or restitution insight, do not use Matter.js.

**Three.js 3D Scene:** For concepts that require spatial, three-dimensional understanding. Use when flat 2D would lose critical depth. Examples:
- 3D anatomy (skull, molecular structures, protein folding)
- Gravitational orbits, solar system
- 3D vector mathematics (cross product, vector fields)
- Complex mechanical assemblies best viewed from multiple angles

**Choice rule:** Prefer SVG animation for 2D processes. Use Matter.js only when real 2D physics adds indispensable insight. Use Three.js only when the third dimension adds indispensable insight. Being a physical 3D object alone does not justify a 3D scene — if the learner needs to see/identify the real object, use an image placeholder.

**If you cannot decide between photo, physics, 3D, or another medium for a concept, ask the user before building. Never silently guess between photo, physics, and 3D.**

### Hard bans — these are the documented reasons animations ship broken

- NEVER use SMIL `<animate>`, `<animateTransform>`, or `<set>` (including `begin="indefinite"` + `xlink:href` + `beginElement()`). It is deprecated, behaves inconsistently across browsers, and agents routinely forget the `beginElement()` call or leave a dead `<animate>` tag that conflicts with the JS opacity driver. Past lessons shipped exactly this dead-tag bug. Use the CSS/JS staged pattern below instead.
- NEVER use `THREE.OrbitControls`, `three/examples/*`, `three/addons/*`, or any OrbitControls CDN. The pinned r128 global build has no `THREE.OrbitControls` — referencing it throws `ReferenceError` and kills the entire inline `<script>` (all quizzes/flashcards below it stop working). Use the inline drag-orbit pattern in the Three.js boilerplate.
- NEVER use `<script type="module">` or import maps for Three.js/Matter.js. They break on `file://` double-click and violate the single-file guarantee. Use only the plain `<script src="...">` pins in §9.
- NEVER mix two drivers on one visual (e.g. SMIL tag + JS opacity, or CSS animation + rAF writing the same attribute). One visual = one owner.
- NEVER reuse an element `id` across modules, and NEVER use bare globals (`tick`, `loop`, `playing`, `spin`, `scene`, `engine`). Every visual gets a unique prefix (`m2-`, `m4-`, …) and its own IIFE scope.

### SVG Animation Implementation (canonical — staged highlight, always works)

Use this for any dynamic process, mechanism, cycle, or sequence in 2D (gear train, request lifecycle, blood flow, equation morph). It has no SMIL, no library, and degrades cleanly.

- Markup: one `.anim-wrap` per animation. Stages are plain SVG groups/paths whose `opacity` is driven by JS. Buttons are real `<button>` elements with unique ids.
  ```html
  <div class="anim-wrap" id="m5-anim">
    <svg viewBox="0 0 600 220" role="img" aria-label="Tool-use loop in 3 stages">
      <title>Tool-use loop stages</title>
      <g id="m5-s1" opacity="1"><!-- stage 1 shapes --></g>
      <g id="m5-s2" opacity="0.15"><!-- stage 2 shapes --></g>
      <g id="m5-s3" opacity="0.15"><!-- stage 3 shapes --></g>
    </svg>
    <div class="ctrls">
      <button type="button" id="m5-play">▶ play</button>
      <button type="button" id="m5-replay">Replay</button>
    </div>
    <p class="stage" id="m5-cap" aria-live="polite">Press play to step through the stages.</p>
  </div>
  ```
- Behaviour: `play` steps through `stages` on a single `setInterval` (≈1600–1800ms per stage); `replay` clears the timer and restarts from stage 0. Current stage `opacity:1`, others `0.15`, with `transition: opacity .9s cubic-bezier(.25,.1,.25,1)`. Caption updates per stage. Timer is cleared when the wrap leaves the viewport (IntersectionObserver) and when the tab hides.
- Style: thin strokes 1.5, muted palette, living diagram not cartoon. Max one moving emphasis at a time; never animate more than ~6 elements at once.
- Motion safety: if `matchMedia('(prefers-reduced-motion: reduce)')` matches, do NOT auto-play; leave stage 0 visible and let the user step with play.
- Reference JS shape (adapt ids, keep structure — IIFE, no globals, prefixed ids):
  ```js
  (function(){
    var ids=['m5-s1','m5-s2','m5-s3'];
    var caps=['Stage 1 — …','Stage 2 — …','Stage 3 — …'];
    var play=document.getElementById('m5-play'), rep=document.getElementById('m5-replay'), cap=document.getElementById('m5-cap');
    var wrap=document.getElementById('m5-anim'), idx=0, timer=null;
    function show(i){ ids.forEach(function(id,k){ var el=document.getElementById(id); if(el) el.style.opacity=(k===i?'1':'0.15'); }); cap.textContent=caps[i]; }
    function stop(){ if(timer){clearInterval(timer); timer=null;} }
    play.addEventListener('click',function(){ stop(); idx=0; show(0); timer=setInterval(function(){ idx++; if(idx>=ids.length){stop(); return;} show(idx); },1700); });
    rep.addEventListener('click',function(){ stop(); idx=0; show(0); timer=setInterval(function(){ idx++; if(idx>=ids.length){stop(); return;} show(idx); },1700); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) stop(); }); }).observe(wrap); }
    show(0);
  })();
  ```

### Three.js Implementation (canonical — r128 global + inline orbit)

Use only when interacting in true 3D teaches what 2D cannot (orbits, protein folding, cross product, assemblies viewed from multiple angles). Otherwise use SVG animation.

- Boilerplate rules: container is a `<div>` with explicit `min-height:320px` (never a 0-height canvas); renderer canvas is created by Three.js and appended. Guard with `if (typeof THREE==='undefined')` → show fallback. Wrap everything in IIFE + try/catch. One `requestAnimationFrame` loop per scene; pause when offscreen.
  ```html
  <div class="viz3d" id="m2-orbit" style="min-height:320px"></div>
  <div class="ctrls"><button type="button" id="m2-play">▶ play</button><button type="button" id="m2-pause">❚❚ pause</button></div>
  <p class="cap">Drag to rotate · scroll to zoom. Caption states the key insight in one sentence.</p>
  <div class="fallback" id="m2-fallback" hidden><svg viewBox="0 0 600 220" role="img" aria-label="Static orbit diagram"><title>Static orbit</title><!-- static equivalent --></svg></div>
  ```
  ```js
  (function(){
    var cid='m2-orbit', fid='m2-fallback';
    var box=document.getElementById(cid), fb=document.getElementById(fid);
    function fail(msg){ if(fb){fb.hidden=false;} if(box){box.innerHTML='<p class="cap">'+msg+'</p>';} }
    if(!box) return;
    if(typeof THREE==='undefined'){ fail('3D unavailable offline — the static diagram above carries the same insight.'); return; }
    try{
      var W=function(){return box.clientWidth||600;}, H=function(){return 320;};
      var scene=new THREE.Scene();
      var camera=new THREE.PerspectiveCamera(50,W()/H(),0.1,100);
      var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(W(),H()); box.innerHTML=''; box.appendChild(renderer.domElement);
      // … add meshes/lines here (flat-shaded low-poly, no bloom) …
      var az=0.7, pol=1.15, radius=11, playing=false, angle=0;
      function updateCamera(){ camera.position.set(radius*Math.sin(pol)*Math.cos(az),radius*Math.cos(pol),radius*Math.sin(pol)*Math.sin(az)); camera.lookAt(0,0,0); }
      updateCamera();
      var dragging=false,lx=0,ly=0;
      renderer.domElement.style.touchAction='none';
      renderer.domElement.addEventListener('pointerdown',function(e){dragging=true;lx=e.clientX;ly=e.clientY; try{renderer.domElement.setPointerCapture(e.pointerId);}catch(_){}});
      renderer.domElement.addEventListener('pointermove',function(e){ if(!dragging)return; az-=(e.clientX-lx)*0.01; pol=Math.max(0.15,Math.min(Math.PI-0.15,pol-(e.clientY-ly)*0.01)); lx=e.clientX; ly=e.clientY; updateCamera(); });
      renderer.domElement.addEventListener('pointerup',function(){dragging=false;});
      renderer.domElement.addEventListener('wheel',function(e){e.preventDefault(); radius=Math.max(4,Math.min(20,radius+e.deltaY*0.01)); updateCamera();},{passive:false});
      document.getElementById('m2-play').addEventListener('click',function(){playing=true;});
      document.getElementById('m2-pause').addEventListener('click',function(){playing=false;});
      var visible=true;
      if('IntersectionObserver' in window){ new IntersectionObserver(function(es){visible=es[0].isIntersecting;}).observe(box); }
      document.addEventListener('visibilitychange',function(){ if(document.hidden) playing=false; });
      (function tick(){ requestAnimationFrame(tick); if(!visible)return; if(playing){angle+=0.008; /* move object */} renderer.render(scene,camera); })();
      function onResize(){ camera.aspect=W()/H(); camera.updateProjectionMatrix(); renderer.setSize(W(),H()); }
      if('ResizeObserver' in window){ new ResizeObserver(onResize).observe(box); } window.addEventListener('resize',onResize);
    }catch(e){ fail('3D failed to start — the static diagram above carries the same insight.'); }
  })();
  ```
- Aesthetic: flat-shaded low-poly, `MeshBasicMaterial`/`MeshStandardMaterial` + ambient light, no bloom/post-processing. Labelled axes (`THREE.AxesHelper`) only when orientation matters.
- Note the orbit math above is the ONLY allowed orbit control — do not invent another.

### Matter.js Implementation (canonical — 2D physics only)

Use when 2D Newtonian physics with user-visible gravity/collision/stacking teaches what a staged SVG cannot: falling objects, pendulums that collide, stacking/balance, seesaws, dominoes, bouncing projectiles. Do NOT use for pure sequences without physics (use SVG animation) or true 3D (use Three.js).

- Pin from §9 only. Guard with `if (typeof Matter==='undefined')` → show fallback.
  ```html
  <div class="vizphys" id="m3-phys" style="min-height:320px"></div>
  <div class="ctrls"><button type="button" id="m3-play">▶ play</button><button type="button" id="m3-pause">❚❚ pause</button><button type="button" id="m3-replay">Replay</button></div>
  <p class="cap">Caption states the physics insight in one sentence (e.g. "Heavier and lighter balls land together — air resistance, not weight, separates them").</p>
  <div class="fallback" id="m3-fallback" hidden><svg viewBox="0 0 600 220" role="img" aria-label="Static physics diagram"><title>Static physics</title><!-- static equivalent --></svg></div>
  ```
  ```js
  (function(){
    var cid='m3-phys', fid='m3-fallback';
    var box=document.getElementById(cid), fb=document.getElementById(fid);
    function fail(msg){ if(fb){fb.hidden=false;} if(box){box.innerHTML='<p class="cap">'+msg+'</p>';} }
    if(!box) return;
    if(typeof Matter==='undefined'){ fail('Physics unavailable offline — the static diagram above carries the same insight.'); return; }
    try{
      var Engine=Matter.Engine, Render=Matter.Render, Runner=Matter.Runner,
          Bodies=Matter.Bodies, Composite=Matter.Composite;
      var W=function(){return box.clientWidth||600;}, H=function(){return 320;};
      var engine=Engine.create({ gravity:{y:1} });
      var render=Render.create({ element:box, engine:engine,
        options:{ width:W(), height:H(), wireframes:false, pixelRatio:Math.min(window.devicePixelRatio||1,2),
                  background:'#F5F2ED', wireframeBackground:'#F5F2ED' } });
      function build(){ Composite.clear(engine.world,false);
        Composite.add(engine.world,[
          Bodies.rectangle(W()/2,H()-10,W(),20,{isStatic:true,render:{fillStyle:'#B0B7A8'}}),
          Bodies.circle(W()/2-40,40,18,{restitution:0.6,render:{fillStyle:'#2B4565'}}),
          Bodies.circle(W()/2+40,40,18,{restitution:0.6,render:{fillStyle:'#2B4565'}})
        ]); }
      build(); Render.run(render);
      var runner=Runner.create(); Runner.run(runner,engine); runner.enabled=false; // start paused
      document.getElementById('m3-play').addEventListener('click',function(){runner.enabled=true;});
      document.getElementById('m3-pause').addEventListener('click',function(){runner.enabled=false;});
      document.getElementById('m3-replay').addEventListener('click',function(){build(); runner.enabled=true;});
      if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ if(!es[0].isIntersecting) runner.enabled=false; }).observe(box); }
      window.addEventListener('resize',function(){ render.canvas.width=W()*render.options.pixelRatio; render.canvas.style.width=W()+'px'; });
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){ runner.enabled=false; }
    }catch(e){ fail('Physics failed to start — the static diagram above carries the same insight.'); }
  })();
  ```
- Palette: bodies use the per-lesson accent var (`--ai-iro` or its remapped equivalent), static ground the secondary var, background the bg var — so physics matches the lesson's chosen system. Keep body counts small (<30) for performance.

### Isolation, sizing & motion rules (apply to ALL animated/physics/3D visuals)

- Unique prefix per visual (`m2-`, `m3-`, `m5-`…); no shared ids, no shared globals, one IIFE per visual.
- Container always has a non-zero size (`min-height:320px` for 3D/physics, `viewBox` + width 100% for SVG) so canvas is never 0×0.
- Pause offscreen (IntersectionObserver) and on tab-hide; respect `prefers-reduced-motion` (start paused).
- Init after `DOMContentLoaded` (place inline `<script>` at end of `<body>`; never in `<head>` without defer).
- Touch: `touch-action:none` on interactive canvases so pointer-drag works on mobile.

### Fallback

- Every animation/3D/physics visual MUST ship a static SVG (or static SVG inside `.fallback`) that teaches the same key insight alone, plus a one-sentence caption. The fallback is `hidden` by default and revealed by the guard (`typeof THREE/Matter==='undefined'` or try/catch). It must also render with JS disabled (`<noscript>` shows it).
- If the CDN is blocked (offline `file://` without network), the lesson still teaches via the fallback — a text-only "unavailable" line is NOT an acceptable fallback.

## 14. Verification Checklist (Initial HTML — run via SKILL.md Step 8 Final QA)

**How to run:** Step 8 does all three groups in order — A coverage, B animations, C design — against the saved file. Fix-loop until all PASS, then paste the §15 report.

- [ ] Transcript file named after real title, NOT transcript.txt, file is >200 chars
- [ ] HTML file named after central topic / transcript filename stem, NOT lesson.html or index.html
- [ ] Single self-contained HTML, inline CSS/JS
- [ ] Only externals are the pinned Three.js r128 / Matter.js 0.19.0 CDN URLs in §9, included only when actually used
- [ ] What You'll Learn (scaled: 1 bullet/module when N ≤ 5, else 5–8 grouped outcome bullets) + Knowledge Map with all N modules present
- [ ] Every module 80–120 words, 3 short everyday examples (1 obvious, 1 counter‑intuitive, 1 edge‑case/limit, What → So what), 1-line analogy, 1-line misconception, 1-line why-matters, inter-link, compact scenario (2–3 decision points)
- [ ] N modules = transcript major count (no 5-module cap); only small points merged as bullets, every major has its own module
- [ ] One simple visual per module, static SVG preferred; animation / physics / 3D only if essential per §13
- [ ] Every SVG diagram uses the §5B shell (toolbar + stage), the 7 SVG classes only, namespaced marker ids (`arr-m<N>`, never reused `arrow`), and the sizing contract (stage `overflow:auto`, svg `min-width:680px`)
- [ ] 4+ interactive elements minimum, scaled to N (every module has ≥1 quiz Q + recall prompt; incl. module quizzes + scenario; hotspot where part-identification matters)
- [ ] Every quiz/flashcard/scenario gives immediate feedback + why (every option gets its own why); MCQ options equal-length, no format clues
- [ ] Each module has a recall prompt; core ideas resurface in Summary/FAQ (spacing)
- [ ] Consistent terminology throughout; Cheat Sheet is canonical, recall-first (short, plain words)
- [ ] Progress bar + dark/light toggle + `localStorage` persistence (progress + theme, try/catch)
- [ ] Summary & Cheat Sheet + FAQ (paragraph-length answers) + Next Steps (all brief)
- [ ] Placeholders only where photo reality needed, each with alt text + caption
- [ ] Source URL linked + ask-the-agent follow-up line present in footer
- [ ] Animation / physics / 3D present only if essential; if present, interactive with working controls
- [ ] Static SVG preferred; Three.js only where 3D is essential; Matter.js only where real 2D physics is essential
- [ ] All animations/physics have working play/pause/replay controls wired to unique prefixed ids (click each one)
- [ ] All 3D scenes use the §13 inline drag-orbit (no OrbitControls import) and labelled axes if needed
- [ ] No banned patterns: no `<animate>`/`<animateTransform>`/`<set>`, no `THREE.OrbitControls`, no `type="module"`, no shared globals, no duplicate ids
- [ ] Fallback static SVG + one-sentence caption provided for every animation/3D/physics scene; fallback reveals when CDN blocked; containers have non-zero size (min-height 320px for 3D/physics)
- [ ] Opened the saved file via `file://` AND http server: no console errors, every control clicked, blocked-CDN case still teaches via fallback
- [ ] No slop phrases, editorial minimalism respected
- [ ] Per-lesson design system applied and noted (fits topic, different from default/last lesson; taste constraints hold: 2–3 hues, contrast ≥4.5:1, thin 1.5 strokes, Ma spacing, soft 0.8–1.2s motion, §5B remapped via same vars)
- [ ] Diagram-design gate honoured: non-technical topics (philosophy, economics, chemistry, history, biography, habits) never touch diagram-design; technical topics (AI agents, architecture, software, data flow, infra) use its grammar ONLY, re-skinned to §5B — grep must show ZERO `eb6c36`, `2d3142`, `Instrument Serif`, `Geist`, `JetBrains Mono` from diagram-design defaults
- [ ] Layout + design system fit THIS transcript's content and avoid a default essay look and avoid repeating the last lesson's aesthetic (both chosen without reading sibling lessons)
- [ ] Lesson grounded in a purpose (why): threaded into What You'll Learn / Next Steps, or the user was asked
- [ ] Self-contained for a first-timer — no reliance on, or references to, sibling lessons; every term defined on first use
- [ ] Primary source (original transcript/video/article) recommended with segment pointers
- [ ] Reading is low-difficulty; desirable difficulty lives only in the retrieval exercises

## 15. Final QA Report (paste after Step 8, all-PASS required)

```text
QA — <Lesson Title>.html
A. Coverage: PASS (X/Y transcript concepts mapped; orphans: none)
   - <concept> -> Module N / FAQ / Cheat Sheet
B. Animations: PASS (N controls clicked, 0 console errors, file:// + http OK, offline fallback OK)
   - banned-pattern grep: 0 hits; ids unique; fallbacks present
C. Design: PASS (light + dark OK, §5B on all SVGs, mobile 380px OK, skin-leak grep 0 hits, no slop)
Fixes applied: <none / list>
```