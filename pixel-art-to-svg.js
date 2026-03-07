const fileInput = document.getElementById("pixelFile");
const previewCanvas = document.getElementById("previewCanvas");
const svgPreview = document.getElementById("svgPreview");
const svgOutput = document.getElementById("svgOutput");
const copySvg = document.getElementById("copySvg");
const downloadSvg = document.getElementById("downloadSvg");
const scaleInput = document.getElementById("scaleInput");
const transparentBg = document.getElementById("transparentBg");
const statusEl = document.getElementById("pixelStatus");
const statsEl = document.getElementById("pixelStats");

const ctx = previewCanvas.getContext("2d");
let currentSvg = "";

function rgbaToHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function buildSvg(imageData, width, height, scale, keepTransparency) {
  const rects = [];
  const colors = new Set();

  for (let y = 0; y < height; y++) {
    let runColor = null;
    let runStart = 0;
    let runLength = 0;

    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const a = imageData[index + 3];

      let color = null;
      if (a === 0 && keepTransparency) {
        color = null;
      } else if (a === 0 && !keepTransparency) {
        color = "#ffffff";
      } else {
        color = rgbaToHex(r, g, b);
      }

      if (color === runColor) {
        runLength += 1;
      } else {
        if (runColor !== null) {
          rects.push(`<rect x="${runStart * scale}" y="${y * scale}" width="${runLength * scale}" height="${scale}" fill="${runColor}" />`);
          colors.add(runColor);
        }
        runColor = color;
        runStart = x;
        runLength = 1;
      }
    }

    if (runColor !== null) {
      rects.push(`<rect x="${runStart * scale}" y="${y * scale}" width="${runLength * scale}" height="${scale}" fill="${runColor}" />`);
      colors.add(runColor);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width * scale} ${height * scale}" width="${width * scale}" height="${height * scale}" shape-rendering="crispEdges">
${rects.join("\n")}
</svg>`;

  return { svg, rectCount: rects.length, colorCount: colors.size };
}

function renderFile(file) {
  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    previewCanvas.width = img.width;
    previewCanvas.height = img.height;
    ctx.clearRect(0, 0, img.width, img.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);

    const { data } = ctx.getImageData(0, 0, img.width, img.height);
    const scale = Math.max(1, parseInt(scaleInput.value || "16", 10));
    const result = buildSvg(data, img.width, img.height, scale, transparentBg.checked);

    currentSvg = result.svg;
    svgOutput.textContent = currentSvg
    svgPreview.innerHTML = currentSvg;
    statusEl.textContent = `${file.name} loaded successfully.`;
    statsEl.innerHTML = `
      <div class="panelish"><strong>${img.width}×${img.height}</strong><div class="small">pixel dimensions</div></div>
      <div class="panelish"><strong>${result.rectCount}</strong><div class="small">SVG rects</div></div>
      <div class="panelish"><strong>${result.colorCount}</strong><div class="small">unique colors</div></div>
      <div class="panelish"><strong>${scale}x</strong><div class="small">export scale</div></div>
    `;

    URL.revokeObjectURL(url);
  };

  img.onerror = () => {
    statusEl.textContent = "Could not read that image file.";
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) renderFile(file);
});

[scaleInput, transparentBg].forEach(el => {
  el.addEventListener("input", () => {
    const file = fileInput.files?.[0];
    if (file) renderFile(file);
  });
  el.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) renderFile(file);
  });
});

copySvg.addEventListener("click", () => {
  navigator.clipboard.writeText(currentSvg).catch(() => {});
});

downloadSvg.addEventListener("click", () => {
  if (!currentSvg) return;
  const blob = new Blob([currentSvg], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pixel-art.svg";
  a.click();
  URL.revokeObjectURL(a.href);
});
