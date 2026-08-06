(function () {
  var meta = document.querySelector('meta[name="site-base"]');
  var base = meta ? meta.getAttribute("content") || "" : "";
  var homePath = (base || "") + "/";
  var PER_PAGE = 10;

  function pageUrl(path) {
    if (!path) {
      return homePath;
    }
    if (base && path.indexOf(base) === 0) {
      return path;
    }
    return (base || "") + path;
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("s") || params.get("q") || "").trim();
  }

  function readPage() {
    var params = new URLSearchParams(window.location.search);
    var paged = parseInt(params.get("paged") || params.get("page") || "1", 10);
    return paged > 0 ? paged : 1;
  }

  function isHomePage() {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    var home = (base || "").replace(/\/+$/, "") || "";
    return path === home || path === home + "/index.html" || (!base && path === "");
  }

  function scoreEntry(entry, terms) {
    var title = (entry.title || "").toLowerCase();
    var excerpt = (entry.excerpt || "").toLowerCase();
    var text = (entry.text || "").toLowerCase();
    var score = 0;

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var inTitle = title.indexOf(term) !== -1;
      var inExcerpt = excerpt.indexOf(term) !== -1;
      var inText = text.indexOf(term) !== -1;
      if (!inTitle && !inExcerpt && !inText) {
        return -1;
      }
      if (inTitle) {
        score += 100;
      }
      if (inExcerpt) {
        score += 30;
      }
      if (inText) {
        score += 10;
      }
    }
    if (entry.type === "post") {
      score += 5;
    }
    return score;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function excerptAroundTerms(entry, terms) {
    var source = entry.excerpt || entry.text || "";
    if (!source) {
      return "";
    }
    var lower = source.toLowerCase();
    var idx = -1;
    for (var i = 0; i < terms.length; i++) {
      idx = lower.indexOf(terms[i]);
      if (idx !== -1) {
        break;
      }
    }
    if (idx === -1) {
      return source.length > 260 ? source.slice(0, 257) + "…" : source;
    }
    var start = Math.max(0, idx - 80);
    var snippet = source.slice(start, start + 260).trim();
    if (start > 0) {
      snippet = "…" + snippet;
    }
    if (start + 260 < source.length) {
      snippet += "…";
    }
    return snippet;
  }

  function renderResults(entries, query, page) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = entries
      .map(function (entry) {
        return { entry: entry, score: scoreEntry(entry, terms) };
      })
      .filter(function (item) {
        return item.score >= 0;
      })
      .sort(function (a, b) {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (b.entry.date || "").localeCompare(a.entry.date || "");
      });

    var total = matches.length;
    var start = (page - 1) * PER_PAGE;
    var pageItems = matches.slice(start, start + PER_PAGE);
    var html = "";

    if (!pageItems.length) {
      return '<p class="site-search-empty">No results for <strong>' + escapeHtml(query) + "</strong>.</p>";
    }

    pageItems.forEach(function (item) {
      var entry = item.entry;
      html += '<article class="site-search-result hentry">';
      html += '<h2 class="entry-title"><a href="' + pageUrl(entry.url) + '">' + escapeHtml(entry.title) + "</a></h2>";
      html += "<p>" + escapeHtml(excerptAroundTerms(entry, terms)) + "</p>";
      if (entry.author || entry.date || entry.category) {
        html += '<div class="entry-meta entry-utility site-search-meta">';
        if (entry.author) {
          html += "<span>" + escapeHtml(entry.author) + "</span> ";
        }
        if (entry.date) {
          html += "<span>" + escapeHtml(entry.date) + "</span> ";
        }
        if (entry.category) {
          html += "<span>" + escapeHtml(entry.category) + "</span>";
        }
        html += "</div>";
      }
      html += "</article>";
    });

    var totalPages = Math.ceil(total / PER_PAGE);
    if (totalPages > 1) {
      html += '<nav class="navigation pagination site-search-pagination" aria-label="Search results pages"><div class="nav-links">';
      for (var p = 1; p <= totalPages; p++) {
        if (p === page) {
          html += '<span aria-current="page" class="page-numbers current">' + p + "</span>";
        } else {
          html +=
            '<a class="page-numbers" href="' +
            homePath +
            "?s=" +
            encodeURIComponent(query) +
            "&paged=" +
            p +
            '">' +
            p +
            "</a>";
        }
      }
      html += "</div></nav>";
    }

    return html;
  }

  document.querySelectorAll("form.searchform").forEach(function (form) {
    form.setAttribute("action", homePath);
    form.setAttribute("method", "get");
    form.setAttribute("role", "search");

    var field = form.querySelector('input[name="q"], input[name="s"], input[type="search"]');
    if (field) {
      field.setAttribute("name", "s");
    }

    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="s"], input[type="search"]');
      var query = input && input.value.trim();
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = homePath + "?s=" + encodeURIComponent(query);
    });
  });

  var query = readQuery();
  if (!query) {
    return;
  }

  if (!isHomePage() && /\/search\/?$/i.test(window.location.pathname)) {
    window.location.replace(homePath + "?s=" + encodeURIComponent(query));
    return;
  }

  if (!isHomePage()) {
    return;
  }

  var homeContent = document.getElementById("site-home-content");
  var searchView = document.getElementById("site-search-view");
  var resultsRoot = document.getElementById("site-search-results");
  var queryLabel = document.getElementById("site-search-query-label");

  if (homeContent) {
    homeContent.style.display = "none";
  }
  if (searchView) {
    searchView.style.display = "block";
  }
  if (queryLabel) {
    queryLabel.textContent = query;
  }
  document.title = 'Search Results for "' + query + '" – Physical Activity Research Center';

  document.querySelectorAll('form.searchform input[name="s"], form.searchform input[type="search"]').forEach(function (input) {
    input.value = query;
  });

  if (!resultsRoot) {
    return;
  }

  resultsRoot.innerHTML = "<p>Searching…</p>";
  fetch(pageUrl("/search-index.json"))
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Search index not found");
      }
      return response.json();
    })
    .then(function (entries) {
      if (!Array.isArray(entries)) {
        throw new Error("Invalid search index");
      }
      resultsRoot.innerHTML = renderResults(entries, query, readPage());
    })
    .catch(function () {
      resultsRoot.innerHTML = "<p>Search is temporarily unavailable.</p>";
    });
})();
