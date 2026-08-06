#!/usr/bin/env python3
"""Fix double-prefixed search JS paths in deployed HTML (GitHub Pages project site)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "docs"

REPLACEMENTS = (
    (
        'var searchPath = (base || "") + "/paresearchcenter/search/";',
        'var searchPath = (base || "") + "/search/";',
    ),
    (
        'fetch(pageUrl("/paresearchcenter/search-index.json"))',
        'fetch(pageUrl("/search-index.json"))',
    ),
    (
        """  function pageUrl(path) {
    return (base || "") + path;
  }""",
        """  function pageUrl(path) {
    if (base && path.indexOf(base) === 0) {
      return path;
    }
    return (base || "") + path;
  }""",
    ),
)


def main() -> None:
    updated = 0
    for path in ROOT.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        fixed = text
        for old, new in REPLACEMENTS:
            fixed = fixed.replace(old, new)
        if fixed != text:
            path.write_text(fixed, encoding="utf-8")
            updated += 1
    print(f"Updated {updated} HTML files under {ROOT}/")


if __name__ == "__main__":
    main()
