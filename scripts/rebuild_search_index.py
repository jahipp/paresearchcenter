#!/usr/bin/env python3
"""Rebuild docs/search-index.json from main content only (no sidebar widgets)."""
from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"
SKIP_PREFIXES = ("wp-content/", "wp-includes/", "search/")

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def page_url(path: Path) -> str:
    rel = path.relative_to(DOCS).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def page_title(html: str) -> str:
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    if not m:
        return ""
    title = unescape(m.group(1).strip())
    for suffix in (" – Physical Activity Research Center", " - Physical Activity Research Center"):
        if title.endswith(suffix):
            title = title[: -len(suffix)]
    return title.strip()


def main_text(html: str) -> str:
    m = re.search(r'<main[^>]*\bid="main"[^>]*>(.*?)</main>', html, re.I | re.S)
    if not m:
        return ""
    chunk = m.group(1)
    parts = re.findall(
        r'<div class="entry-content"[^>]*>(.*?)</div>\s*<!-- \.entry-content -->',
        chunk,
        re.I | re.S,
    )
    if not parts:
        parts = [chunk]
    text = " ".join(unescape(TAG_RE.sub(" ", part)) for part in parts)
    return WS_RE.sub(" ", text).strip()


def main() -> None:
    entries: list[dict[str, str]] = []
    for path in sorted(DOCS.rglob("*.html")):
        rel = path.relative_to(DOCS).as_posix()
        if rel.startswith(SKIP_PREFIXES):
            continue
        if rel == "404.html":
            continue

        html = path.read_text(encoding="utf-8")
        title = page_title(html)
        text = main_text(html)
        if not title and not text:
            continue

        entries.append(
            {
                "title": title or rel,
                "url": page_url(path),
                "text": text,
            }
        )

    out = DOCS / "search-index.json"
    out.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {out}")


if __name__ == "__main__":
    main()
