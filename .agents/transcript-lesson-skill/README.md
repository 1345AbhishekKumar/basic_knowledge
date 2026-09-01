# scripts/extract_transcript v2 — Real-name extractor

## What changed
Old: transcript.txt
New: <Real Video Title>.txt + <Real Title>.meta.json

Example:
https://youtube.com/watch?v=abc titled "How Gravity Works" ->
How Gravity Works.txt + How Gravity Works.meta.json

## Install
pip install -r../requirements.txt

## Usage
python extract_transcript.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --out-dir.
python extract_transcript.py "https://example.com/article" --out-dir./lessons

## Title resolution
1. YouTube: yt-dlp extracts title without download, then youtube-transcript-api for captions
2. Generic: og:title -> twitter:title -> <title>

## Sanitization
Replace \ / : *? " < > | with _, collapse whitespace, limit 120 chars, preserve Title Case and spaces.

## Output
-.txt = transcript, real name
-.meta.json = {title, sanitized_title, source_url, video_id, transcript_file, html_file_suggestion, extracted_at, char_count}
- html_file_suggestion is exact name Step 7 should use for HTML lesson