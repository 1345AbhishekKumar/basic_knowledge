# transcript-lesson-skill v2.4.0 — Real-name extractor + transcript-scaled modules

## What changed
Old: transcript.txt in the current folder
New: <Real Video Title>.txt in the `transcripts/` folder (transcript only, no JSON)

The script checks whether the `transcripts/` folder already exists and creates it automatically if it does not.

Example:
https://youtube.com/watch?v=abc titled "How Gravity Works" ->
transcripts/How Gravity Works.txt

## Supported inputs
- YouTube single video with captions (watch / youtu.be / embed / shorts / live). EN tried first, then auto-translated / other languages via `--languages`.
- Article / blog / docs page (og:title -> twitter:title -> <title>).

Not supported (paste the transcript manually instead):
- Podcast RSS / direct audio (`.mp3`, `.m4a`, `.ogg`, `.oga`, `.wav`, `.flac`, `.opus`, `.m4b`) — no audio transcription.
- Direct video files (`.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`) — no file download/transcription.
- YouTube playlists / channels (pass a single-video URL, not `list=`).
- Age-restricted / private / login-walled videos, videos with captions disabled.
- Paywalled / JS-only articles that return <200 chars.

## Install (isolated venv only — never install globally)
Run from this skill folder (`transcript-lesson-skill/`):
```bash
uv venv
uv pip install -r requirements.txt
```
Activate only if you need a shell (Windows PowerShell / bash):
```powershell
.venv\Scripts\Activate.ps1
```
```bash
source .venv/bin/activate
```
Or skip activation and prefix every run with `uv run` (uses the venv automatically).

## Usage
```bash
uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --languages en es
uv run python scripts/extract_transcript.py "https://example.com/article"
uv run python scripts/extract_transcript.py "https://example.com/article" --out-dir lessons
```
If the venv is already activated, plain `python scripts/extract_transcript.py ...` works too.

Options: `--out <name>.txt` forces a filename, `--out-dir <in-repo-path>` overrides the destination (must stay inside the current repo), `--languages <codes...>` sets caption preference, `--min-chars <n>` sets the minimum accepted length (default 200).

## Output location
Transcripts are saved into `transcripts/` inside the current repo by default (folder auto-created if missing). Pass `--out-dir <in-repo-path>` to override the destination. Paths resolving outside the current repo are refused (exit 2, fall back to `transcripts/`).

## Repo boundary
This skill never touches anything outside the current repo. All transcript / HTML outputs stay inside the repo; `../japanese-philosophy` / `../diagram-design` are read only when they exist inside the current repo.

## Title resolution
1. YouTube: yt-dlp extracts title without download, then youtube-transcript-api for captions. Title fetch falls back to `youtube-video-<id>` (never generic `transcript.txt`).
2. Generic: og:title -> twitter:title -> <title>. Title fetch falls back to `article-<host>`.

Empty titles fall back to `untitled` (never `transcript`).

## Sanitization
Replace \ / : *? " < > | with _, collapse whitespace, limit 120 chars, preserve Title Case and spaces.

## Output
-.txt = transcript, real name (only output file)
- HTML lesson filename should mirror the transcript filename stem (e.g., `Why Black Holes Evaporate.txt` -> `Why Black Holes Evaporate.html`)

## Changelog
- v2.4.0: gated READ → UNDERSTAND → IDENTIFY N → THEN CREATE flow — Step 1 now requires full-read proof (length + first/last quotes, chunked reads to EOF), 5-line understanding block, numbered major list with transcript evidence where count = N, and all-PASS coverage table before Steps 2–7; Step 7 builds ONLY those N modules (count H2 == N, no drops/invents).
- v2.3.0: removed fixed 3–5 module cap — Step 1 now surveys the FULL transcript, counts distinct majors = N, and builds N modules (3–5 short, 6–12 medium, 13–40 long/course-length); What You'll Learn / Knowledge Map / quizzes / FAQ / Knowledge Check all scale with N; coverage audit is strict (every major gets its own module).
- v2.2.0: repo boundary (all outputs stay inside current repo; `--out-dir`/`--out` outside refused), channel/handle detection (`/channel/`, `/c/`, `/user/`, `/@handle`), `twitter:title` via meta name, keep `<li>` + short-line threshold 15, SKILL.md scope exception for Step 0/7 working files, fixed Step 3A ref.
- v2.1.1: no `transcript.txt` fallback (empty -> `untitled`), unique fallbacks (`youtube-video-<id>`, `article-<host>`), direct video-file guard, skip generic scrape for YouTube IDs, yt-dlp timeout+retries, pinned dep upper bounds, documented `--min-chars`.
- v2.1.0: fixed install paths, clarified supported inputs (no podcast/playlist/audio transcription), added `--languages`, playlist/audio/age-restricted detection with actionable errors, preserved headings in article extraction, documented CDN upgrade policy.
- v2: real-name `transcripts/<Title>.txt` output.

## License
MIT.