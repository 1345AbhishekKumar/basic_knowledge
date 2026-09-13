"""Smoke tests for pure helpers in scripts/extract_transcript.py (no network)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from extract_transcript import (
    generate_html_output_name,
    generate_output_name,
    get_youtube_id,
    is_audio_url,
    is_channel_url,
    is_in_repo,
    is_playlist_url,
    is_video_file_url,
    sanitize_title,
)


def test_sanitize_basic():
    assert sanitize_title("How Gravity Works? (Explained)") == "How Gravity Works_ (Explained)"


def test_sanitize_never_transcript_txt():
    assert sanitize_title("") == "untitled"
    assert sanitize_title("   ") == "untitled"
    assert generate_output_name("") == "untitled.txt"
    assert generate_output_name("   ") != "transcript.txt"


def test_sanitize_limit():
    assert len(sanitize_title("a" * 200)) <= 120


def test_sanitize_invalid_chars():
    # Every invalid char \ / : * ? " < > | becomes _
    assert sanitize_title('a/b\\c:d*e?f"g<h>i|j') == "a_b_c_d_e_f_g_h_i_j"
    # Whitespace collapses, trims, preserves Title Case and spaces
    assert sanitize_title("  How   Gravity\tWorks  ") == "How Gravity Works"
    assert sanitize_title("How Gravity Works") == "How Gravity Works"


def test_output_names():
    assert generate_output_name("How Gravity Works") == "How Gravity Works.txt"
    assert generate_html_output_name("How Gravity Works") == "How Gravity Works.html"
    assert generate_output_name("a/b:c") == "a_b_c.txt"
    assert generate_html_output_name("a/b:c") == "a_b_c.html"


def test_youtube_ids():
    assert get_youtube_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_youtube_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_youtube_id("https://www.youtube.com/shorts/abc123XYZ_-") == "abc123XYZ_-"
    assert get_youtube_id("https://example.com/article") is None


def test_youtube_ids_extended():
    assert get_youtube_id("https://www.youtube.com/embed/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_youtube_id("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_youtube_id("https://www.youtube.com/v/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    assert get_youtube_id("https://www.youtube.com/live/LiveID12345") == "LiveID12345"
    assert get_youtube_id("https://www.youtube.com/watch?v=abc&list=PL123") == "abc"
    # Channels/handles are not videos
    assert get_youtube_id("https://www.youtube.com/@somehandle") is None
    assert get_youtube_id("https://www.youtube.com/channel/UC12345") is None


def test_playlist():
    assert is_playlist_url("https://www.youtube.com/playlist?list=PL123") is True
    assert is_playlist_url("https://www.youtube.com/watch?v=abc&list=PL123") is True
    assert is_playlist_url("https://www.youtube.com/watch?v=abc") is False
    assert is_playlist_url("https://example.com/article") is False


def test_channel():
    assert is_channel_url("https://www.youtube.com/channel/UC12345") is True
    assert is_channel_url("https://www.youtube.com/c/SomeName") is True
    assert is_channel_url("https://www.youtube.com/user/SomeName") is True
    assert is_channel_url("https://www.youtube.com/@somehandle") is True
    assert is_channel_url("https://www.youtube.com/@somehandle/videos") is True
    assert is_channel_url("https://www.youtube.com/watch?v=abc") is False
    assert is_channel_url("https://www.youtube.com/playlist?list=PL123") is False
    assert is_channel_url("https://example.com/article") is False


def test_audio_vs_video():
    assert is_audio_url("https://example.com/ep.mp3") is True
    assert is_audio_url("https://www.youtube.com/watch?v=abc") is False
    # direct .mp4 is video, not audio
    assert is_audio_url("https://example.com/video.mp4") is False
    assert is_video_file_url("https://example.com/video.mp4") is True
    assert is_video_file_url("https://www.youtube.com/watch?v=abc") is False
    assert is_video_file_url("https://youtu.be/abc") is False


def test_audio_hosts_and_feeds():
    assert is_audio_url("https://open.spotify.com/episode/abc123") is True
    assert is_audio_url("https://podcasts.apple.com/us/podcast/x/id123") is True
    assert is_audio_url("https://example.com/feed.xml") is True
    assert is_audio_url("https://example.com/rss.xml") is True
    assert is_audio_url("https://example.com/ep.ogg") is True
    assert is_audio_url("https://example.com/ep.m4b") is True
    assert is_audio_url("https://example.com/article") is False


def test_in_repo():
    cwd = Path.cwd().resolve()
    assert is_in_repo(cwd) is True
    assert is_in_repo(cwd / "transcripts") is True
    assert is_in_repo(cwd / "transcripts" / "New Title.txt") is True
    assert is_in_repo(Path("transcripts")) is True
    assert is_in_repo(Path("lessons")) is True
    # Outside the repo must be refused
    assert is_in_repo(cwd.parent / "outside.txt") is False
    assert is_in_repo(Path("../outside.txt")) is False


if __name__ == "__main__":
    for name, fn in sorted(
        [(k, v) for k, v in globals().items() if k.startswith("test_")]
    ):
        fn()
        print(f"PASS {name}")
