import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./global.css";

import { bangs } from "./bang";
import { customBangs } from "./custom-bangs";

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
            value="${import.meta.env.VITE_PUBLIC_URL}?q=%s"
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
              value="${import.meta.env.VITE_PUBLIC_URL}?q=%s&default=g"
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

  // e.g. If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
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
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
