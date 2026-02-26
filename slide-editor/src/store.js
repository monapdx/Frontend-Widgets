import { create } from "zustand";

const uid = () => Math.random().toString(36).slice(2, 10);

// Editor pixels (what you see)
export const EDITOR_W = 1333;
export const EDITOR_H = 750;

// PPTX inches (widescreen)
export const PPTX_W = 13.333;
export const PPTX_H = 7.5;

// Conversion (px -> inches)
export const PX_PER_INCH = EDITOR_W / PPTX_W; // ~100

const makeSlide = () => ({
  id: "s_" + uid(),
  bg: { color: "#FFFFFF", image: null }, // <- supports bg image now
  elements: [],
});

function deepClone(obj) {
  return structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function getImageNaturalSize(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = dataURL;
  });
}

// --- element factories ---
function rect({ x, y, w, h, fill = "#DDD", radius = 0, stroke = null, strokeWidth = 1, appearStep = 0 }) {
  return {
    id: "r_" + uid(),
    type: "rect",
    x,
    y,
    w,
    h,
    rotation: 0,
    appearStep,
    style: {
      fill,
      radius,
      stroke,
      strokeWidth,
    },
  };
}

function text({ x, y, w, h, text, size = 18, color = "#111", bold = false, fontFamily = "Calibri", appearStep = 0 }) {
  return {
    id: "t_" + uid(),
    type: "text",
    x,
    y,
    w,
    h,
    rotation: 0,
    appearStep,
    text,
    style: { fontFamily, fontSize: size, color, bold },
  };
}

function imageEl({ x, y, w, h, src, appearStep = 0 }) {
  return {
    id: "i_" + uid(),
    type: "image",
    x,
    y,
    w,
    h,
    rotation: 0,
    appearStep,
    src,
  };
}

// Circle = rect with huge corner radius
function pill({ x, y, d, fill, appearStep = 0 }) {
  return rect({ x, y, w: d, h: d, fill, radius: 999, appearStep });
}

// ----------------------
// Templates (ALL of them)
// ----------------------

function templateBlank() {
  return makeSlide();
}

function templateTitleSlide() {
  const s = makeSlide();
  s.elements.push(
    rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#FFFFFF" }),
    text({ x: 120, y: 230, w: 1100, h: 120, text: "Title", size: 64, bold: true }),
    text({ x: 120, y: 340, w: 1100, h: 60, text: "Subtitle", size: 28, color: "#444" })
  );
  return s;
}

function templateTwoCol() {
  const s = makeSlide();
  s.elements.push(
    text({ x: 80, y: 60, w: 1170, h: 60, text: "Section Title", size: 36, bold: true }),
    rect({ x: 80, y: 140, w: 560, h: 520, fill: "#EFEFEF", radius: 18 }),
    rect({ x: 690, y: 140, w: 560, h: 520, fill: "#EFEFEF", radius: 18 }),
    text({ x: 110, y: 170, w: 500, h: 40, text: "Left", size: 22, bold: true, color: "#333" }),
    text({ x: 720, y: 170, w: 500, h: 40, text: "Right", size: 22, bold: true, color: "#333" })
  );
  return s;
}

