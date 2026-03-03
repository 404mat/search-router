import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./global.css";

import { bangs } from "./bang";
import { customBangs } from "./custom-bangs";
import { recordBangUsage, getSortedStats, getTotalSearches, getMostUsedBang, clearStats, exportStats } from "./stats";

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
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });

  copyDefaultButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlDefaultInput.value);
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
            <div class="empty-icon">📊</div>
            <h2>No Statistics Yet</h2>
            <p>Start searching with bangs like <code>!g</code> or <code>!gh</code> to see your usage patterns here.</p>
            <div class="stats-footer">
              <a href="${location.origin + location.pathname}" class="action-btn primary">Back to Search Router</a>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const maxCount = Math.max(...stats.map(([_, stat]) => stat.count));
  const topStats = stats.slice(0, 10);

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
          <h1>Your Search Statistics</h1>
          <p class="stats-subtitle">Track how you use bangs across the web</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-pill">
            <div class="stat-number">${totalSearches.toLocaleString()}</div>
            <div class="stat-desc">Total Searches</div>
          </div>
          <div class="stat-pill">
            <div class="stat-number">${stats.length}</div>
            <div class="stat-desc">Unique Bangs</div>
          </div>
          <div class="stat-pill">
            <div class="stat-number">!${mostUsed?.bang}</div>
            <div class="stat-desc">Most Used (${mostUsed?.count})</div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h2>Top Bangs</h2>
            <p class="chart-subtitle">Your most frequently used search shortcuts</p>
          </div>
          <div class="vertical-chart">
            ${topStats.map(([bang, stat], index) => {
              const percentage = (stat.count / maxCount) * 100;
              const name = getBangName(bang);
              return `
                <div class="chart-column" style="animation-delay: ${index * 80}ms">
                  <div class="column-bar-wrapper">
                    <div class="column-bar" data-height="${percentage}%" style="height: 0%"></div>
                  </div>
                  <div class="column-label" title="!${bang}">${name}</div>
                  <div class="column-count">${stat.count}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="stats-footer">
          <button id="export-btn" class="action-btn">Export JSON</button>
          <button id="clear-btn" class="action-btn danger">Clear Data</button>
          <a href="${location.origin + location.pathname}" class="action-btn secondary">Back</a>
        </div>
      </div>
    </div>
  `;

  // Animate bars after render
  setTimeout(() => {
    const bars = app.querySelectorAll<HTMLElement>('.column-bar');
    bars.forEach(bar => {
      bar.style.height = bar.dataset.height || '0%';
    });
  }, 100);

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
  
  // Record stats before redirect
  const query = url.searchParams.get("q")?.trim() ?? "";
  const match = query.match(/!(\S+)/i);
  if (match) {
    const bang = match[1].toLowerCase();
    recordBangUsage(bang);
  }
  
  window.location.replace(searchUrl);
}

doRedirect();
