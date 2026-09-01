#!/usr/bin/env python3
"""
extract_transcript.py - URL -> transcript file named after the source title
Supports: YouTube (captions), generic articles.

Usage:
  python scripts/extract_transcript.py "https://www.youtube.com/watch?v=..."
  python scripts/extract_transcript.py "https://example.com/article"
  python scripts/extract_transcript.py "https://example.com/article" --out custom-name.txt
"""
import argparse
import datetime
import json
import pathlib
import re
import sys
from urllib.parse import parse_qs, urlparse

import requests


def get_youtube_id(url: str):
    parsed = urlparse(url)
    host = parsed.hostname or ""
    if host.endswith("youtu.be"):
        # youtu.be/VIDEOID may include extra query/path
        return parsed.path.lstrip("/").split("?")[0].split("/")[0]
    if "youtube.com" in host or "m.youtube.com" in host:
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]
        m = re.match(r"/embed/([^/]+)", parsed.path)
        if m:
            return m.group(1)
        m = re.match(r"/v/([^/]+)", parsed.path)
        if m:
            return m.group(1)
        m = re.match(r"/shorts/([^/]+)", parsed.path)
        if m:
            return m.group(1)
        m = re.match(r"/live/([^/?&#]+)", parsed.path)
        if m:
            return m.group(1)
        # fallback: check ?v= on any youtube.com path
        qv = parse_qs(parsed.query).get("v", [None])[0]
        if qv:
            return qv
    return None


def sanitize_title(title: str) -> str:
    r"""SKILL.md v2 sanitization: replace \ / : * ? \" < > | with _, collapse whitespace, trim, limit 120 chars, preserve Title Case and spaces."""
    clean = re.sub(r"\s+", " ", (title or "")).strip()
    if not clean:
        return "transcript"
    clean = re.sub(r'[\\/:*?"<>|]', "_", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    # collapse multiple underscores that may arise from consecutive invalid chars
    # keep single underscore per original spec (replace each char with _)
    clean = clean[:120].strip()
    return clean or "transcript"


def slugify_title(title: str) -> str:
    clean = re.sub(r"\s+", " ", (title or "")).strip()
    if not clean:
        return "transcript"
    clean = re.sub(r"[^\w\s-]", "", clean, flags=re.UNICODE)
    clean = re.sub(r"[-\s]+", "-", clean.strip()).strip("-")
    clean = clean[:80]
    return clean or "transcript"


def generate_output_name(title: str) -> str:
    return f"{sanitize_title(title)}.txt"


def generate_html_output_name(title: str) -> str:
    return f"{sanitize_title(title)}.html"


def youtube_title(video_id: str):
    try:
        import yt_dlp
    except Exception:
        return None

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "no_warnings": True,
        "extract_flat": False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            if isinstance(info, dict):
                title = info.get("title")
                if title:
                    return title.strip()
    except Exception:
        pass
    return None


def generic_page_title(url: str):
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0 TranscriptLesson/1.0"}, timeout=20)
        response.raise_for_status()
    except Exception:
        return None

    html = response.text
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")
        for meta in soup.find_all("meta"):
            prop = (meta.get("property") or "").lower()
            name = (meta.get("name") or "").lower()
            content = (meta.get("content") or "").strip()
            if content and (prop in {"og:title", "twitter:title"} or name == "title"):
                return content
        if soup.title and soup.title.get_text(strip=True):
            return soup.title.get_text(" ", strip=True)
    except Exception:
        pass

    match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if match:
        title = re.sub(r"<[^>]+>", " ", match.group(1))
        title = re.sub(r"\s+", " ", title).strip()
        if title:
            return title
    return None


def extract_source_title(url: str):
    vid = get_youtube_id(url)
    if vid:
        title = youtube_title(vid)
        if title:
            return title
        return "youtube-video"
    return generic_page_title(url) or "article"


def youtube_transcript(video_id: str):
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        try:
            ytt = YouTubeTranscriptApi()
            fetched = ytt.fetch(video_id, languages=["en", "en-US", "en-GB"])
            return " ".join([s.text for s in fetched])
        except AttributeError:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US"])
            return " ".join([x["text"] for x in transcript])
    except Exception as e:
        print(f"[YouTubeTranscriptApi failed: {e}]", file=sys.stderr)
        return None


def generic_page(url: str):
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0 TranscriptLesson/1.0"}, timeout=20)
    response.raise_for_status()
    html = response.text
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
            tag.decompose()
        article = soup.find("article") or soup.find("main") or soup
        text = article.get_text(separator="\n")
        lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 30]
        seen = set()
        out = []
        for line in lines:
            if line not in seen:
                seen.add(line)
                out.append(line)
            if len(out) > 400:
                break
        return "\n".join(out)
    except ImportError:
        text = re.sub(r"<[^>]+>", " ", html)
        return text[:20000]


