# scripts/extract_transcript (v2.2.0)

External reference for SKILL.md Step 0 — behind a context pointer to avoid sprawl.

## Purpose
Normalize input branch: URL -> `<Real Title>.txt` saved in the `transcripts/` folder (transcript only, no JSON).

## Supported inputs
- YouTube single video with captions (watch / youtu.be / embed / shorts / live). EN tried first, then `--languages` fallback.
- Article / blog / docs page via `requests` + `beautifulsoup4` with article/main detection; headings preserved.

Not supported (paste transcript manually): podcast RSS / direct audio files, direct video files (`.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`), YouTube playlists / channels, age-restricted / private / login-walled videos, videos with captions disabled, paywalled / JS-only articles.

## Install (isolated venv only — never install globally)
From the skill root (`transcript-lesson-skill/`):
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
Or skip activation and use `uv run` per command below.

## Usage
```bash
uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --languages en es
uv run python scripts/extract_transcript.py "https://example.com/my-article"
uv run python scripts/extract_transcript.py "https://example.com/my-article" --out-dir lessons
```
Run from the skill root. If the venv is already activated, plain `python scripts/extract_transcript.py ...` works too. From inside `scripts/`, use `uv run python extract_transcript.py ...`.
Transcripts are saved into `transcripts/` inside the current repo by default. The script checks whether the folder already exists and creates it automatically if it does not. Use `--out-dir <in-repo-path>` to save somewhere else inside the current repo, or `--out <name>.txt` to force an explicit filename. Paths resolving outside the current repo are refused. Use `--languages <codes...>` to set caption language preference (default: `en en-US en-GB` then any available language). Use `--min-chars <n>` to set the minimum accepted length (default 200).

## Repo boundary
All outputs stay inside the current repo. `--out-dir` / `--out` paths that resolve outside the repo exit with code 2 and fall back to `transcripts/`.

## Branches
- YouTube: `youtube-transcript-api` (v0 `get_transcript` and v1 `fetch`/`list` APIs both supported) with language fallback. No generic page scrape for YouTube IDs (watch HTML is JS-walled and slow). Detects playlists, channels/handles, direct audio/video files, age-restricted/private, and missing-caption failures with actionable tips. Title fallback is `youtube-video-<id>`; empty titles fall back to `untitled` (never `transcript`).
- Article / blog / docs: `requests` + `beautifulsoup4` with article/main detection; `h1`/`h2`/`h3` headings and `<li>` items kept even when short. Title fallback is `article-<host>` (supports `og:title`, `twitter:title` via property or name, then `<title>`).

## Completion criterion
File exists in `transcripts/` inside the current repo (or the in-repo `--out-dir` destination) and >200 chars. If fails, SKILL.md must ask user to paste transcript.

