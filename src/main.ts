import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./global.css";

import { bangs } from "./bang";
import { customBangs } from "./custom-bangs";
import { recordBangUsage, getSortedStats, getTotalSearches, getMostUsedBang, clearStats, exportStats } from "./stats";
import { squarify } from "./treemap";

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Search Router</h1>
        <p>Add the following URL as a custom search engine to your browser. It enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs</a>, but runs it faster, and locally.</p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            id="url-input"
            value="${location.origin + location.pathname}?q=%s"
            readonly
          />
          <button class="copy-button" id="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>

        <div class="customize-container">
          <h4>Want to customize the default bang ? Add it to the URL like this.</h4>
          <div class="url-container"> 
            <input 
              type="text" 
              class="url-input"
              id="url-default-input"
              value="${location.origin + location.pathname}?q=%s&default=g"
              readonly
            />
            <button class="copy-button" id="copy-default-button">
              <img src="/clipboard.svg" alt="Copy" />
            </button>
          </div>
        </div>
        
      </div>
      <footer class="footer">
        <a href="https://www.youtube.com/watch?v=_DnNzRaBWUU" target="_blank">how it works</a>
        •
        <a href="https://github.com/404mat/search-router" target="_blank">github</a>
        •
        <a href="${location.origin + location.pathname}?stats">view stats</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>("#copy-button")!;
  const copyDefaultButton = app.querySelector<HTMLButtonElement>(
    "#copy-default-button"
  )!;
  const urlInput = app.querySelector<HTMLInputElement>("#url-input")!;
  const urlDefaultInput =
    app.querySelector<HTMLInputElement>("#url-default-input")!;
  const copyIcon = copyButton.querySelector("img")!;
  const copyDefaultIcon = copyDefaultButton.querySelector("img")!;

  copyButton.addEventListener("click", async () => {
    await copyToClipboard(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  copyDefaultButton.addEventListener("click", async () => {
    await copyToClipboard(urlDefaultInput.value);
    copyDefaultIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyDefaultIcon.src = "/clipboard.svg";
    }, 2000);
  });
}

