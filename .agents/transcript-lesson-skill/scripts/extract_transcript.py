#!/usr/bin/env python3
"""
extract_transcript.py v2.2.0 - URL -> transcript file named after the source title
Supports: YouTube single video with captions, generic articles.
Does NOT support: podcast RSS / direct audio transcription, direct video files,
YouTube playlists / channels (batch), age-restricted / private / login-walled videos.

Transcripts are saved into the 'transcripts' folder inside the current repo by
default. The script checks whether the folder exists and creates it
automatically if it does not. Use --out-dir to save transcripts somewhere else
inside the current repo — paths resolving outside the current repo are refused
and fall back to 'transcripts/'.

Install (isolated venv only — never globally):
  uv venv
  uv pip install -r requirements.txt

Usage:
  uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=..."
  uv run python scripts/extract_transcript.py "https://www.youtube.com/watch?v=..." --languages en es
  uv run python scripts/extract_transcript.py "https://example.com/article"
  uv run python scripts/extract_transcript.py "https://example.com/article" --out-dir lessons
"""
import argparse
import pathlib
import re
import sys
from urllib.parse import parse_qs, urlparse

import requests


AUDIO_EXTENSIONS = (".mp3", ".m4a", ".ogg", ".oga", ".wav", ".flac", ".opus", ".m4b")
VIDEO_EXTENSIONS = (".mp4", ".mov", ".avi", ".webm", ".mkv")
AUDIO_HOSTS = ("podcasts.apple.com", "open.spotify.com", "podcast", "anchor.fm", "soundcloud.com")


def is_playlist_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        if "list" in qs:
            return True
        if (parsed.path or "").rstrip("/").endswith(("/playlist", "/playlists")):
            return True
    except Exception:
        pass
    return False


def is_channel_url(url: str) -> bool:
    """YouTube channel / user / handle pages — batch extraction not supported."""
    try:
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if "youtube.com" not in host and "youtu.be" not in host:
            return False
        path = (parsed.path or "").rstrip("/")
        low = path.lower()
        if low.startswith(("/channel/", "/c/", "/user/")):
            return True
        if low in ("/channel", "/c", "/user"):
            return True
        # Handles: youtube.com/@name, youtube.com/@name/videos, etc.
        segments = [s for s in path.split("/") if s]
        if segments and segments[0].startswith("@"):
            return True
    except Exception:
        pass
    return False


def is_in_repo(path: pathlib.Path) -> bool:
    """True iff path resolves inside the current repo (cwd). No outside writes.

    Works for non-existent paths too (resolve(strict=False)): a future file
    like transcripts/New.txt resolves inside cwd and returns True, while
    ../outside/x.txt or C:/other/x.txt returns False.
    """
    try:
        cwd = pathlib.Path.cwd().resolve()
        resolved = path.resolve() if path.is_absolute() else (cwd / path).resolve()
        return resolved == cwd or cwd in resolved.parents
    except Exception:
        return False


def is_audio_url(url: str) -> bool:
    try:
        parsed = urlparse(url.lower())
        path = parsed.path or ""
        if path.endswith(AUDIO_EXTENSIONS) and "youtube.com" not in (parsed.hostname or ""):
            return True
        if "/feed" in path and ("rss" in path or "podcast" in path or "feed" in (parsed.query or "")):
            return True
        host = parsed.hostname or ""
        if any(h in host for h in AUDIO_HOSTS):
            return True
        if path.endswith(("/feed.xml", "/rss.xml", "/feed")):
            return True
    except Exception:
        pass
    return False


def is_video_file_url(url: str) -> bool:
    """Direct video file links (.mp4 etc.) — no captions to extract."""
    try:
        parsed = urlparse(url.lower())
        path = parsed.path or ""
        host = parsed.hostname or ""
        if "youtube.com" in host or "youtu.be" in host:
            return False
        return path.endswith(VIDEO_EXTENSIONS)
    except Exception:
        pass
    return False


