
### 2. `lesson-requirements.md`
```markdown
# Interactive HTML Lesson Specification

This document defines every requirement a self‑contained HTML lesson must satisfy.
All diagrams must be built with pure SVG, CSS, or Canvas – **except for 3D scenes, where Three.js (CDN) is permitted**. No other external libraries.

## File Naming Rules (Mandatory) — New in v2

- **Transcript file:** Must be `<Real Video Title>.txt` sanitized (replace \ / : *? " < > | with _, collapse whitespace, trim, limit 120 chars, preserve Title Case). Example: "How Gravity Works? (Explained)" -> "How Gravity Works (Explained).txt". Never `transcript.txt`.
- **Meta file:** `<Real Video Title>.meta.json` with {title, sanitized_title, source_url, video_id, transcript_file, html_file_suggestion, extracted_at, char_count}
- **HTML file:** Must be `<Central Topic>.html` where central topic is distilled from transcript, typically same as or refined video title. Example: `Why Black Holes Evaporate.html`. Never `lesson.html`, `index.html`, or `transcript.html`.
- **Sanitization:** Replace invalid chars with _, collapse whitespace, limit 120 chars, preserve Title Case and spaces.

## 0. Design Taste & Anti‑Slop Rules (Mandatory)

- **Editorial minimalism:** Thin strokes (`stroke-width="1.5"`), generous whitespace, muted editorial palette (#111, #555, #f6f3ee, accent #d6a77a or theme accent). No heavy shadows, no gradients, no glassmorphism, no emojis in headings.
- **Typography:** System serif for headings (Georgia / Times), system sans for body (Inter / -apple-system). Max 70ch line length. No more than 2 font weights.
- **No slop phrases:** Avoid "dive into", "delve", "unlock", "in today's fast-paced world", "game-changer", "revolutionary". Write like a clear human teacher.
- **Economy:** Every visual must teach. No decorative icons or stock illustrations.
- **Layout Variation mandatory:** Never default to single-column essay twice in a row. See system below.
- **Dark/light:** Toggle is small icon (top-right), smooth transition, respects prefers-color-scheme.

### Layout Variation System — Pick one per lesson, never repeat

1. **Editorial Scroll:** Long-form article with sticky side knowledge map, modules as chapters.
2. **Split Atlas:** Left nav rail with module cards, right content pane. Knowledge map top.
3. **Card Deck:** Horizontal scroll of module cards, each card expands into lesson.
4. **Timeline Rail:** Vertical timeline on left, modules are nodes.
5. **Field Notes:** Notebook aesthetic — margin notes for misconceptions and why-it-matters.
6. **Magazine Grid:** 2-col grid, visuals bleed, text in columns.
7. **Lab Manual:** Procedure-first layout with steps and visuals side-by-side.

## 1. Structure
- What You'll Learn: 4-6 bullets, outcome-focused, plain language.
- Knowledge Map: Minimal monochrome SVG, interactive hover to jump to module, line art only.
- Modules: Each has H2 with number, Core Explanation >=200 words conversational, Step-by-Step Breakdown, >=3 Examples, Visual Analogy Card, What People Get Wrong, Why This Matters, Inter-Module Link.

## 2. Content Depth
- Conversational, second-person friendly, but precise.
- No concept left shallow. If transcript says term, define it.
- Every module >=200 words core explanation.

## 3. Visualizations & Diagrams
- One visual per module minimum — static SVG, image placeholder, SVG animation, or 3D scene as appropriate.
- **SVG Diagram Rules:** Pure SVG, viewBox, no external images, stroke-linecap round, labels via <text>, thin strokes.
- **Image Placeholder Rules:** Use ONLY when photo reality needed. Implement as:
  ```html
  <figure class="photo-placeholder">
    <div class="placeholder-box" role="img" aria-label="Detailed alt description here"></div>
    <figcaption>Caption: what learner should see, source suggestion.</figcaption>
  </figure>


CSS: dashed border 1.5px #bbb, background repeating linear pattern of transparent pixel, min-height 280px, centered alt text, muted.

