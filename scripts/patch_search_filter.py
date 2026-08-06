#!/usr/bin/env python3
"""Patch site-search JS: guard empty terms and use title-weighted matching."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "docs"

OLD = """      var terms = query.toLowerCase().split(/\\s+/).filter(Boolean);
      var matches = entries.filter(function (entry) {
        var haystack = (entry.title + " " + entry.text).toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });"""

NEW = """      var terms = query.toLowerCase().split(/\\s+/).filter(Boolean);
      if (!terms.length) {
        resultsRoot.innerHTML = "<p>Enter a search term above.</p>";
        return;
      }
      var matches = entries.filter(function (entry) {
        var title = (entry.title || "").toLowerCase();
        var text = (entry.text || "").toLowerCase();
        return terms.every(function (term) {
          return title.indexOf(term) !== -1 || text.indexOf(term) !== -1;
        });
      });"""


def main() -> None:
    updated = 0
    for path in ROOT.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        if OLD not in text:
            continue
        path.write_text(text.replace(OLD, NEW), encoding="utf-8")
        updated += 1
    print(f"Patched search filter in {updated} HTML files")


if __name__ == "__main__":
    main()