function renderStatsPage() {
  const stats = getSortedStats();
  const totalSearches = getTotalSearches();
  const mostUsed = getMostUsedBang();

  const app = document.querySelector<HTMLDivElement>("#app")!;

  if (stats.length === 0) {
    app.innerHTML = `
      <div class="stats-page">
        <div class="stats-container">
          <div class="empty-state">
            <h2>No statistics yet</h2>
            <p>Search with bangs like <code>!g</code> or <code>!gh</code> and this page will fill in.</p>
            <div class="stats-footer">
              <a href="${location.origin + location.pathname}" class="action-btn primary">Back</a>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Lookup function to get website name from bang
  const getBangName = (bangTrigger: string): string => {
    const allBangs = [...customBangs, ...bangs]; // customBangs first to override defaults
    const bang = allBangs.find(b => b.t === bangTrigger);
    return bang?.s || `!${bangTrigger}`;
  };

  app.innerHTML = `
    <div class="stats-page">
      <div class="stats-container">
        <div class="stats-header">
          <h1>Search statistics</h1>
          <p class="summary-line">
            ${totalSearches.toLocaleString()} searches
            · ${stats.length} bangs
            · most used !${mostUsed?.bang} ${mostUsed ? `<span class="summary-count">${mostUsed.count.toLocaleString()}</span>` : ""}
          </p>
        </div>

        <div class="treemap" id="treemap" role="list" aria-label="Bang usage tiles, sized by number of searches"></div>

        <div class="stats-footer">
          <button id="export-btn" class="action-btn">Export JSON</button>
          <button id="clear-btn" class="action-btn danger">Clear Data</button>
          <a href="${location.origin + location.pathname}" class="action-btn secondary">Back</a>
        </div>
      </div>
    </div>
  `;

  // Build one tile per bang; geometry comes from the squarified layout.
  const MAX_TILES = 20;
  const shown = stats.slice(0, MAX_TILES);
  const rest = stats.slice(shown.length);
  const basicTiles: Array<{ bang: string; name: string; count: number }> = shown.map(
    ([bang, stat]) => ({ bang, name: getBangName(bang), count: stat.count })
  );
  if (rest.length > 0) {
    basicTiles.push({
      bang: `+${rest.length}`,
      name: "more",
      count: rest.reduce((sum, [, stat]) => sum + stat.count, 0),
    });
  }

  const container = app.querySelector<HTMLElement>("#treemap")!;
  const weights = basicTiles.map((tile) => tile.count);
  const tiles: Array<HTMLElement | null> = basicTiles.map((tile) => {
    const countText = tile.count.toLocaleString();
    const share = ((tile.count / totalSearches) * 100).toFixed(1);
    const isMore = tile.name === "more";
    const title = isMore
      ? `${tile.bang} more bangs, ${countText} searches (${share}%)`
      : `!${tile.bang} — ${tile.name} — ${countText} searches (${share}%)`;
    const label = isMore
      ? `<span class="tile-bang more-bang">+${tile.bang.slice(1)} more</span><span class="tile-count">${countText}</span>`
      : `<span class="tile-name">${tile.name}</span><span class="tile-bang">!${tile.bang}</span><span class="tile-count">${countText}</span>`;
    const el = document.createElement("div");
    el.className = "tile" + (isMore ? " more" : "");
    el.setAttribute("role", "listitem");
    el.setAttribute("title", title);
    el.setAttribute("aria-label", title);
    el.innerHTML = label;
    container.appendChild(el);
    return el;
  });

  const GAP = 2; // inset between tiles, in px

  const layout = () => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= GAP || rect.height <= GAP) return;
    const rects = squarify(weights, rect.width, rect.height);
    rects.forEach((r, i) => {
      const tile = tiles[i];
      if (!tile || !r) return;
      tile.style.left = `${r.x + GAP / 2}px`;
      tile.style.top = `${r.y + GAP / 2}px`;
      tile.style.width = `${Math.max(r.w - GAP, 0)}px`;
      tile.style.height = `${Math.max(r.h - GAP, 0)}px`;

      const fitAll = r.w >= 72 && r.h >= 62;   // name + bang + count
      const fitCompact = r.w >= 44 && r.h >= 25; // "!bang  count" on one line
      tile.classList.toggle("accent", i === 0);
      tile.classList.toggle("detailed", fitAll);
      tile.classList.toggle("compact", !fitAll && fitCompact);
      tile.classList.toggle("bare", !fitCompact);
    });
  };

  const ro = new ResizeObserver(layout);
  ro.observe(container);
  layout();

  // Add event listeners
  const exportBtn = app.querySelector<HTMLButtonElement>("#export-btn")!;
  const clearBtn = app.querySelector<HTMLButtonElement>("#clear-btn")!;

  exportBtn.addEventListener("click", () => {
    const data = exportStats();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "search-stats.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Clear all statistics? This cannot be undone.")) {
      clearStats();
      renderStatsPage();
    }
  });
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const urlDefault =
    url.searchParams.get("default")?.trim() ??
    localStorage.getItem("default-bang") ??
    "g";
  const defaultBang = bangs.find((b) => b.t === urlDefault);

  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const ddgBand = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;
  const customBang = customBangs.find((b) => b.t === bangCandidate);
  const selectedBang = customBang ?? ddgBand;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const url = new URL(window.location.href);
  
  // Check if we should show stats page
  if (url.searchParams.get("stats") !== null) {
    renderStatsPage();
    return;
  }
  
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  
  // Record stats before redirect — only for known bangs: bare queries ride
  // the default bang and unknown tokens never resolve, so neither is counted.
  const query = url.searchParams.get("q")?.trim() ?? "";
  const match = query.match(/!(\S+)/i);
  if (match) {
    const bang = match[1].toLowerCase();
    const known = [...customBangs, ...bangs].some((b) => b.t === bang);
    if (known) recordBangUsage(bang);
  }
  
  window.location.replace(searchUrl);
}

doRedirect();
