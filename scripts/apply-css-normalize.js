/**
 * Batch-normalize HTML widgets: viewport, box-sizing, mobile base, px→rem in <style>.
 * Skips px→rem for a <style> block that contains @media (avoids breaking breakpoints).
 * Fragment pages: see scripts/wrap-invalid-html.js. Run: node scripts/apply-css-normalize.js [--dry]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const BOX_MOBILE = `*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
img, video, canvas, svg { max-width: 100%; height: auto; }
`;

const MOBILE_ONLY = `html { -webkit-text-size-adjust: 100%; }
img, video, canvas, svg { max-width: 100%; height: auto; }
`;

function walkHtml(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** px -> rem at 16px root; preserve 0 and 1px hairlines */
function pxToRemBody(css) {
  if (/@media/i.test(css)) return css;
  return css.replace(/(-?[0-9.]+)px\b/g, (full, numStr) => {
    const n = parseFloat(numStr);
    if (Number.isNaN(n)) return full;
    if (n === 0) return "0";
    if (Math.abs(n - 1) < 1e-9) return "1px";
    const rem = n / 16;
    let s = rem.toFixed(4).replace(/\.?0+$/, "");
    if (s === "" || s === "-") s = "0";
    return `${s}rem`;
  });
}

function ensureViewport(html) {
  if (/name\s*=\s*["']viewport["']/i.test(html)) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(
      /<head([^>]*)>/i,
      `<head$1>\n    <meta name="viewport" content="width=device-width, initial-scale=1">`
    );
  }
  return html;
}

function injectAfterFirstStyleOpen(html, snippet) {
  if (!/<style[^>]*>/i.test(html)) return null;
  return html.replace(/<style([^>]*)>/i, `<style$1>\n${snippet}\n`);
}

function injectStyleInHead(html, snippet) {
  if (!/<head[^>]*>/i.test(html)) return html;
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `    <style>\n${snippet}\n    </style>\n</head>`);
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n    <style>\n${snippet}\n    </style>`);
}

function ensureBoxSizingAndMobile(html) {
  const hasBox = /box-sizing\s*:/i.test(html);
  const hasTextAdjust = /text-size-adjust/i.test(html);
  const hasImgMax = /max-width:\s*100%/i.test(html) && /img/i.test(html);

  if (!hasBox) {
    const tryStyle = injectAfterFirstStyleOpen(html, BOX_MOBILE);
    if (tryStyle !== null) return tryStyle;
    return injectStyleInHead(html, BOX_MOBILE) ?? html;
  }

  if (!hasTextAdjust || !hasImgMax) {
    const tryStyle = injectAfterFirstStyleOpen(html, MOBILE_ONLY);
    if (tryStyle !== null) return tryStyle;
    return injectStyleInHead(html, MOBILE_ONLY) ?? html;
  }

  return html;
}

function convertStyleBlocksPxToRem(html) {
  return html.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (full, attrs, body) => {
    return `<style${attrs}>${pxToRemBody(body)}</style>`;
  });
}

function run({ dry = false } = {}) {
  const files = walkHtml(ROOT);
  let n = 0;
  for (const abs of files) {
    let t = fs.readFileSync(abs, "utf8");
    const orig = t;
    t = ensureViewport(t);
    t = ensureBoxSizingAndMobile(t);
    t = convertStyleBlocksPxToRem(t);
    if (t !== orig) {
      n++;
      if (!dry) fs.writeFileSync(abs, t, "utf8");
    }
  }
  console.log(`HTML files: ${files.length}, modified: ${n}${dry ? " (dry)" : ""}.`);
}

run({ dry: process.argv.includes("--dry") });