4. Interactivity (at least 6 across lesson)
Approved list: Flashcards (click to flip), Drag-and-drop match terms/definitions, Module quiz (1-2 Q per module), Slider to reveal steps, Toggle analogy, Expandable misconception, Copyable cheat-sheet, Progress-linked checklist. All vanilla JS, no libs, styled with economy.

5. Progress & Navigation
Thin top progress bar (2px) linked to scroll.
Knowledge Map highlights current module.
Smooth scroll to modules, keyboard accessible.
6. Memory Techniques
Mnemonic sentence, spaced recall prompt, analogy recall — integrated as small pill cards, not noisy.
7. Code & Asset Rules
Single HTML file, inline CSS + JS.
Only external: Three.js CDN as specified.
No external fonts, no analytics, no extra CDN.
8. Accessibility
All SVGs have <title> and aria-label.
Keyboard navigable flashcards/quizzes.
Color contrast >=4.5:1.
Every animation/3D has caption or aria-label.
9. Summary, FAQ, Next Steps
Summary & Cheat Sheet: table of concepts, definitions, formulas.
FAQ: 3-5 questions from transcript confusion points.
Next Steps: 2-3 actions to apply knowledge.
10. Final Assessment — Test Your Knowledge (only when user says yes)
15 questions: 5 recall, 5 application, 5 synthesis.
Mix: MCQ, true/false with explanation, drag-match.
Score + explanations on submit, no external deps.
11. Animations & 3D
When to Use
SVG Animation: For any dynamic process, mechanism, cycle, or sequence that can be effectively illustrated in 2D. This is the go‑to medium for explaining how something works step‑by‑step. Examples:
Mechanical actions (rifle bolt cycling, gear train, trigger mechanism sear/hammer/firing pin)
Physical forces (falling objects, pendulums, wave propagation, gravity)
Biological processes (blood flow, photosynthesis, cellular respiration steps)
Technical workflows (data flow in a pipeline, request lifecycle)
Mathematical transformations (morphing shapes, equation evolution square->circle, secant->tangent)
Three.js 3D Scene: For concepts that require spatial, three‑dimensional understanding. Use when flat 2D would lose critical depth. Examples:
3D anatomy (skull, molecular structures, protein folding)
Gravitational orbits, solar system
3D vector mathematics (cross product, vector fields)
Complex mechanical assemblies best viewed from multiple angles
Choice rule: Prefer SVG animation for 2D processes. Use Three.js only when third dimension adds indispensable insight.
SVG Animation Implementation
No video files. Use native SVG <animate>, <animateTransform>, or JS requestAnimationFrame.
Style: thin strokes 1.5, muted palette, living diagram not cartoon.
Controls: play/pause + replay, minimal icons.
Step-by-step flow: break into stages, highlight current stage label.
Performance: avoid animating too many elements simultaneously.
Three.js Implementation
Load Three.js from CDN as only external resource.
Clean, low‑poly aesthetic with flat shading. No bloom.
Built-in orbit controls: drag rotate, scroll zoom. Implement inline.
Responsive canvas, labelled axes when needed.
Fallback
Every animation/3D must have static SVG fallback capturing key insight.
Verification Checklist (Initial HTML)
 Transcript file named after real title, NOT transcript.txt
[ ].meta.json exists with title and source_url
 HTML file named after central topic / video title, NOT lesson.html or index.html
 Single self-contained HTML, inline CSS/JS
 Only external is Three.js CDN if needed
 What You'll Learn + Knowledge Map present
 Every module >=200 words, >=3 examples, analogy, misconception, why matters, inter-link
 One visual per module, typed correctly SVG vs placeholder
 At least 6 interactive elements from approved list
 Progress bar + dark/light toggle
 Summary & Cheat Sheet + FAQ + Next Steps
 If any module involves a process/mechanism, SVG animation or Three.js scene is present and interactive
 Three.js used only where 3D is essential; otherwise SVG animation preferred
 All animations have play/pause/replay controls
 All 3D scenes have orbit controls and labelled axes if needed
 Fallback static SVG provided for every animation/3D scene
 No slop phrases, editorial minimalism respected
 Theme distinct and well-executed