def get_youtube_id(url: str):
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host.endswith("youtu.be"):
        # youtu.be/VIDEOID may include extra query/path
        return parsed.path.lstrip("/").split("?")[0].split("/")[0] or None
    if "youtube-nocookie.com" in host:
        m = re.match(r"/embed/([^/]+)", parsed.path)
        if m:
            return m.group(1)
    if "youtube.com" in host or "music.youtube.com" in host:
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
        return "untitled"
    clean = re.sub(r'[\\/:*?"<>|]', "_", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    # Each invalid char becomes a single underscore (consecutive invalid chars
    # yield consecutive underscores — intentional, matches the spec).
    clean = clean[:120].strip()
    return clean or "untitled"


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
        "socket_timeout": 20,
        "retries": 2,
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
            if content and (prop in {"og:title", "twitter:title"} or name in {"og:title", "twitter:title", "title"}):
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
        return f"youtube-video-{vid}"
    title = generic_page_title(url)
    if title:
        return title
    try:
        host = urlparse(url).hostname or "untitled"
    except Exception:
        host = "untitled"
    return f"article-{host}"


def youtube_transcript(video_id: str, languages=None):
    """Fetch captions, supporting both youtube-transcript-api v0 and v1.

    v1: YouTubeTranscriptApi().fetch(video_id, languages=[...]) returning
        objects with .text; v0: YouTubeTranscriptApi.get_transcript(...).
    Tries preferred languages first, then any available transcript.
    Returns (text, error_hint) where error_hint is None on success.
    """
    languages = languages or ["en", "en-US", "en-GB"]
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError as e:
        return None, f"youtube-transcript-api not installed ({e}). Run: uv pip install -r requirements.txt"

    last_err = None
    # v1 API: instance fetch / list
    try:
        if hasattr(YouTubeTranscriptApi, "fetch") or hasattr(YouTubeTranscriptApi(), "fetch"):
            try:
                ytt = YouTubeTranscriptApi()
                fetched = ytt.fetch(video_id, languages=languages)
                text = " ".join([s.text for s in fetched])
                if text.strip():
                    return text, None
            except AttributeError:
                pass
            except Exception as e:
                last_err = e
                msg = f"{type(e).__name__}: {e}".lower()
                # Try any-language fallback via list() before giving up.
                try:
                    ytt = YouTubeTranscriptApi()
                    listed = ytt.list(video_id)
                    # Prefer a manually created transcript, else auto-generated, else first.
                    transcript = None
                    try:
                        transcript = listed.find_transcript(languages)
                    except Exception:
                        pass
                    if transcript is None:
                        try:
                            for t in listed:
                                transcript = t
                                break
                        except Exception:
                            pass
                    if transcript is not None:
                        data = transcript.fetch()
                        text = " ".join([s.text if hasattr(s, "text") else s.get("text", "") for s in data])
                        if text.strip():
                            return text, None
                except Exception:
                    pass
                if any(k in msg for k in ("transcriptsdisabled", "no transcript", "notranscriptfound", "captions disabled", "could not retrieve")):
                    return None, f"captions disabled or missing ({e}). Enable captions on the video or paste the transcript manually."
                if any(k in msg for k in ("video unavailable", "unavailable", "private", "login", "sign in", "age", "restricted", "members-only", "members only")):
                    return None, f"video unavailable / private / age-restricted / login-walled ({e}). Paste the transcript manually."
                # Otherwise fall through to v0 attempt + generic scrape.
    except Exception as e:
        last_err = e

    # v0 API: classmethod get_transcript / list_transcripts
    try:
        from youtube_transcript_api import YouTubeTranscriptApi as YTA
        if hasattr(YTA, "get_transcript"):
            try:
                transcript = YTA.get_transcript(video_id, languages=languages)
                text = " ".join([x.get("text", "") for x in transcript])
                if text.strip():
                    return text, None
            except Exception as e:
                last_err = e
        if hasattr(YTA, "list_transcripts"):
            try:
                listed = YTA.list_transcripts(video_id)
                transcript = None
                try:
                    transcript = listed.find_transcript(languages)
                except Exception:
                    try:
                        transcript = listed.find_generated_transcript(languages)
                    except Exception:
                        pass
                if transcript is None:
                    for t in listed:
                        transcript = t
                        break
                if transcript is not None:
                    data = transcript.fetch()
                    text = " ".join([x.get("text", "") if isinstance(x, dict) else getattr(x, "text", "") for x in data])
                    if text.strip():
                        return text, None
            except Exception as e:
                last_err = e
    except Exception as e:
        last_err = e

    if last_err is not None:
        print(f"[YouTubeTranscriptApi failed: {last_err}]", file=sys.stderr)
        return None, str(last_err)
    return None, "unknown transcript failure"


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
        # Preserve headings and list items even when short; body lines need substance.
        headings = {
            h.get_text(" ", strip=True)
            for h in article.find_all(["h1", "h2", "h3"])
            if h.get_text(strip=True)
        }
        list_items = {
            li.get_text(" ", strip=True)
            for li in article.find_all("li")
            if li.get_text(strip=True)
        }
        text = article.get_text(separator="\n")
        lines = []
        for raw in text.splitlines():
            line = raw.strip()
            if not line:
                continue
            if line in headings or line in list_items or len(line) > 15:
                lines.append(line)
        seen = set()
        out = []
        for line in lines:
            if line not in seen:
                seen.add(line)
                out.append(line)
            if len(out) >= 800 or sum(len(x) for x in out) > 50000:
                break
        return "\n".join(out)
    except ImportError:
        text = re.sub(r"<[^>]+>", " ", html)
        return text[:20000]


def main():
    ap = argparse.ArgumentParser(description="URL -> transcript text saved as a title-derived filename in the transcripts/ folder (inside the current repo only)")
    ap.add_argument("url", help="YouTube single-video URL or article/blog/docs URL (no playlists/channels, no podcast/audio files)")
    ap.add_argument("--out", default=None, help="Optional explicit output file name. Placed in the output dir if it has no directory part. Must stay inside the current repo.")
    ap.add_argument("--out-dir", default=None, help="Optional output directory inside the current repo. Defaults to 'transcripts', which is created automatically if it does not exist. Paths outside the repo are refused.")
    ap.add_argument("--languages", nargs="+", default=["en", "en-US", "en-GB"], help="Preferred caption languages in order (default: en en-US en-GB, then any available).")
    ap.add_argument("--min-chars", type=int, default=200)
    args = ap.parse_args()

    # Repo boundary: fail fast before any network — outside paths never touched.
    if args.out_dir and not is_in_repo(pathlib.Path(args.out_dir)):
        print(f"FAILED: --out-dir '{args.out_dir}' is outside the current repo — refusing.", file=sys.stderr)
        print("Use a folder inside the current repo (default: transcripts/).", file=sys.stderr)
        sys.exit(2)
    if args.out:
        out_check = pathlib.Path(args.out)
        if not (not out_check.is_absolute() and str(out_check.parent) in ("", ".")):
            if not is_in_repo(out_check):
                print(f"FAILED: --out '{args.out}' is outside the current repo — refusing.", file=sys.stderr)
                print("Use a filename inside the current repo (default: transcripts/<Title>.txt).", file=sys.stderr)
                sys.exit(2)

    url = args.url.strip()
    if is_audio_url(url):
        print("FAILED: podcast / direct-audio URL detected — audio transcription is not supported.", file=sys.stderr)
        print("Paste the episode transcript manually, then continue from SKILL.md Step 1.", file=sys.stderr)
        sys.exit(2)
    if is_video_file_url(url):
        print("FAILED: direct video file URL detected — file download + transcription is not supported.", file=sys.stderr)
        print("Paste the transcript manually, then continue from SKILL.md Step 1.", file=sys.stderr)
        sys.exit(2)
    if is_channel_url(url):
        print("FAILED: YouTube channel / user / handle URL detected — batch extraction is not supported.", file=sys.stderr)
        print("Pass a single-video URL (the ?v= / youtu.be / shorts / live link), or paste transcripts manually.", file=sys.stderr)
        sys.exit(2)
    if is_playlist_url(url) and not get_youtube_id(url):
        print("FAILED: playlist URL detected — batch extraction is not supported.", file=sys.stderr)
        print("Pass a single-video URL (the ?v= link), or paste transcripts manually.", file=sys.stderr)
        sys.exit(2)
    if is_playlist_url(url) and get_youtube_id(url):
        print("Note: URL contains a playlist (?list=) — extracting the single video (?v=) only.", file=sys.stderr)
    vid = get_youtube_id(url)
    transcript = None
    yt_hint = None

    if vid:
        print(f"Detected YouTube ID: {vid}", file=sys.stderr)
        transcript, yt_hint = youtube_transcript(vid, languages=args.languages)
        if transcript is None and yt_hint:
            print(f"[YouTube captions: {yt_hint}]", file=sys.stderr)

    if not transcript and not vid:
        # Articles only: try the page text. Skipped for YouTube IDs —
        # fetching YouTube watch HTML is slow and almost always <200 chars.
        print(f"Extracting generic page: {url}", file=sys.stderr)
        try:
            transcript = generic_page(url)
        except Exception as e:
            print(f"[Generic page extraction failed: {e}]", file=sys.stderr)
            transcript = None

    if not transcript or len(transcript.strip()) < args.min_chars:
        print(f"FAILED: transcript too short ({len(transcript or '')} chars)", file=sys.stderr)
        if vid:
            print("Tip (YouTube): ensure the video has captions enabled, try --languages <codes>, or paste the transcript manually.", file=sys.stderr)
            print("Tip: age-restricted / private / login-walled videos always need a manual paste.", file=sys.stderr)
        else:
            print("Tip (article): the page may be paywalled or JS-only. Try a different URL or paste the text manually.", file=sys.stderr)
        sys.exit(2)

    title = extract_source_title(url)
    sanitized = sanitize_title(title)
    html_name = generate_html_output_name(title)

    # Output directory: --out-dir wins, otherwise default to a 'transcripts'
    # folder inside the current repo. mkdir(exist_ok=True) creates it on first
    # use if missing. Paths resolving outside the current repo are refused.
    if args.out_dir:
        out_dir = pathlib.Path(args.out_dir)
        if not is_in_repo(out_dir):
            print(f"FAILED: --out-dir '{args.out_dir}' is outside the current repo — refusing.", file=sys.stderr)
            print("Use a folder inside the current repo (default: transcripts/).", file=sys.stderr)
            sys.exit(2)
    else:
        out_dir = pathlib.Path("transcripts")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Output file: --out explicit name, else derived from the real title.
    # --out must also stay inside the current repo.
    if args.out:
        output_path = pathlib.Path(args.out)
        if not output_path.is_absolute() and str(output_path.parent) in ("", "."):
            # bare filename -> put it inside the output dir
            output_path = out_dir / output_path
        else:
            if not is_in_repo(output_path):
                print(f"FAILED: --out '{args.out}' is outside the current repo — refusing.", file=sys.stderr)
                print("Use a filename inside the current repo (default: transcripts/<Title>.txt).", file=sys.stderr)
                sys.exit(2)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            if not is_in_repo(output_path):
                print(f"FAILED: --out '{args.out}' is outside the current repo — refusing.", file=sys.stderr)
                sys.exit(2)
    else:
        output_path = out_dir / pathlib.Path(generate_output_name(title))

    # Handle collisions by adding (1), (2)
    base = output_path.stem
    ext = output_path.suffix
    counter = 1
    while output_path.exists():
        output_path = output_path.with_name(f"{base} ({counter}){ext}")
        counter += 1

    output_path.write_text(transcript, encoding="utf-8")

    # HTML filename suggestion mirrors the transcript name (collision-adjusted if needed)
    if output_path.stem != sanitized:
        html_name = f"{output_path.stem}.html"

    print(f"Wrote transcript: {output_path}")
    print(f"Next lesson HTML should be saved as: {html_name}")


if __name__ == "__main__":
    main()
