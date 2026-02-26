import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Transformer, Image as KImage } from "react-konva";
import { EDITOR_W, EDITOR_H, useDeck } from "./store.js";
import { useImage } from "./useImage.js";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

const RectNode = React.forwardRef(function RectNode({ el, onSelect, onChange }, ref) {
  const radius = el.style?.radius ?? 0;
  const stroke = el.style?.stroke ?? null;
  const strokeWidth = el.style?.strokeWidth ?? 1;

  return (
    <Rect
      ref={ref}
      x={el.x}
      y={el.y}
      width={el.w}
      height={el.h}
      rotation={el.rotation || 0}
      fill={el.style?.fill || "#ccc"}
      cornerRadius={radius}
      stroke={stroke || undefined}
      strokeWidth={stroke ? strokeWidth : 0}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        const w = clamp(node.width() * scaleX, 5, EDITOR_W);
        const h = clamp(node.height() * scaleY, 5, EDITOR_H);

        onChange({ x: node.x(), y: node.y(), w, h, rotation: node.rotation() });
      }}
    />
  );
});

const TextNode = React.forwardRef(function TextNode({ el, onSelect, onChange, onDoubleClick }, ref) {
  return (
    <Text
      ref={ref}
      x={el.x}
      y={el.y}
      width={el.w}
      height={el.h}
      rotation={el.rotation || 0}
      text={el.text || ""}
      fontFamily={el.style?.fontFamily || "Calibri"}
      fontSize={el.style?.fontSize || 18}
      fontStyle={el.style?.bold ? "bold" : "normal"}
      fill={el.style?.color || "#111"}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        const w = clamp(node.width() * scaleX, 20, EDITOR_W);
        const h = clamp(node.height() * scaleY, 20, EDITOR_H);

        onChange({ x: node.x(), y: node.y(), w, h, rotation: node.rotation() });
      }}
    />
  );
});

const ImageNode = React.forwardRef(function ImageNode({ el, onSelect, onChange }, ref) {
  const img = useImage(el.src);

  return (
    <KImage
      ref={ref}
      x={el.x}
      y={el.y}
      width={el.w}
      height={el.h}
      rotation={el.rotation || 0}
      image={img}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const uniform = Math.min(scaleX, scaleY);

        node.scaleX(1);
        node.scaleY(1);

        const w = clamp(node.width() * uniform, 10, EDITOR_W);
        const h = clamp(node.height() * uniform, 10, EDITOR_H);

        onChange({ x: node.x(), y: node.y(), w, h, rotation: node.rotation() });
      }}
    />
  );
});

export default function CanvasEditor() {
  const { deck, activeSlideId, selectedElId, setSelectedEl, updateElement } = useDeck();
  const slide = deck.slides.find((s) => s.id === activeSlideId) || null;

  const trRef = useRef(null);
  const nodeRefs = useRef({});

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const selectedEl = useMemo(() => {
    if (!slide || !selectedElId) return null;
    return slide.elements.find((e) => e.id === selectedElId) || null;
  }, [slide, selectedElId]);

  const selectedNode = useMemo(() => {
    if (!selectedElId) return null;
    return nodeRefs.current[selectedElId] || null;
  }, [selectedElId]);

  useEffect(() => {
    if (!trRef.current) return;
    trRef.current.nodes(selectedNode ? [selectedNode] : []);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedNode]);

  // --- slide background (hooks must be unconditional) ---
  const bgColor = slide?.bg?.color || "#FFFFFF";
  const bgImage = slide?.bg?.image || null;

  // Safe to call even when src is null
  const bgImgObj = useImage(bgImage?.src || null);

  const bgPlacement = useMemo(() => {
    if (!bgImage || !bgImage.w || !bgImage.h) return null;

    const fit = bgImage.fit || "cover";
    const iw = bgImage.w;
    const ih = bgImage.h;

    const scale =
      fit === "contain"
        ? Math.min(EDITOR_W / iw, EDITOR_H / ih)
        : Math.max(EDITOR_W / iw, EDITOR_H / ih);

    const w = iw * scale;
    const h = ih * scale;
    const x = (EDITOR_W - w) / 2;
    const y = (EDITOR_H - h) / 2;

    return { x, y, w, h };
  }, [bgImage]);

  if (!slide) {
    return (
      <div className="canvasWrap">
        <div className="canvasCard" style={{ padding: 12, color: "#fff" }}>
          No active slide selected.
        </div>
      </div>
    );
  }

  return (
    <div className="canvasWrap">
      <div className="canvasCard">
        <Stage
          width={EDITOR_W}
          height={EDITOR_H}
          style={{ background: bgColor }}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedEl(null);
          }}
        >
          <Layer>
            <Rect x={0} y={0} width={EDITOR_W} height={EDITOR_H} fill={bgColor} listening={false} />

            {bgImage && bgImgObj && bgPlacement && (
              <KImage
                x={bgPlacement.x}
                y={bgPlacement.y}
                width={bgPlacement.w}
                height={bgPlacement.h}
                image={bgImgObj}
                listening={false}
              />
            )}

            {slide.elements.map((el) => {
              const onSelect = () => setSelectedEl(el.id);
              const onChange = (patch) => updateElement(el.id, patch);

              const setNodeRef = (node) => {
                if (node) nodeRefs.current[el.id] = node;
              };

              if (el.type === "rect") {
                return <RectNode key={el.id} ref={setNodeRef} el={el} onSelect={onSelect} onChange={onChange} />;
              }
              if (el.type === "image") {
                return <ImageNode key={el.id} ref={setNodeRef} el={el} onSelect={onSelect} onChange={onChange} />;
              }
              if (el.type === "text") {
                return (
                  <TextNode
                    key={el.id}
                    ref={setNodeRef}
                    el={el}
                    onSelect={onSelect}
                    onChange={onChange}
                    onDoubleClick={() => {
                      setEditingId(el.id);
                      setEditValue(el.text || "");
                    }}
                  />
                );
              }
              return null;
            })}

            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio={selectedEl?.type === "image"}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
            />
          </Layer>
        </Stage>
      </div>

      {editingId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: 520,
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>Edit text</div>
              <button className="btn" onClick={() => setEditingId(null)}>
                Close
              </button>
            </div>

            <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} />

            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setEditingId(null)}>
                Cancel
              </button>
              <button
                className="btn accent"
                onClick={() => {
                  updateElement(editingId, { text: editValue });
                  setEditingId(null);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}