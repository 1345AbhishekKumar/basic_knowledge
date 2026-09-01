---
name: transcript-lesson
description: Use when the user provides a transcript and wants to learn the material deeply through an interactive, visual, self-contained HTML lesson. Also use when the user provides a URL, YouTube link, video link, podcast link and wants a lesson from it. Also use if the user asks to "convert a transcript into an interactive lesson", "create a lesson from a transcript", "make a visual lesson from this video", "teach me this video", "make a lesson from this link" or "teach me with interactive diagrams and quizzes".
---

## Steps

0. **Normalize input — resolve transcript with real name**
      - Detect input branch:
          - Branch A: raw transcript text pasted -> derive a concise topic from the first 150 words (3-8 words, Title Case), sanitize it, and save transcript as `<Topic>.txt`. Do NOT use generic `transcript.txt`.
          - Branch B: URL provided (YouTube, article, podcast) -> run `python scripts/extract_transcript.py <url> --out-dir.`. This script:
              - Fetches real video/page title via yt-dlp or og:title
              - Sanitizes title (replace \ / : *? " < > | with _, collapse whitespace, trim, limit 120 chars, preserve Title Case and spaces)
              - Creates `<Real Title>.txt` and `<Real Title>.meta.json` with {title, source_url, video_id, html_file_suggestion}
              - Handles collisions by adding (1), (2)
      - Read `scripts/README.md` for args and fallback logic.
      - If extraction fails or transcript <200 chars, ask user to paste transcript manually or enable captions.
      - **Completion criterion:** A.txt file exists whose name equals the sanitized video/page title or derived topic, NOT `transcript.txt`. You can quote the filename and the title from meta.json. File is >200 chars UTF-8.

1. **Extract the lesson outline — and verify completeness + determine final filenames**
      - Read the real-named transcript file from Step 0 (e.g., `How Gravity Works.txt` + `How Gravity Works.meta.json`).
      - Identify the central topic and 4–6 key concepts that will become learning modules.
      - For each module note: the core idea, any process/steps, at least three distinct real‑world examples (one obvious, one counter‑intuitive, one edge‑case), a relatable analogy, a common misconception, and why the concept matters.
      - **Completeness check:** After drafting the outline, re‑scan the transcript line by line. List every distinct concept, term, subtopic, or nuance mentioned — no matter how small. If any listed item is not already covered by one of the 4–6 modules, you must either:
          - Enrich an existing module so it includes that concept (with dedicated explanation and examples), or
          - Create an additional module if the concept warrants its own full treatment.
      - The final module count may grow beyond 6 if needed to honour the transcript’s full scope. Never drop a concept to fit an arbitrary module limit.
      - **Determine final lesson filename:** Central topic becomes final HTML filename. For URL branch, use video title from meta.json or refined version if transcript reveals more precise topic. Sanitize same as Step 0. Example: `Why Black Holes Evaporate.txt` -> `Why Black Holes Evaporate.html`. Never `lesson.html`, `index.html`, or `transcript.html`.
      - **Completion criterion:** You have a structured outline whose coverage is exhaustive — every single concept from the transcript is accounted for, and no idea is left orphaned. Central topic string (3-8 words) defined, sanitized HTML filename decided (e.g., `Gravity and Falling Objects.html`).

2. **Plan domain‑specific visuals (prioritising the right visual, not just SVG)**
      - Determine the transcript’s domain and the **nature of the concepts**. Use the most instructionally effective visual:
          - *Abstract/relational* → SVG diagram (flowchart, hierarchy, Venn, cycle).
          - *Data‑heavy* → Pure‑SVG chart.
          - *Physical / mechanical / spatial / anatomical* → SVG technical illustration **if a clear diagram can capture the structure / mechanism** (cutaway, exploded view, multi‑panel sequence). If the learner would be better served by a **photographic or realistic depiction** (e.g., actual tissue histology, a specific animal, a natural landscape, a real chemical apparatus), flag it for an image placeholder.
          - *Real‑world identity / appearance* (product, person, landmark, specific scene, UI screenshot, etc.) → image placeholder.
      - The guiding principle: **diagrams explain how something works; photographs show what something actually looks like.** Pick the one that teaches the concept better.
      - **Completion criterion:** Every module has at least one visual. Physical/identity concepts are correctly typed as SVG or placeholder; no placeholder is used where an SVG would suffice, and no concept that demands a photograph is forced into a diagram.

3. **Assess visual needs — balanced SVG / image strategy**
      - Categorise every visual concept using the principle above.
      - **SVG diagrams** are the default for: flowcharts, process steps, data plots, abstract relationships, and any mechanism where a simplified illustration aids understanding.
      - **Image placeholders** (the transparent-pixel pattern from `lesson-requirements.md`) must be used whenever the learner **needs to see a real‑world appearance** that cannot be captured by a schematic. This includes, but is not limited to:
          - Biology / anatomy (histology slides, specimen photographs, anatomical dissections)
          - Chemistry (colour changes, actual apparatus setups)
          - Geography / geology (aerial photos, rock formations)
          - History (photographs, paintings, documents)
          - Products, logos, branded items, buildings, artworks, screenshots, etc.
      - If in doubt, ask: “Would a simplified drawing miss essential visual information?” If yes, use the placeholder with detailed `alt` text and caption.
      - **Completion criterion:** Every visual concept is resolved correctly; the lesson contains a healthy mix of SVG diagrams and image placeholders where pedagogically justified.

4. **Assess animation and 3D needs (now including SVG process animations)**
      - For each module that involves a **dynamic process, mechanism, or sequence of steps** (e.g., how a rifle fires, how gravity pulls objects, how the heart pumps blood), determine the best medium:
          - **SVG Animation:** If the process can be clearly shown in 2D as a step‑by‑step animated flow. This covers **any** moving mechanism, cycle, or cause‑effect chain — not just mathematical transformations. Examples:
              - Trigger mechanism of a firearm (sear, hammer, firing pin)
              - Water cycle (evaporation, condensation, precipitation)
              - Newton’s apple falling due to gravity
              - Cellular respiration steps
              - Electron flow in a circuit
          - **Three.js 3D Scene:** If the concept is inherently **spatial** or three‑dimensional, and a 3D view with rotation/zoom adds significant understanding. Examples:
              - 3D structure of a rifle’s action (realistic moving parts)
              - Gravitational orbits of planets (3D solar system)
              - Cross product of vectors in 3D space
              - Protein folding in 3D
          - **Manim‑style Mathematical Morphing:** A subset of SVG animation where the focus is on transforming mathematical shapes or equations (e.g., square → circle, secant → tangent).
      - The choice between SVG animation and Three.js depends on whether the extra dimension is essential for comprehension. If in doubt, start with SVG animation; it’s simpler and aligns better with the overall editorial aesthetic. Reserve Three.js for when flat 2D would lose critical information.
      - **Completion criterion:** Every process‑based module has a planned animation (SVG or 3D). All other modules retain their static visual.

5. **Select a layout theme — guarantee a completely different design each time**
      - This step is **mandatory and must not be skipped.** Use the Layout Variation System in `lesson-requirements.md`.
      - Pick one theme from the catalogue. **Do not reuse the same theme** as any previous run you can remember. If you have no memory of prior runs, pick randomly, but exclude the most obvious “default” (Classic Essay) unless it is the only one you haven’t used.
      - Deliberately vary the theme across invocations so that the page architecture, module flow, and navigation feel radically different every time.
      - **Completion criterion:** A theme is chosen, noted, and you can describe how it will produce a structure that is clean, fresh, and unlike the last output.

6. **Consult the detailed lesson specification**
      - Load `lesson-requirements.md`. Internalise the Design Taste & Anti‑Slop Rules first, then every structural, visual, interactive, detail, and feedback requirement.
      - **Note:** The final “Test Your Knowledge” assessment is **NOT** included in the initial HTML.
      - **Completion criterion:** All mandatory elements (except final assessment) memorised.

7. **Generate the self‑contained HTML (without final Knowledge Check) — named after video topic**
      - Build a single file with inline CSS and JavaScript. For Three.js, include the script via CDN:
     ```html
     <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

- Filename rule (mandatory): HTML file must be named <Central Topic>.html as decided in Step 1, which for URL branch equals or refines the real video title. Example: transcript file Why Black Holes Evaporate.txt -> HTML Why Black Holes Evaporate.html. Never use lesson.html, index.html, or transcript.html.
- Follow the specification exactly, filtered through the chosen layout theme and all design‑taste rules.
- Build in this order:
- Clean “What You’ll Learn” overview.
- Minimal Interactive Knowledge Map (SVG, monochrome line art).
- For each module: Core Explanation (≥200 words, conversational style), Step‑by‑Step Breakdown, ≥3 Examples, Visual Analogy Card, ❌ What People Get Wrong, Why This Matters, 🔗 Inter‑Module Link.
- Unobtrusive progress tracker (thin top bar).
- At least 6 interactive learning elements from the approved list (flashcards, drag‑and‑drop, module quizzes, etc.), each styled with economy.
- Memory techniques integrated without visual noise.
- Dark/light mode toggle (small icon, smooth transition).
- Final “Summary & Cheat Sheet”, FAQ, Next Steps.
- Do NOT include the 15‑question “Test Your Knowledge” assessment.
- Completion criterion: HTML passes the verification checklist in lesson-requirements.md (excluding final assessment). Every concept from the transcript is explicitly taught. The visual mix (static SVGs, image placeholders, SVG animations, 3D scenes) is appropriate. The layout theme is distinct and well‑executed. File is named after topic, e.g., How Gravity Works.html.

8.  **Output and ask about Knowledge Check**
   Present the final HTML file (with topic-based name) in a code block or as file reference.
   Immediately after, explicitly ask the user: “Would you like me to add a comprehensive Knowledge Check (15‑question test) to this lesson?”
   If user says yes: Generate a revised HTML with the Knowledge Check integrated, leaving everything else identical, keeping the same topic-based filename. Output the revised HTML.
   If user says no: Stop — the lesson is complete.