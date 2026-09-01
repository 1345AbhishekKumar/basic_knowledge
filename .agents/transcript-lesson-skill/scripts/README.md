# scripts/extract_transcript

External reference for SKILL.md Step 0 — behind a context pointer to avoid sprawl.

## Purpose
Normalize input branch: URL -> `transcript.txt`

## Install
```
pip install -r ../requirements.txt
```

## Usage
```bash
python extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --out ../transcript.txt
python extract_transcript.py "https://example.com/my-article" --out ../transcript.txt
```

## Branches
- YouTube: uses `youtube-transcript-api` first, falls back to generic scrape if captions disabled.
- Article / blog / docs: `requests` + `beautifulsoup4` with article/main detection.

## Completion criterion
File exists and >200 chars. If fails, SKILL.md must ask user to paste transcript.

## Anti-patterns avoided
- No negation in docs. Positive instruction only.
- No duplication of lesson-requirements logic here.
