const TAILWIND_COLORS = [
  { name: "slate-50", hex: "#f8fafc" }, { name: "slate-100", hex: "#f1f5f9" },
  { name: "slate-200", hex: "#e2e8f0" }, { name: "slate-300", hex: "#cbd5e1" },
  { name: "slate-400", hex: "#94a3b8" }, { name: "slate-500", hex: "#64748b" },
  { name: "slate-600", hex: "#475569" }, { name: "slate-700", hex: "#334155" },
  { name: "slate-800", hex: "#1e293b" }, { name: "slate-900", hex: "#0f172a" },

  { name: "gray-50", hex: "#f9fafb" }, { name: "gray-100", hex: "#f3f4f6" },
  { name: "gray-200", hex: "#e5e7eb" }, { name: "gray-300", hex: "#d1d5db" },
  { name: "gray-400", hex: "#9ca3af" }, { name: "gray-500", hex: "#6b7280" },
  { name: "gray-600", hex: "#4b5563" }, { name: "gray-700", hex: "#374151" },
  { name: "gray-800", hex: "#1f2937" }, { name: "gray-900", hex: "#111827" },

  { name: "zinc-50", hex: "#fafafa" }, { name: "zinc-100", hex: "#f4f4f5" },
  { name: "zinc-200", hex: "#e4e4e7" }, { name: "zinc-300", hex: "#d4d4d8" },
  { name: "zinc-400", hex: "#a1a1aa" }, { name: "zinc-500", hex: "#71717a" },
  { name: "zinc-600", hex: "#52525b" }, { name: "zinc-700", hex: "#3f3f46" },
  { name: "zinc-800", hex: "#27272a" }, { name: "zinc-900", hex: "#18181b" },

  { name: "red-100", hex: "#fee2e2" }, { name: "red-300", hex: "#fca5a5" },
  { name: "red-500", hex: "#ef4444" }, { name: "red-700", hex: "#b91c1c" },
  { name: "orange-100", hex: "#ffedd5" }, { name: "orange-300", hex: "#fdba74" },
  { name: "orange-500", hex: "#f97316" }, { name: "orange-700", hex: "#c2410c" },
  { name: "amber-100", hex: "#fef3c7" }, { name: "amber-300", hex: "#fcd34d" },
  { name: "amber-500", hex: "#f59e0b" }, { name: "amber-700", hex: "#b45309" },
  { name: "yellow-100", hex: "#fef9c3" }, { name: "yellow-300", hex: "#fde047" },
  { name: "yellow-500", hex: "#eab308" }, { name: "yellow-700", hex: "#a16207" },
  { name: "lime-100", hex: "#ecfccb" }, { name: "lime-300", hex: "#bef264" },
  { name: "lime-500", hex: "#84cc16" }, { name: "lime-700", hex: "#4d7c0f" },
  { name: "green-100", hex: "#dcfce7" }, { name: "green-300", hex: "#86efac" },
  { name: "green-500", hex: "#22c55e" }, { name: "green-700", hex: "#15803d" },
  { name: "emerald-100", hex: "#d1fae5" }, { name: "emerald-300", hex: "#6ee7b7" },
  { name: "emerald-500", hex: "#10b981" }, { name: "emerald-700", hex: "#047857" },
  { name: "teal-100", hex: "#ccfbf1" }, { name: "teal-300", hex: "#5eead4" },
  { name: "teal-500", hex: "#14b8a6" }, { name: "teal-700", hex: "#0f766e" },
  { name: "cyan-100", hex: "#cffafe" }, { name: "cyan-300", hex: "#67e8f9" },
  { name: "cyan-500", hex: "#06b6d4" }, { name: "cyan-700", hex: "#0e7490" },
  { name: "sky-100", hex: "#e0f2fe" }, { name: "sky-300", hex: "#7dd3fc" },
  { name: "sky-500", hex: "#0ea5e9" }, { name: "sky-700", hex: "#0369a1" },
  { name: "blue-100", hex: "#dbeafe" }, { name: "blue-300", hex: "#93c5fd" },
  { name: "blue-500", hex: "#3b82f6" }, { name: "blue-700", hex: "#1d4ed8" },
  { name: "indigo-100", hex: "#e0e7ff" }, { name: "indigo-300", hex: "#a5b4fc" },
  { name: "indigo-500", hex: "#6366f1" }, { name: "indigo-700", hex: "#4338ca" },
  { name: "violet-100", hex: "#ede9fe" }, { name: "violet-300", hex: "#c4b5fd" },
  { name: "violet-500", hex: "#8b5cf6" }, { name: "violet-700", hex: "#6d28d9" },
  { name: "purple-100", hex: "#f3e8ff" }, { name: "purple-300", hex: "#d8b4fe" },
  { name: "purple-500", hex: "#a855f7" }, { name: "purple-700", hex: "#7e22ce" },
  { name: "fuchsia-100", hex: "#fae8ff" }, { name: "fuchsia-300", hex: "#f0abfc" },
  { name: "fuchsia-500", hex: "#d946ef" }, { name: "fuchsia-700", hex: "#a21caf" },
  { name: "pink-100", hex: "#fce7f3" }, { name: "pink-300", hex: "#f9a8d4" },
  { name: "pink-500", hex: "#ec4899" }, { name: "pink-700", hex: "#be185d" },
  { name: "rose-100", hex: "#ffe4e6" }, { name: "rose-300", hex: "#fda4af" },
  { name: "rose-500", hex: "#f43f5e" }, { name: "rose-700", hex: "#be123c" }
];

function normalizeHex(value) {
  let hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split("").map(ch => ch + ch).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return "#" + hex.toLowerCase();
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16)
  };
}

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
}

function getMatches(hex) {
  const target = hexToRgb(hex);
  if (!target) return [];
  return TAILWIND_COLORS
    .map(item => ({
      ...item,
      dist: distance(target, hexToRgb(item.hex))
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);
}

function copyText(value) {
  navigator.clipboard.writeText(value).catch(() => {});
}

const hexInput = document.getElementById("hexInput");
const colorInput = document.getElementById("colorInput");
const swatch = document.getElementById("swatch");
const matches = document.getElementById("matches");
const utilities = document.getElementById("utilities");
const copyUtilities = document.getElementById("copyUtilities");
const sampleBtn = document.getElementById("sampleHex");

function render() {
  const normalized = normalizeHex(hexInput.value || colorInput.value);
  if (!normalized) {
    swatch.style.background = "transparent";
    matches.innerHTML = '<p class="small">Enter a valid 3-digit or 6-digit HEX value.</p>';
    utilities.textContent = "";
    return;
  }

  colorInput.value = normalized;
  hexInput.value = normalized;
  swatch.style.background = normalized;

  const best = getMatches(normalized);

  matches.innerHTML = best.map(item => `
    <div class="match-item">
      <div class="match-meta">
        <span class="tiny-swatch" style="background:${item.hex}"></span>
        <div>
          <div><strong>${item.name}</strong></div>
          <div class="small">${item.hex}</div>
        </div>
      </div>
      <div class="small">distance ${item.dist.toFixed(1)}</div>
    </div>
  `).join("");

  const primary = best[0]?.name || "pink-500";
  utilities.textContent = `bg-${primary} text-${primary} border-${primary} ring-${primary}`;
}

hexInput.addEventListener("input", render);
colorInput.addEventListener("input", () => {
  hexInput.value = colorInput.value;
  render();
});
sampleBtn.addEventListener("click", () => {
  hexInput.value = "#ff009c";
  render();
});
copyUtilities.addEventListener("click", () => copyText(utilities.textContent));

render();
