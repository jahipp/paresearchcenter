#!/usr/bin/env python3
"""Install external site-search.js on all docs HTML pages."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"
INLINE_RE = re.compile(r'<script id="site-search-js">.*?</script>\s*', re.S)
EXTERNAL = '<script defer src="/paresearchcenter/site-search.js"></script>\n'


def main() -> None:
    updated = 0
    for path in DOCS.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        if 'src="/paresearchcenter/site-search.js"' in text:
            continue
        if 'id="site-search-js"' not in text:
            if path.name == "index.html" and path.parent == DOCS:
                if EXTERNAL.strip() not in text:
                    text = text.replace("</body>", EXTERNAL + "</body>")
                    path.write_text(text, encoding="utf-8")
                    updated += 1
            continue
        fixed = INLINE_RE.sub(EXTERNAL, text, count=1)
        if fixed != text:
            path.write_text(fixed, encoding="utf-8")
            updated += 1
    print(f"Updated {updated} HTML files")


if __name__ == "__main__":
    main()
