const fs = require("fs");
const path = require("path");
function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith(".html")) a.push(p);
  }
  return a;
}
const root = path.join(__dirname, "..");
for (const f of walk(root)) {
  const t = fs.readFileSync(f, "utf8");
  if (!/name\s*=\s*["']viewport["']/i.test(t)) console.log(path.relative(root, f));
}