def main():
    ap = argparse.ArgumentParser(description="URL -> transcript text saved as a title-derived filename")
    ap.add_argument("url", help="YouTube or article URL")
    ap.add_argument("--out", default=None, help="Optional explicit output file. Defaults to a filename based on the page/video title.")
    ap.add_argument("--out-dir", default=None, help="Optional output directory. If set, transcript and meta.json are written there with sanitized title filenames.")
    ap.add_argument("--min-chars", type=int, default=200)
    args = ap.parse_args()

    url = args.url.strip()
    vid = get_youtube_id(url)
    transcript = None

    if vid:
        print(f"Detected YouTube ID: {vid}", file=sys.stderr)
        transcript = youtube_transcript(vid)

    if not transcript:
        print(f"Extracting generic page: {url}", file=sys.stderr)
        transcript = generic_page(url)

    if not transcript or len(transcript.strip()) < args.min_chars:
        print(f"FAILED: transcript too short ({len(transcript or '')} chars)", file=sys.stderr)
        print("Tip: For YouTube, ensure captions are enabled. For articles, try a different URL or paste transcript manually.", file=sys.stderr)
        sys.exit(2)

    title = extract_source_title(url)
    sanitized = sanitize_title(title)
    html_name = generate_html_output_name(title)

    # Determine output path
    if args.out:
        output_path = pathlib.Path(args.out)
        out_dir = output_path.parent if str(output_path.parent) not in ("", ".") else pathlib.Path(".")
        # if --out is an explicit file, respect it; meta alongside it
        if args.out_dir:
            out_dir = pathlib.Path(args.out_dir)
            out_dir.mkdir(parents=True, exist_ok=True)
            # when both --out and --out-dir are given, prioritize --out-dir for meta but keep --out file
            output_path = out_dir / pathlib.Path(generate_output_name(title))
            # handle collisions
            base = output_path.stem
            ext = output_path.suffix
            counter = 1
            while output_path.exists():
                output_path = out_dir / f"{base} ({counter}){ext}"
                counter += 1
    elif args.out_dir:
        out_dir = pathlib.Path(args.out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = out_dir / pathlib.Path(generate_output_name(title))
        # handle collisions by adding (1), (2)
        base = output_path.stem
        ext = output_path.suffix
        counter = 1
        while output_path.exists():
            output_path = out_dir / f"{base} ({counter}){ext}"
            counter += 1
    else:
        output_path = pathlib.Path(generate_output_name(title))
        # handle collisions in cwd
        base = output_path.stem
        ext = output_path.suffix
        counter = 1
        while output_path.exists():
            output_path = pathlib.Path(f"{base} ({counter}){ext}")
            counter += 1
        out_dir = output_path.parent if str(output_path.parent) not in ("", ".") else pathlib.Path(".")

    # Ensure parent exists
    if str(output_path.parent) not in ("", "."):
        output_path.parent.mkdir(parents=True, exist_ok=True)

    output_path.write_text(transcript, encoding="utf-8")

    # Write meta.json alongside transcript (SKILL.md v2)
    if str(out_dir) in ("", "."):
        out_dir = pathlib.Path(".")
    meta_path = out_dir / f"{output_path.stem}.meta.json"
    # if collision-adjusted name, meta should match txt stem
    # ensure meta collision handling too
    if meta_path.exists() and meta_path.stem != output_path.stem:
        pass
    meta = {
        "title": title,
        "sanitized_title": sanitized,
        "source_url": url,
        "video_id": vid,
        "transcript_file": str(output_path.name),
        "html_file_suggestion": html_name,
        "extracted_at": datetime.datetime.utcnow().isoformat() + "Z",
        "char_count": len(transcript),
    }
    # if output was collision-adjusted, html suggestion should reflect actual stem
    if output_path.stem != sanitized:
        meta["html_file_suggestion"] = f"{output_path.stem}.html"
        meta["sanitized_title"] = output_path.stem
    try:
        meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote meta: {meta_path}", file=sys.stderr)
    except Exception as e:
        print(f"[meta write failed: {e}]", file=sys.stderr)

    print(f"Wrote transcript: {output_path}")
    print(f"Next lesson HTML should be saved as: {meta['html_file_suggestion']}")


if __name__ == "__main__":
    main()
