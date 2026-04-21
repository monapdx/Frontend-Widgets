/**
 * Wraps fragment / invalid HTML files with a minimal valid document + viewport.
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function wrapLinkFirst(rel, title) {
  const abs = path.join(root, ...rel.split("/"));
  let raw = fs.readFileSync(abs, "utf8");
  if (/name\s*=\s*["']viewport["']/i.test(raw)) return;
  const m = raw.match(/^(\s*<link[^>]+>\s*)([\s\S]*)$/i);
  if (!m) {
    console.error("no leading link", rel);
    return;
  }
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
${m[1].trim()}
</head>
<body>

${m[2].trim()}

</body>
</html>
`;
  fs.writeFileSync(abs, out, "utf8");
  console.log("wrapped link-first", rel);
}

wrapLinkFirst("alt-text-generator.html", "Alt text generator");
wrapLinkFirst("fake-data-generator.html", "Fake data generator");

/* Style-first: split at first visible heading or form after </style> */
function wrapAfterStyle(rel, title) {
  const abs = path.join(root, ...rel.split("/"));
  let raw = fs.readFileSync(abs, "utf8");
  if (/name\s*=\s*["']viewport["']/i.test(raw)) return;
  const endStyle = raw.indexOf("</style>");
  if (endStyle === -1) {
    console.error("no style", rel);
    return;
  }
  const afterStyle = endStyle + "</style>".length;
  const headContent = raw.slice(0, afterStyle).trim();
  const bodyContent = raw.slice(afterStyle).trim();
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
${headContent}
</head>
<body>

${bodyContent}

</body>
</html>
`;
  fs.writeFileSync(abs, out, "utf8");
  console.log("wrapped style-first", rel);
}

wrapAfterStyle("dictionary.html", "Dictionary");
wrapAfterStyle("notes.html", "Notes");
wrapAfterStyle("qr-codes.html", "QR codes");

/* Thesaurus: script + style + form — bundle into head/body */
(function thesaurus() {
  const abs = path.join(root, "thesaurus.html");
  let raw = fs.readFileSync(abs, "utf8");
  if (/name\s*=\s*["']viewport["']/i.test(raw)) return;
  const formIdx = raw.indexOf("<form");
  if (formIdx === -1) return;
  const headContent = raw.slice(0, formIdx).trim();
  const bodyContent = raw.slice(formIdx).trim();
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thesaurus</title>
${headContent}
</head>
<body>

${bodyContent}

</body>
</html>
`;
  fs.writeFileSync(abs, out, "utf8");
  console.log("wrapped thesaurus");
})();

/* UI partials: wrap entire file */
const partials = [
  ["ui-core/codeblock/minimal.html", "Code block minimal"],
  ["ui-core/codeblock/collapsable.html", "Code block collapsible"],
  ["ui-enhancers/command-palette/index.html", "Command palette"],
  ["ui-enhancers/drag-drop/index.html", "Drag and drop"],
  ["ui-enhancers/tooltips/index.html", "Tooltips"],
  ["ui-kit/forms/index.html", "Form components"],
  ["ui-kit/theme/index.html", "Theme"],
  ["kindle-cookbooks/demo/index.html", "Kindle demo"],
  ["svg/demo/masonry.html", "SVG masonry demo"],
];
for (const [rel, title] of partials) {
  const abs = path.join(root, ...rel.split("/"));
  if (!fs.existsSync(abs)) {
    console.error("missing", rel);
    continue;
  }
  let raw = fs.readFileSync(abs, "utf8");
  if (/name\s*=\s*["']viewport["']/i.test(raw)) {
    console.log("skip", rel);
    continue;
  }
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body>

${raw.trim()}

</body>
</html>
`;
  fs.writeFileSync(abs, out, "utf8");
  console.log("wrapped partial", rel);
}
