const input = document.querySelector("#input");
const outputCode = document.querySelector("#output code");
const status = document.querySelector("#status");
const clearBtn = document.querySelector("#clearBtn");
const exampleBtn = document.querySelector("#exampleBtn");
const copyTreeBtn = document.querySelector("#copyTreeBtn");
const copyMarkdownBtn = document.querySelector("#copyMarkdownBtn");

const EXAMPLE = `Clients/
  Client-A/
    Project-Redesign/
      brief.md
      homepage.html
    Project-Branding/
      logo.svg
  Client-B/
    invoice.pdf
  Client-C/
    Project-Launch/
      assets/
        hero.jpg
      notes.md`;

function indentationWidth(prefix) {
  let width = 0;
  for (const ch of prefix) {
    width += ch === "\t" ? 2 : 1;
  }
  return width;
}

function parseLines(text) {
  const raw = text
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);

  if (!raw.length) return [];

  const entries = raw.map(line => {
    const prefix = line.match(/^[\t ]*/)?.[0] ?? "";
    return {
      rawName: line.trim(),
      indent: indentationWidth(prefix)
    };
  });

  const positiveIndents = [...new Set(entries.map(x => x.indent).filter(Boolean))].sort((a,b) => a-b);
  let unit = positiveIndents[0] || 2;

  // Use the smallest positive delta when it is more reliable than the first indent.
  const deltas = [];
  for (let i = 1; i < positiveIndents.length; i++) {
    const d = positiveIndents[i] - positiveIndents[i - 1];
    if (d > 0) deltas.push(d);
  }
  if (deltas.length) unit = Math.min(unit, ...deltas);

  const root = { children: [] };
  const stack = [{ level: -1, node: root }];

  for (const entry of entries) {
    const level = Math.max(0, Math.round(entry.indent / unit));
    const node = {
      name: entry.rawName,
      isFolder: entry.rawName.endsWith("/"),
      children: []
    };

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(node);
    stack.push({ level, node });
  }

  return root.children;
}

function renderNodes(nodes, prefix = "") {
  const lines = [];

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? "└── " : "├── ";
    lines.push(prefix + connector + node.name);

    if (node.children.length) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      lines.push(...renderNodes(node.children, childPrefix));
    }
  });

  return lines;
}

function generateTree(text) {
  const nodes = parseLines(text);
  if (!nodes.length) return "";

  // If there is exactly one top-level node, render it without a leading branch.
  if (nodes.length === 1) {
    const root = nodes[0];
    const lines = [root.name];
    lines.push(...renderNodes(root.children, ""));
    return lines.join("\n");
  }

  return renderNodes(nodes).join("\n");
}

function refresh() {
  outputCode.textContent = generateTree(input.value);
  status.textContent = "";
}

function flash(message) {
  status.textContent = message;
  window.clearTimeout(flash.timer);
  flash.timer = window.setTimeout(() => {
    status.textContent = "";
  }, 1800);
}

async function copyText(text, successMessage) {
  if (!text) {
    flash("Nothing to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    flash(successMessage);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    flash(successMessage);
  }
}

input.addEventListener("input", refresh);

input.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;

  event.preventDefault();
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;
  const indent = "  ";

  if (start === end) {
    input.value = value.slice(0, start) + indent + value.slice(end);
    input.selectionStart = input.selectionEnd = start + indent.length;
  } else {
    const blockStart = value.lastIndexOf("\\n", start - 1) + 1;
    const block = value.slice(blockStart, end);
    const indented = block
      .split("\\n")
      .map(line => indent + line)
      .join("\n");

    input.value = value.slice(0, blockStart) + indented + value.slice(end);
    input.selectionStart = blockStart;
    input.selectionEnd = blockStart + indented.length;
  }

  refresh();
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  refresh();
  input.focus();
});

exampleBtn.addEventListener("click", () => {
  input.value = EXAMPLE;
  refresh();
  input.focus();
});

copyTreeBtn.addEventListener("click", () => {
  copyText(generateTree(input.value), "Tree copied.");
});

copyMarkdownBtn.addEventListener("click", () => {
  const tree = generateTree(input.value);
  copyText(tree ? "```text\n" + tree + "\n```" : "", "Markdown copied.");
});

refresh();