// --- Your original templates (restored) ---
function templateDesktopAppFrame(accent) {
  const els = [];

  els.push(
    rect({
      x: 40,
      y: 40,
      w: EDITOR_W - 80,
      h: EDITOR_H - 80,
      fill: "#FFFFFF",
      radius: 18,
      stroke: "#D9D9E3",
      strokeWidth: 1,
    })
  );

  // Browser chrome
  els.push(rect({ x: 60, y: 60, w: EDITOR_W - 120, h: 54, fill: "#F2F2F7", radius: 14, stroke: "#D9D9E3", strokeWidth: 1 }));
  els.push(pill({ x: 80, y: 78, d: 12, fill: "#FF5F57" }));
  els.push(pill({ x: 98, y: 78, d: 12, fill: "#FEBC2E" }));
  els.push(pill({ x: 116, y: 78, d: 12, fill: "#28C840" }));
  els.push(rect({ x: 160, y: 72, w: 520, h: 30, fill: "#FFFFFF", radius: 10, stroke: "#D9D9E3", strokeWidth: 1 }));
  els.push(text({ x: 175, y: 78, w: 490, h: 20, text: "https://app.example.com", size: 14, color: "#666" }));

  // Left sidebar
  els.push(rect({ x: 60, y: 120, w: 240, h: EDITOR_H - 180, fill: "#FAFAFC", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: 80, y: 145, w: 200, h: 28, text: "App Name", size: 18, bold: true, color: "#111" }));

  const navY = 190;
  const navItems = ["Dashboard", "Projects", "Inbox", "Settings"];
  navItems.forEach((label, i) => {
    const y = navY + i * 44;
    if (i === 0) {
      els.push(rect({ x: 75, y, w: 210, h: 34, fill: accent, radius: 10 }));
      els.push(text({ x: 92, y: y + 7, w: 180, h: 20, text: label, size: 14, color: "#FFFFFF", bold: true }));
    } else {
      els.push(text({ x: 92, y: y + 7, w: 180, h: 20, text: label, size: 14, color: "#444" }));
    }
  });

  // Main header toolbar
  els.push(rect({ x: 320, y: 120, w: EDITOR_W - 380, h: 64, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: 340, y: 140, w: 500, h: 28, text: "Page Title", size: 22, bold: true, color: "#111" }));
  els.push(rect({ x: EDITOR_W - 260, y: 136, w: 160, h: 34, fill: accent, radius: 10 }));
  els.push(text({ x: EDITOR_W - 245, y: 144, w: 130, h: 20, text: "Primary action", size: 14, color: "#FFF", bold: true }));

  // Content cards
  const cardY = 200;
  const cardW = (EDITOR_W - 380 - 40) / 2;
  const cardH = 170;
  const leftX = 320;
  const rightX = 320 + cardW + 20;

  for (let r = 0; r < 2; r++) {
    const y = cardY + r * (cardH + 20);
    els.push(rect({ x: leftX, y, w: cardW, h: cardH, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
    els.push(rect({ x: rightX, y, w: cardW, h: cardH, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));

    els.push(text({ x: leftX + 16, y: y + 16, w: cardW - 32, h: 24, text: "Card title", size: 16, bold: true, color: "#111" }));
    els.push(rect({ x: leftX + 16, y: y + 52, w: cardW - 32, h: 10, fill: "#EFEFF6", radius: 6 }));
    els.push(rect({ x: leftX + 16, y: y + 70, w: cardW - 90, h: 10, fill: "#EFEFF6", radius: 6 }));

    els.push(text({ x: rightX + 16, y: y + 16, w: cardW - 32, h: 24, text: "Card title", size: 16, bold: true, color: "#111" }));
    els.push(rect({ x: rightX + 16, y: y + 52, w: cardW - 32, h: 10, fill: "#EFEFF6", radius: 6 }));
    els.push(rect({ x: rightX + 16, y: y + 70, w: cardW - 90, h: 10, fill: "#EFEFF6", radius: 6 }));
  }

  const s = makeSlide();
  s.bg.color = "#FFFFFF";
  s.elements = els;
  return s;
}

function templateMobileFrame(accent) {
  const els = [];

  els.push(rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#0B0B0F" }));

  const devW = 420;
  const devH = 700;
  const devX = Math.round((EDITOR_W - devW) / 2);
  const devY = Math.round((EDITOR_H - devH) / 2);
  els.push(rect({ x: devX, y: devY, w: devW, h: devH, fill: "#111217", radius: 48, stroke: "#2A2B35", strokeWidth: 2 }));

  const pad = 18;
  const screenX = devX + pad;
  const screenY = devY + pad;
  const screenW = devW - pad * 2;
  const screenH = devH - pad * 2;
  els.push(rect({ x: screenX, y: screenY, w: screenW, h: screenH, fill: "#FFFFFF", radius: 34 }));

  els.push(rect({ x: screenX + 18, y: screenY + 14, w: screenW - 36, h: 20, fill: "#FFFFFF" }));
  els.push(text({ x: screenX + 18, y: screenY + 14, w: 100, h: 20, text: "9:41", size: 14, bold: true, color: "#111" }));
  els.push(rect({ x: screenX + screenW - 84, y: screenY + 18, w: 60, h: 12, fill: "#EDEDF5", radius: 6 }));

  els.push(rect({ x: screenX, y: screenY + 40, w: screenW, h: 64, fill: "#FAFAFC" }));
  els.push(text({ x: screenX + 18, y: screenY + 58, w: screenW - 36, h: 24, text: "Mobile Screen", size: 18, bold: true, color: "#111" }));

  const cTop = screenY + 120;
  for (let i = 0; i < 3; i++) {
    const y = cTop + i * 118;
    els.push(rect({ x: screenX + 18, y, w: screenW - 36, h: 96, fill: "#FFFFFF", radius: 16, stroke: "#E3E3EE", strokeWidth: 1 }));
    els.push(rect({ x: screenX + 34, y: y + 18, w: 54, h: 54, fill: "#EFEFF6", radius: 14 }));
    els.push(text({ x: screenX + 100, y: y + 18, w: screenW - 150, h: 20, text: "List item title", size: 14, bold: true, color: "#111" }));
    els.push(rect({ x: screenX + 100, y: y + 44, w: screenW - 180, h: 10, fill: "#EFEFF6", radius: 6 }));
    els.push(rect({ x: screenX + 100, y: y + 62, w: screenW - 220, h: 10, fill: "#EFEFF6", radius: 6 }));
  }

  const tabH = 74;
  els.push(rect({ x: screenX, y: screenY + screenH - tabH, w: screenW, h: tabH, fill: "#FAFAFC" }));

  const tabs = ["Home", "Search", "Profile"];
  tabs.forEach((t, i) => {
    const x = screenX + 18 + i * ((screenW - 36) / 3);
    const isActive = i === 0;
    els.push(pill({ x: x + 18, y: screenY + screenH - tabH + 16, d: 10, fill: isActive ? accent : "#C9CAD6" }));
    els.push(
      text({
        x,
        y: screenY + screenH - tabH + 30,
        w: (screenW - 36) / 3,
        h: 20,
        text: t,
        size: 12,
        color: isActive ? accent : "#666",
        bold: isActive,
      })
    );
  });

  const s = makeSlide();
  s.bg.color = "#0B0B0F";
  s.elements = els;
  return s;
}

function templateDashboard(accent) {
  const els = [];
  els.push(rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#FFFFFF" }));

  els.push(rect({ x: 40, y: 40, w: 240, h: EDITOR_H - 80, fill: "#0F0F15", radius: 18 }));
  els.push(text({ x: 60, y: 70, w: 200, h: 28, text: "Dashboard", size: 18, bold: true, color: "#FFFFFF" }));

  ["Overview", "Reports", "Users", "Billing"].forEach((label, i) => {
    const y = 120 + i * 44;
    const active = i === 0;
    if (active) {
      els.push(rect({ x: 58, y, w: 204, h: 34, fill: accent, radius: 10 }));
      els.push(text({ x: 74, y: y + 7, w: 170, h: 20, text: label, size: 14, bold: true, color: "#FFFFFF" }));
    } else {
      els.push(text({ x: 74, y: y + 7, w: 170, h: 20, text: label, size: 14, color: "#CFCFE2" }));
    }
  });

  els.push(rect({ x: 300, y: 40, w: EDITOR_W - 340, h: 64, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: 320, y: 60, w: 400, h: 24, text: "Overview", size: 20, bold: true, color: "#111" }));
  els.push(rect({ x: EDITOR_W - 340, y: 58, w: 260, h: 30, fill: "#FAFAFC", radius: 10, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: EDITOR_W - 325, y: 64, w: 230, h: 20, text: "Search…", size: 14, color: "#888" }));

  const kpiY = 120;
  const kpiW = (EDITOR_W - 340 - 40) / 3;
  for (let i = 0; i < 3; i++) {
    const x = 300 + i * (kpiW + 20);
    els.push(rect({ x, y: kpiY, w: kpiW, h: 110, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
    els.push(text({ x: x + 16, y: kpiY + 16, w: kpiW - 32, h: 18, text: "Metric", size: 12, color: "#666", bold: true }));
    els.push(text({ x: x + 16, y: kpiY + 40, w: kpiW - 32, h: 40, text: "123", size: 34, color: "#111", bold: true }));
    els.push(rect({ x: x + 16, y: kpiY + 86, w: 70, h: 10, fill: accent, radius: 6 }));
  }

  const chartY = 250;
  const leftW = Math.round((EDITOR_W - 340) * 0.62);
  const rightW = EDITOR_W - 340 - leftW - 20;

  els.push(rect({ x: 300, y: chartY, w: leftW, h: 300, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: 316, y: chartY + 16, w: leftW - 32, h: 20, text: "Chart", size: 14, bold: true, color: "#111" }));
  for (let i = 0; i < 8; i++) {
    els.push(rect({ x: 330 + i * 44, y: chartY + 70 + (i % 3) * 24, w: 22, h: 170 - (i % 3) * 24, fill: "#EFEFF6", radius: 6 }));
  }
  els.push(rect({ x: 330, y: chartY + 260, w: leftW - 60, h: 10, fill: accent, radius: 6 }));

  const rx = 300 + leftW + 20;
  els.push(rect({ x: rx, y: chartY, w: rightW, h: 300, fill: "#FFFFFF", radius: 14, stroke: "#E3E3EE", strokeWidth: 1 }));
  els.push(text({ x: rx + 16, y: chartY + 16, w: rightW - 32, h: 20, text: "Activity", size: 14, bold: true, color: "#111" }));
  for (let i = 0; i < 6; i++) {
    const y = chartY + 56 + i * 38;
    els.push(rect({ x: rx + 16, y, w: 10, h: 10, fill: i === 0 ? accent : "#C9CAD6", radius: 6 }));
    els.push(rect({ x: rx + 34, y, w: rightW - 60, h: 10, fill: "#EFEFF6", radius: 6 }));
  }

  const s = makeSlide();
  s.bg.color = "#FFFFFF";
  s.elements = els;
  return s;
}

// --- New templates (kept) ---
function templateModal(accent) {
  const s = makeSlide();
  s.bg.color = "#0b0b12";

  s.elements.push(
    rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#0b0b12" }),
    rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "rgba(0,0,0,0.55)" }),
    rect({ x: 320, y: 170, w: 700, h: 420, fill: "#ffffff", radius: 18, stroke: "#E6E6E6", strokeWidth: 2 }),
    text({ x: 360, y: 210, w: 620, h: 50, text: "Modal Title", size: 32, bold: true }),
    text({
      x: 360,
      y: 270,
      w: 620,
      h: 140,
      text: "Modal body text goes here.\nYou can add more content and buttons.",
      size: 20,
      color: "#333",
    }),
    rect({ x: 360, y: 460, w: 160, h: 56, fill: accent, radius: 14 }),
    text({ x: 360, y: 470, w: 160, h: 40, text: "Confirm", size: 20, bold: true, color: "#fff" }),
    rect({ x: 540, y: 460, w: 140, h: 56, fill: "#EFEFF5", radius: 14 }),
    text({ x: 540, y: 470, w: 140, h: 40, text: "Cancel", size: 20, bold: true, color: "#222" })
  );

  return s;
}

function templateKanban(accent) {
  const s = makeSlide();
  s.bg.color = "#0b0b12";

  s.elements.push(
    rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#0b0b12" }),
    text({ x: 70, y: 40, w: 1200, h: 50, text: "Kanban Board", size: 40, bold: true, color: "#fff" })
  );

  const colW = 380;
  const gap = 36;
  const x0 = 70;
  const y0 = 120;

  const cols = ["To Do", "Doing", "Done"];
  cols.forEach((title, i) => {
    const x = x0 + i * (colW + gap);
    s.elements.push(
      rect({ x, y: y0, w: colW, h: 560, fill: "#151524", radius: 18, stroke: "#2b2b44", strokeWidth: 2 }),
      text({ x: x + 18, y: y0 + 16, w: colW - 36, h: 36, text: title, size: 22, bold: true, color: "#fff" }),
      rect({ x: x + 18, y: y0 + 70, w: colW - 36, h: 110, fill: "#ffffff", radius: 14 }),
      text({ x: x + 32, y: y0 + 88, w: colW - 64, h: 80, text: "Card 1", size: 20, bold: true, color: "#111" }),
      rect({ x: x + 18, y: y0 + 200, w: colW - 36, h: 110, fill: "#ffffff", radius: 14 }),
      text({ x: x + 32, y: y0 + 218, w: colW - 64, h: 80, text: "Card 2", size: 20, bold: true, color: "#111" })
    );
  });

  // tiny accent detail
  s.elements.push(rect({ x: 70, y: 92, w: 180, h: 6, fill: accent, radius: 6 }));
  return s;
}

function templateFlowDiagram(accent) {
  const s = makeSlide();
  s.bg.color = "#FFFFFF";

  s.elements.push(rect({ x: 0, y: 0, w: EDITOR_W, h: EDITOR_H, fill: "#FFFFFF" }));

  const box = (x, y, label) => {
    s.elements.push(
      rect({ x, y, w: 280, h: 90, fill: "#EFEFF5", radius: 18, stroke: "#D6D6E6", strokeWidth: 2 }),
      text({ x: x + 20, y: y + 22, w: 240, h: 50, text: label, size: 24, bold: true, color: "#111" })
    );
  };

  const arrow = (x, y, w, h) => {
    s.elements.push(rect({ x, y, w, h, fill: "#111", radius: 6 }));
  };

  box(120, 140, "Start");
  box(520, 140, "Process");
  box(920, 140, "Decision");

  arrow(410, 182, 90, 10);
  arrow(810, 182, 90, 10);

  box(520, 340, "Outcome A");
  box(920, 340, "Outcome B");

  arrow(1060, 230, 10, 90);
  arrow(760, 230, 10, 90);

  // accent underline
  s.elements.push(rect({ x: 120, y: 110, w: 220, h: 6, fill: accent, radius: 6 }));

  return s;
}

// -------- initial slide (ensures activeSlideId isn't null) --------
const _firstSlide = makeSlide();

export const useDeck = create((set, get) => ({
  deck: {
    meta: { title: "Untitled", layout: "wide" },
    theme: { accent: "#FF009C" },
    slides: [_firstSlide],
  },
  activeSlideId: _firstSlide.id,
  selectedElId: null,

  history: { past: [], future: [], limit: 80 },

  _snapshot() {
    const st = get();
    return {
      deck: deepClone(st.deck),
      activeSlideId: st.activeSlideId,
      selectedElId: st.selectedElId,
    };
  },

  _commit(mutatorFn) {
    const st = get();
    const snap = st._snapshot();

    set((prev) => {
      const past = [...prev.history.past, snap];
      const limitedPast = past.length > prev.history.limit ? past.slice(past.length - prev.history.limit) : past;
      return { history: { ...prev.history, past: limitedPast, future: [] } };
    });

    mutatorFn();
  },

  canUndo() {
    return get().history.past.length > 0;
  },
  canRedo() {
    return get().history.future.length > 0;
  },

  undo() {
    const st = get();
    if (st.history.past.length === 0) return;

    const previous = st.history.past[st.history.past.length - 1];
    const currentSnap = st._snapshot();

    set((prev) => ({
      deck: previous.deck,
      activeSlideId: previous.activeSlideId,
      selectedElId: previous.selectedElId,
      history: {
        ...prev.history,
        past: prev.history.past.slice(0, -1),
        future: [currentSnap, ...prev.history.future],
      },
    }));
  },

  redo() {
    const st = get();
    if (st.history.future.length === 0) return;

    const next = st.history.future[0];
    const currentSnap = st._snapshot();

    set((prev) => ({
      deck: next.deck,
      activeSlideId: next.activeSlideId,
      selectedElId: next.selectedElId,
      history: {
        ...prev.history,
        past: [...prev.history.past, currentSnap],
        future: prev.history.future.slice(1),
      },
    }));
  },

  setActiveSlide(id) {
    set({ activeSlideId: id, selectedElId: null });
  },

  setSelectedEl(id) {
    set({ selectedElId: id });
  },

  addSlide() {
    const st = get();
    st._commit(() => {
      const s = makeSlide();
      set((prev) => ({
        deck: { ...prev.deck, slides: [...prev.deck.slides, s] },
        activeSlideId: s.id,
        selectedElId: null,
      }));
    });
  },

  deleteSlide(id) {
    const st = get();
    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.filter((s) => s.id !== id);
        const active = prev.activeSlideId === id ? slides[0]?.id ?? null : prev.activeSlideId;
        return { deck: { ...prev.deck, slides }, activeSlideId: active, selectedElId: null };
      });
    });
  },

  insertTemplate(templateId) {
    const st = get();
    const accent = st.deck.theme?.accent || "#FF009C";

    st._commit(() => {
      let newSlide = null;

      switch (templateId) {
        case "blank":
          newSlide = templateBlank();
          break;
        case "title":
          newSlide = templateTitleSlide();
          break;
        case "twoCol":
          newSlide = templateTwoCol();
          break;

        // restored originals
        case "desktop-app":
          newSlide = templateDesktopAppFrame(accent);
          break;
        case "mobile-frame":
          newSlide = templateMobileFrame(accent);
          break;
        case "dashboard":
          newSlide = templateDashboard(accent);
          break;

        // new ones
        case "modal":
          newSlide = templateModal(accent);
          break;
        case "kanban":
          newSlide = templateKanban(accent);
          break;
        case "flow":
          newSlide = templateFlowDiagram(accent);
          break;

        default:
          newSlide = templateBlank();
      }

      set((prev) => ({
        deck: { ...prev.deck, slides: [...prev.deck.slides, newSlide] },
        activeSlideId: newSlide.id,
        selectedElId: null,
      }));
    });
  },

  addRect() {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, elements: [...s.elements, rect({ x: 120, y: 120, w: 240, h: 140, fill: "#EFEFEF", radius: 18 })] };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  addText() {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, elements: [...s.elements, text({ x: 140, y: 140, w: 520, h: 80, text: "Text" })] };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  async addImageFromFile(file) {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    const dataURL = await readFileAsDataURL(file);
    const { w: iw, h: ih } = await getImageNaturalSize(dataURL);

    const maxW = 520;
    const scale = Math.min(1, maxW / iw);
    const w = Math.max(20, Math.round(iw * scale));
    const h = Math.max(20, Math.round(ih * scale));

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, elements: [...s.elements, imageEl({ x: 140, y: 160, w, h, src: dataURL })] };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  updateElement(elId, patch) {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          const elements = s.elements.map((el) => (el.id === elId ? { ...el, ...patch } : el));
          return { ...s, elements };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  deleteSelected() {
    const st = get();
    const activeId = st.activeSlideId;
    const sel = st.selectedElId;
    if (!activeId || !sel) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, elements: s.elements.filter((e) => e.id !== sel) };
        });
        return { deck: { ...prev.deck, slides }, selectedElId: null };
      });
    });
  },

  // ---- Slide Background ----
  setSlideBgColor(color) {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => (s.id === activeId ? { ...s, bg: { ...(s.bg || {}), color } } : s));
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  async setSlideBgImageFromFile(file) {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    const dataURL = await readFileAsDataURL(file);
    const { w, h } = await getImageNaturalSize(dataURL);

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          return { ...s, bg: { ...(s.bg || {}), image: { src: dataURL, w, h, fit: "cover" } } };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  setSlideBgImageFit(fit) {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => {
          if (s.id !== activeId) return s;
          const img = s.bg?.image;
          if (!img) return s;
          return { ...s, bg: { ...(s.bg || {}), image: { ...img, fit: fit || "cover" } } };
        });
        return { deck: { ...prev.deck, slides } };
      });
    });
  },

  clearSlideBgImage() {
    const st = get();
    const activeId = st.activeSlideId;
    if (!activeId) return;

    st._commit(() => {
      set((prev) => {
        const slides = prev.deck.slides.map((s) => (s.id === activeId ? { ...s, bg: { ...(s.bg || {}), image: null } } : s));
        return { deck: { ...prev.deck, slides } };
      });
    });
  },
}));