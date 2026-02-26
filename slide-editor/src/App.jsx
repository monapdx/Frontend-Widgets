import React, { useEffect, useMemo, useState } from "react";
import CanvasEditor from "./CanvasEditor.jsx";
import { useDeck } from "./store.js";
import { exportDeckToPptx } from "./exportPptx.js";

function normalizeHex(v) {
  if (!v) return "#000000";
  const s = String(v).trim();
  if (!s) return "#000000";
  return s.startsWith("#") ? s : "#" + s;
}

function mergeStyle(updateElement, el) {
  return (patch) => {
    updateElement(el.id, { style: { ...(el.style || {}), ...patch } });
  };
}

export default function App() {
  const {
    deck,
    activeSlideId,
    setActiveSlide,
    addSlide,
    deleteSlide,
    insertTemplate,
    addText,
    addRect,
    addImageFromFile,
    selectedElId,
    setSelectedEl,
    updateElement,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    setSlideBgColor,
    setSlideBgImageFromFile,
    setSlideBgImageFit,
    clearSlideBgImage,
  } = useDeck();

  const [templateChoice, setTemplateChoice] = useState("");

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      const tag = (e.target?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      if (typing) return;

      if (mod && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((mod && key === "y") || (mod && key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
        return;
      }
      if (key === "delete" || key === "backspace") {
        if (selectedElId) {
          e.preventDefault();
          deleteSelected();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, deleteSelected, selectedElId]);

  const slide = useMemo(
    () => deck.slides.find((s) => s.id === activeSlideId) || null,
    [deck.slides, activeSlideId]
  );
  const el = useMemo(() => {
    if (!slide || !selectedElId) return null;
    return slide.elements.find((e) => e.id === selectedElId) || null;
  }, [slide, selectedElId]);

  const slideBgColor = slide?.bg?.color || "#FFFFFF";
  const slideBgImg = slide?.bg?.image || null;

  const updateStyle = el ? mergeStyle(updateElement, el) : () => {};

  const rectFill = el?.type === "rect" ? (el.style?.fill || "#EFEFEF") : "#EFEFEF";
  const rectRadius = el?.type === "rect" ? (el.style?.radius ?? 0) : 0;

  const textColor = el?.type === "text" ? (el.style?.color || "#111111") : "#111111";
  const textSize = el?.type === "text" ? (el.style?.fontSize || 18) : 18;
  const textBold = el?.type === "text" ? !!el.style?.bold : false;
  const textFont = el?.type === "text" ? (el.style?.fontFamily || "Calibri") : "Calibri";

  return (
    <div className="app">
      {/* Left panel: slides */}
      <div className="panel">
        <div className="header">
          <div>
            <div style={{ fontWeight: 800 }}>Slides</div>
            <div className="small">{deck.slides.length} total</div>
          </div>
          <button className="btn accent" onClick={addSlide}>
            + Slide
          </button>
        </div>

        <div style={{ padding: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={addText}>
            Text
          </button>
          <button className="btn" onClick={addRect}>
            Rect
          </button>

          <label className="btn">
            Add Image
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) addImageFromFile(f);
                e.target.value = "";
              }}
            />
          </label>

          {/* Insert Template */}
          <select
            value={templateChoice}
            onChange={(e) => {
              const v = e.target.value;
              setTemplateChoice(v);
              if (v) insertTemplate(v);
              setTimeout(() => setTemplateChoice(""), 0);
            }}
            style={{ minWidth: 210 }}
          >
            <option value="">Insert template…</option>
            <option value="blank">Blank</option>
            <option value="title">Title slide</option>
            <option value="twoCol">Two columns</option>
			<option value="desktop-app">Desktop app frame</option>
			<option value="mobile-frame">Mobile app</option>
			<option value="dashboard">Dashboard</option>
            <option value="modal">Modal</option>
            <option value="kanban">Kanban board</option>
            <option value="flow">Flow diagram</option>
          </select>

          <button className="btn" onClick={undo} disabled={!canUndo()}>
            Undo
          </button>
          <button className="btn" onClick={redo} disabled={!canRedo()}>
            Redo
          </button>

          <button className="btn" onClick={deleteSelected} disabled={!selectedElId}>
            Delete selection
          </button>

          <button className="btn accent" onClick={() => exportDeckToPptx(deck)}>
            Export PPTX
          </button>
        </div>

        {deck.slides.map((s, idx) => (
          <div
            key={s.id}
            className={"thumb" + (s.id === activeSlideId ? " selected" : "")}
            onClick={() => setActiveSlide(s.id)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontWeight: 700 }}>Slide {idx + 1}</div>
              <button
                className="btn"
                style={{ padding: "4px 8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSlide(s.id);
                }}
                title="Delete slide"
              >
                ✕
              </button>
            </div>
            <div className="small">{s.elements.length} elements</div>
          </div>
        ))}
      </div>

      {/* Center: canvas */}
      <CanvasEditor />

      {/* Right: properties */}
      <div className="panel right">
        <div className="header">
          <div>
            <div style={{ fontWeight: 800 }}>Properties</div>
            <div className="small">{el ? el.type : "No selection"}</div>
          </div>
          <button className="btn" onClick={() => setSelectedEl(null)}>
            Deselect
          </button>
        </div>

        <div className="props">
          <div className="small">
            Shortcuts: Ctrl/Cmd+Z undo • Ctrl/Cmd+Shift+Z (or Ctrl/Cmd+Y) redo • Delete/Backspace deletes selection
          </div>

          <hr />

          <div className="small" style={{ fontWeight: 700 }}>
            Slide background
          </div>

          <div className="row">
            <div className="small">color</div>
            <input type="color" value={normalizeHex(slideBgColor)} onChange={(e) => setSlideBgColor(e.target.value)} />
          </div>

          <div className="row">
            <div className="small">image</div>
            <label className="btn" style={{ width: "100%", textAlign: "center" }}>
              {slideBgImg ? "Replace background" : "Add background"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSlideBgImageFromFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {slideBgImg && (
            <>
              <div className="row">
                <div className="small">fit</div>
                <select value={slideBgImg.fit || "cover"} onChange={(e) => setSlideBgImageFit(e.target.value)}>
                  <option value="cover">Cover (crop)</option>
                  <option value="contain">Contain</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" style={{ flex: 1 }} onClick={clearSlideBgImage}>
                  Remove background
                </button>
              </div>
            </>
          )}

          <hr />

          {!el && <div className="small">Select an element to edit.</div>}

          {el && (
            <>
              <div className="row">
                <div className="small">x</div>
                <input
                  type="number"
                  value={Math.round(el.x)}
                  onChange={(e) => updateElement(el.id, { x: Number(e.target.value) })}
                />
              </div>
              <div className="row">
                <div className="small">y</div>
                <input
                  type="number"
                  value={Math.round(el.y)}
                  onChange={(e) => updateElement(el.id, { y: Number(e.target.value) })}
                />
              </div>
              <div className="row">
                <div className="small">w</div>
                <input
                  type="number"
                  value={Math.round(el.w)}
                  onChange={(e) => updateElement(el.id, { w: Number(e.target.value) })}
                />
              </div>
              <div className="row">
                <div className="small">h</div>
                <input
                  type="number"
                  value={Math.round(el.h)}
                  onChange={(e) => updateElement(el.id, { h: Number(e.target.value) })}
                />
              </div>
              <div className="row">
                <div className="small">rot</div>
                <input
                  type="number"
                  value={Math.round(el.rotation || 0)}
                  onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) })}
                />
              </div>

              <div className="row">
                <div className="small">appearStep</div>
                <input
                  type="number"
                  min="0"
                  value={el.appearStep ?? 0}
                  onChange={(e) => updateElement(el.id, { appearStep: Number(e.target.value) })}
                />
              </div>

              {el.type === "rect" && (
                <>
                  <hr />
                  <div className="small" style={{ fontWeight: 700 }}>
                    Rectangle
                  </div>

                  <div className="row">
                    <div className="small">fill</div>
                    <input type="color" value={normalizeHex(rectFill)} onChange={(e) => updateStyle({ fill: e.target.value })} />
                  </div>

                  <div className="row">
                    <div className="small">radius</div>
                    <input
                      type="number"
                      min="0"
                      value={rectRadius}
                      onChange={(e) => updateStyle({ radius: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {el.type === "text" && (
                <>
                  <hr />
                  <div className="small" style={{ fontWeight: 700 }}>
                    Text
                  </div>

                  <div className="row">
                    <div className="small">font</div>
                    <input value={textFont} onChange={(e) => updateStyle({ fontFamily: e.target.value })} />
                  </div>

                  <div className="row">
                    <div className="small">size</div>
                    <input
                      type="number"
                      min="6"
                      value={textSize}
                      onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                    />
                  </div>

                  <div className="row">
                    <div className="small">color</div>
                    <input type="color" value={normalizeHex(textColor)} onChange={(e) => updateStyle({ color: e.target.value })} />
                  </div>

                  <div className="row">
                    <div className="small">bold</div>
                    <input type="checkbox" checked={textBold} onChange={(e) => updateStyle({ bold: e.target.checked })} />
                  </div>

                  <div className="row">
                    <div className="small">text</div>
                    <textarea value={el.text || ""} onChange={(e) => updateElement(el.id, { text: e.target.value })} />
                  </div>
                </>
              )}

              {el.type === "image" && (
                <>
                  <hr />
                  <div className="small" style={{ fontWeight: 700 }}>
                    Image
                  </div>
                  <div className="small">Tip: drag corners to resize (keeps ratio).</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
