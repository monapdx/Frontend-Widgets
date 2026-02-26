import pptxgen from "pptxgenjs";
import { saveAs } from "file-saver";
import { PX_PER_INCH, PPTX_W, PPTX_H } from "./store.js";

const pxToIn = (v) => v / PX_PER_INCH;

function addElementToSlide(pptx, slide, el) {
  if (el.type === "rect") {
    const fill = (el.style?.fill || "#CCCCCC").replace("#", "");
    const stroke = el.style?.stroke ? el.style.stroke.replace("#", "") : null;
    const strokeWidth = el.style?.stroke ? (el.style?.strokeWidth ?? 1) : 0;
    const radius = el.style?.radius ?? 0;

    const shapeType = radius > 0 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;

    slide.addShape(shapeType, {
      x: pxToIn(el.x),
      y: pxToIn(el.y),
      w: pxToIn(el.w),
      h: pxToIn(el.h),
      rotate: el.rotation || 0,
      fill: { color: fill },
      line: stroke ? { color: stroke, width: strokeWidth } : { color: fill, width: 0 },
    });
  }

  if (el.type === "text") {
    slide.addText(el.text || "", {
      x: pxToIn(el.x),
      y: pxToIn(el.y),
      w: pxToIn(el.w),
      h: pxToIn(el.h),
      rotate: el.rotation || 0,
      fontFace: el.style?.fontFamily || "Calibri",
      fontSize: el.style?.fontSize || 18,
      bold: !!el.style?.bold,
      color: (el.style?.color || "#111111").replace("#", ""),
    });
  }

  if (el.type === "image") {
    slide.addImage({
      data: el.src,
      x: pxToIn(el.x),
      y: pxToIn(el.y),
      w: pxToIn(el.w),
      h: pxToIn(el.h),
      rotate: el.rotation || 0,
    });
  }
}

export async function exportDeckToPptx(deck) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "slide-editor";

  for (const s of deck.slides) {
    const bg = (s.bg?.color || "#FFFFFF").replace("#", "");
    const bgImg = s.bg?.image || null;

    const maxStep = Math.max(0, ...s.elements.map((e) => e.appearStep ?? 0));

    for (let step = 0; step <= maxStep; step++) {
      const slide = pptx.addSlide();
      slide.background = { color: bg };

      // Background image (optional)
      if (bgImg?.src) {
        const fit = bgImg.fit || "cover";
        const aspect = (bgImg.w && bgImg.h) ? (bgImg.w / bgImg.h) : (16 / 9);
        const slideAspect = PPTX_W / PPTX_H;

        let w, h;
        if (fit === "contain") {
          if (aspect >= slideAspect) {
            w = PPTX_W;
            h = PPTX_W / aspect;
          } else {
            h = PPTX_H;
            w = PPTX_H * aspect;
          }
        } else {
          // cover
          if (aspect >= slideAspect) {
            h = PPTX_H;
            w = PPTX_H * aspect;
          } else {
            w = PPTX_W;
            h = PPTX_W / aspect;
          }
        }

        const x = (PPTX_W - w) / 2;
        const y = (PPTX_H - h) / 2;

        slide.addImage({ data: bgImg.src, x, y, w, h });
      }

      const visible = s.elements.filter((e) => (e.appearStep ?? 0) <= step);

      for (const el of visible) addElementToSlide(pptx, slide, el);
    }
  }

  const blob = await pptx.write("blob");
  saveAs(blob, `${deck.meta?.title || "deck"}.pptx`);
}