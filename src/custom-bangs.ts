export const customBangs = [
  {
    c: "AI",
    d: "chat.openai.com",
    r: 0,
    s: "ChatGPT",
    sc: "AI",
    t: "aic", // meaning "AI Chat"
    u: "https://chat.openai.com?q={{{s}}}", // todo: have a way to set favorite model in local storage
  },
  {
    c: "Perplexity",
    d: "www.perplexity.ai",
    r: 0,
    s: "Perplexity",
    sc: "AI",
    t: "ppx",
    u: "https://www.perplexity.ai/search?s=o&q={{{s}}}",
  },
  {
    c: "DuckDuckGo Bangs",
    d: "www.duckduckgo.com",
    r: 0,
    s: "DuckDuckGo Bangs",
    sc: "",
    t: "bang",
    u: "https://duckduckgo.com/bangs?q={{{s}}}",
  },
  {
    c: "Online Services",
    d: "www.google.com",
    r: 0,
    s: "Google (Clean)",
    sc: "Google",
    t: "gc",
    u: "https://www.google.com/search?udm=14&q={{{s}}}",
  },
  {
    c: "Online Services",
    d: "twitter.com",
    r: 9964,
    s: "Twitter",
    sc: "Social",
    t: "twt",
    u: "https://twitter.com/search?q={{{s}}}",
  },
];
