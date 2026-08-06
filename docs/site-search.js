(function () {
  var meta = document.querySelector('meta[name="site-base"]');
  var base = meta ? meta.getAttribute("content") || "" : "";
  var searchPath = (base || "") + "/search/";

  function pageUrl(path) {
    if (!path) {
      return base || "/";
    }
    if (base && path.indexOf(base) === 0) {
      return path;
    }
    return (base || "") + path;
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || params.get("s") || "";
    if (!q && window.location.hash.length > 1) {
      var hash = window.location.hash.charAt(0) === "#"
        ? window.location.hash.slice(1)
        : window.location.hash;
      if (hash.indexOf("=") >= 0) {
        q = new URLSearchParams(hash).get("q") || new URLSearchParams(hash).get("s") || "";
      } else if (hash.charAt(0) === "q=") {
        q = decodeURIComponent(hash.slice(2));
      }
    }
    return q.trim();
  }

  document.querySelectorAll("form.searchform").forEach(function (form) {
    form.setAttribute("action", searchPath);
    form.setAttribute("method", "get");
    form.setAttribute("role", "search");

    var field = form.querySelector('input[name="q"], input[name="s"], input[type="search"]');
    if (field && field.getAttribute("name") !== "q") {
      field.setAttribute("name", "q");
    }

    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"], input[name="s"], input[type="search"]');
      var query = input && input.value.trim();
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = searchPath + "?q=" + encodeURIComponent(query);
    });
  });

  var resultsRoot = document.getElementById("site-search-results");
  if (!resultsRoot) {
    return;
  }

  var query = readQuery();
  var searchInput = document.querySelector(
    '.entry-content form.searchform input[name="q"], .entry-content form.searchform input[type="search"]'
  ) || document.querySelector('form.searchform input[name="q"], form.searchform input[type="search"]');

  if (searchInput && query) {
    searchInput.value = query;
  }

  if (!query) {
    resultsRoot.innerHTML = "<p>Enter a search term above.</p>";
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

      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
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
      });

      if (!matches.length) {
        resultsRoot.innerHTML = "<p>No results for <strong></strong>.</p>";
        resultsRoot.querySelector("strong").textContent = query;
        return;
      }

      var html = "<p>" + matches.length + " result(s) for <strong></strong></p><ul class=\"site-search-results\">";
      matches.slice(0, 50).forEach(function (entry) {
        html += '<li><a href="' + pageUrl(entry.url) + '">' + entry.title + "</a></li>";
      });
      html += "</ul>";
      if (matches.length > 50) {
        html += "<p>Showing the first 50 results.</p>";
      }
      resultsRoot.innerHTML = html;
      resultsRoot.querySelector("strong").textContent = query;
    })
    .catch(function () {
      resultsRoot.innerHTML = "<p>Search is temporarily unavailable.</p>";
    });
})();
