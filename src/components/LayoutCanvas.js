"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import {
  BASE_TYPES,
  DRAGGABLE_IDS,
  PRESENT_VALIDATION_MAP,
  SCALABLE_PALETTE_IDS,
  TLOF_TYPES,
  getPaletteItemById,
  isTlofType,
} from "@/lib/paletteConfig";
import { loadWindconeImage } from "@/lib/windconeArt";
import {
  loadObstacleImage,
  isObstacleType,
  obstacleKindFromType,
} from "@/lib/obstacleArt";
import {
  createWeatherLabel,
  defaultWeatherPosition,
  isWeatherType,
  WEATHER_TYPES,
} from "@/lib/weatherLabelArt";
import { loadMarshalerImage } from "@/lib/marshalerArt";
import { computeAll } from "@/lib/calc";

// Fabric is imported dynamically (browser-only).
let fabric = null;

const FALLBACK_SPEC = { D: 13.8, OL: 16.66, UCW: 2.3, MTOM: 6400, vmc: 1 };

const COLORS = {
  ground: "#7d9b5e",
  safety: "#c9d6bb",
  fato: "#b9bec4",
  tlof: "#4f6868",
  pavement: "#55585a",
  marking: "#f0c931",
  markingCorner: "#c99200",
};

// Real-world default sizes (metres) for placeable components.
const COMPONENT_M = {
  windconePole: 8, // 8 m pole
  approachLen: 30, // 30 m arrow
};

const MIN_VIEW_ZOOM = 0.5;
const MAX_VIEW_ZOOM = 3;
const VIEW_ZOOM_STEP = 1.15;

const LayoutCanvas = forwardRef(function LayoutCanvas(
  { dims, onComponentsChange, onSelectInfo, selectInfo, onReady, fullSize = false },
  ref
) {
  const elRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const scaleRef = useRef(8); // px per metre
  const viewZoomRef = useRef(1);
  const baseSizeRef = useRef({ w: 640, h: 420 });
  const componentsRef = useRef(new Set());
  const keyHandlerRef = useRef(null);
  const wheelHandlerRef = useRef(null);
  const pendingAddsRef = useRef([]);
  const [viewZoomPct, setViewZoomPct] = useState(100);
  const [canvasReady, setCanvasReady] = useState(false);

  const layoutDims =
    Number(dims.fato) > 0 && Number(dims.tlof) > 0 ? dims : computeAll(FALLBACK_SPEC);

  function safetyExtentM(d = layoutDims) {
    const extent = d.fato + 2 * d.safety;
    return extent > 0 ? extent : 20;
  }

  function updateCanvasScale(d = layoutDims) {
    const { w, h } = baseSizeRef.current;
    scaleRef.current = (Math.min(w, h) * 0.7) / safetyExtentM(d);
  }

  function resizeCanvas(width, height) {
    const c = canvasRef.current;
    if (!c || width <= 0 || height <= 0) return;
    const roundedW = Math.round(width);
    const roundedH = Math.round(height);
    const { w, h } = baseSizeRef.current;
    if (w === roundedW && h === roundedH) return;
    baseSizeRef.current = { w: roundedW, h: roundedH };
    c.setDimensions({ width: roundedW, height: roundedH });
    updateCanvasScale();
    rebuildForDims();
    c.requestRenderAll();
  }

  useImperativeHandle(ref, () => ({
    addComponent: (type) => addComponent(type),
    addPaletteItem: (id, pos) => addPaletteItem(id, pos),
    addComponentAt: (type, clientX, clientY) =>
      addComponent(type, pointerFromClient(clientX, clientY)),
    removeSelected: () => removeSelected(),
    clearComponents: () => clearComponents(),
    reset: () => resetCanvas(),
    highlightBase: (type) => highlightBase(type),
    zoomIn: () => zoomByFactor(VIEW_ZOOM_STEP),
    zoomOut: () => zoomByFactor(1 / VIEW_ZOOM_STEP),
    resetZoom: () => resetViewZoom(),
    getCanvasEl: () => elRef.current,
    getGeometry: () => getGeometry(),
    exportDataURL: () => exportCanvasDataURL(),
    isReady: () => canvasReady,
  }));

  function baseRect(type) {
    const c = canvasRef.current;
    if (!c) return null;
    const obj = c.getObjects().find((o) => o.heliBase === type);
    return obj ? obj.getBoundingRect(true) : null;
  }

  function componentRect(heliType) {
    const c = canvasRef.current;
    if (!c) return null;
    const obj = c.getObjects().find((o) => o.heliType === heliType);
    return obj ? obj.getBoundingRect(true) : null;
  }

  function getGeometry() {
    const c = canvasRef.current;
    if (!c) return null;
    const s = scaleRef.current;
    const areas = {
      tlof:
        componentRect("tlof-perimeter") ||
        baseRect("tlof") ||
        baseRect("tlof-rooftop"),
      fato: componentRect("fato") || baseRect("fato"),
      safety: componentRect("safety") || baseRect("safety"),
    };
    const obstacles = [];
    const approaches = [];
    let windcone = false;
    c.getObjects().forEach((o) => {
      if (o.heliType === "obstacle") obstacles.push(o.getBoundingRect(true));
      else if (o.heliType === "approach") approaches.push(o.getBoundingRect(true));
      else if (o.heliType === "windcone") windcone = true;
    });
    return {
      scale: s,
      areas,
      obstacles,
      approaches,
      windcone,
      present: Array.from(componentsRef.current),
    };
  }

  function notify() {
    const c = canvasRef.current;
    const types = new Set();
    if (c) {
      c.getObjects().forEach((o) => {
        if (o.heliType) {
          types.add(o.heliType);
          const validationKey = PRESENT_VALIDATION_MAP[o.heliType];
          if (validationKey) types.add(validationKey);
        }
        if (o.heliBase) {
          types.add(o.heliBase);
          if (isTlofType(o.heliBase)) types.add("tlof");
        }
      });
    }
    componentsRef.current = types;
    onComponentsChange?.(Array.from(types));
  }

  function pointerFromClient(clientX, clientY) {
    const c = canvasRef.current;
    if (!c) return null;
    const pointer = c.getPointer({ clientX, clientY });
    return { x: pointer.x, y: pointer.y };
  }

  function posToAt(pos) {
    return pos ? { cx: pos.x, cy: pos.y } : null;
  }

  function canvasCenterPos() {
    const { w, h } = baseSizeRef.current;
    return { x: w / 2, y: h / 2 };
  }

  function defaultPlacementPos() {
    return canvasCenterPos();
  }

  function clampViewZoom(zoom) {
    return Math.min(MAX_VIEW_ZOOM, Math.max(MIN_VIEW_ZOOM, zoom));
  }

  function setViewZoom(zoom, point) {
    const c = canvasRef.current;
    if (!c || !fabric) return;
    const next = clampViewZoom(zoom);
    const anchor =
      point ||
      new fabric.Point(baseSizeRef.current.w / 2, baseSizeRef.current.h / 2);
    c.zoomToPoint(anchor, next);
    viewZoomRef.current = next;
    setViewZoomPct(Math.round(next * 100));
    c.requestRenderAll();
  }

  function zoomByFactor(factor, point) {
    setViewZoom(viewZoomRef.current * factor, point);
  }

  function resetViewZoom() {
    const c = canvasRef.current;
    if (!c) return;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    viewZoomRef.current = 1;
    setViewZoomPct(100);
    c.requestRenderAll();
  }

  function exportCanvasDataURL() {
    const c = canvasRef.current;
    if (!c) return null;
    const savedTransform = c.viewportTransform.slice();
    const savedZoom = viewZoomRef.current;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    c.setZoom(1);
    const url = c.toDataURL({ format: "png", multiplier: 2 });
    c.setViewportTransform(savedTransform);
    c.setZoom(savedZoom);
    return url;
  }

  function metres(px) {
    return Math.round((px / scaleRef.current) * 10) / 10;
  }

  // emit size info for the currently selected object
  function emitInfo(obj) {
    if (!obj || !onSelectInfo) return onSelectInfo?.(null);
    const wPx = obj.getScaledWidth();
    const hPx = obj.getScaledHeight();
    const baseLabels = {
      tlof: "TLOF",
      "tlof-rooftop": "TLOF Atap",
      fato: "FATO",
      safety: "Safety Area",
    };
    const typeLabels = {
      obstacle: "Obstacle",
      gedung: "Gedung",
      pohon: "Pohon",
      windcone: "Wind Cone",
      imc: "IMC",
      vmc: "VMC",
      marshaler: "Marshaler",
      approach: "Approach Path",
      pavement: "Permukaan Heliport",
      fato: "FATO Perimeter",
      "tlof-perimeter": "TLOF Perimeter",
      "marking-touchdown": "Marka Touchdown",
      "marking-h": "Marka Identifikasi (H)",
      safety: "Safety Area",
    };
    const kind = obj.heliBase || obj.heliObstacleKind || obj.heliType;
    onSelectInfo({
      type: kind,
      label: typeLabels[kind] || baseLabels[kind] || "Komponen",
      w: metres(wPx),
      h: metres(hPx),
    });
  }

  function isScalableObject(obj) {
    return Boolean(obj?.heliType || obj?.heliBase);
  }

  function styleInteractiveObject(obj, { scalable = true } = {}) {
    obj.set({
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockScalingX: !scalable,
      lockScalingY: !scalable,
      cornerColor: "#1f4e9c",
      borderColor: "#1f4e9c",
      transparentCorners: false,
    });
    if (scalable && obj.setControlsVisibility) {
      obj.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
      });
    }
  }

  function styleBaseGroup(group) {
    styleInteractiveObject(group, { scalable: true });
    group.set({ subTargetCheck: false });
  }

  function canvasCenter() {
    const { w, h } = baseSizeRef.current;
    return { cx: w / 2, cy: h / 2 };
  }

  function styleFixedWeatherLabel(obj) {
    obj.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
    });
  }

  function syncWeatherLabels() {
    const c = canvasRef.current;
    if (!c || !fabric) return;
    const s = scaleRef.current;

    c.getObjects()
      .filter((o) => isWeatherType(o.heliType))
      .forEach((o) => c.remove(o));

    WEATHER_TYPES.forEach((kind) => {
      const obj = createWeatherLabel(fabric, kind, s);
      obj.heliFixed = true;
      styleFixedWeatherLabel(obj);
      c.add(obj);
      defaultWeatherPosition(c, obj, kind);
    });
    keepScaleOnTop();
  }

  function drawGround() {
    const c = canvasRef.current;
    if (!c || !fabric) return;
    c.clear();
    c.backgroundColor = COLORS.ground;
    drawScaleBar();
    syncWeatherLabels();
  }

  function resetCanvas() {
    resetViewZoom();
    drawGround();
    onSelectInfo?.(null);
    canvasRef.current?.requestRenderAll();
    notify();
  }

  function createBaseGroup(type, at, { variant = "full" } = {}) {
    if (!fabric) return null;
    const center = at || canvasCenter();
    const s = scaleRef.current;
    const safetyD = (layoutDims.fato + 2 * layoutDims.safety) * s;
    const fatoD = layoutDims.fato * s;
    const tlofD = layoutDims.tlof * s;

    const mk = (size, fill, stroke, dash) =>
      new fabric.Rect({
        left: -size / 2,
        top: -size / 2,
        width: size,
        height: size,
        fill,
        stroke,
        strokeDashArray: dash,
        strokeWidth: 1.5,
        selectable: false,
        evented: false,
      });

    let children = [];
    if (type === "safety") {
      children = [createOutlineRect(safetyD, "#1f2937")];
    } else if (type === "fato") {
      children = [createOutlineRect(fatoD, "#ffffff", [4, 4])];
    } else if (type === "tlof") {
      if (variant === "perimeter") {
        children = [createOutlineRect(tlofD, "#ffffff")];
      } else {
      const half = tlofD / 2;
      const markW = Math.max(3, tlofD * 0.028);
      const cornerSize = Math.max(6, tlofD * 0.1);
      const circleR = half * 0.84;

      const pad = new fabric.Rect({
        left: -half,
        top: -half,
        width: tlofD,
        height: tlofD,
        fill: COLORS.tlof,
        selectable: false,
        evented: false,
      });

      const square = new fabric.Rect({
        left: -half,
        top: -half,
        width: tlofD,
        height: tlofD,
        fill: "",
        stroke: COLORS.marking,
        strokeWidth: markW,
        selectable: false,
        evented: false,
      });

      const cornerPositions = [
        { x: -half, y: -half },
        { x: half - cornerSize, y: -half },
        { x: -half, y: half - cornerSize },
        { x: half - cornerSize, y: half - cornerSize },
      ];
      const corners = cornerPositions.map(
        ({ x, y }) =>
          new fabric.Rect({
            left: x,
            top: y,
            width: cornerSize,
            height: cornerSize,
            fill: COLORS.markingCorner,
            selectable: false,
            evented: false,
          })
      );

      const circle = new fabric.Circle({
        left: 0,
        top: 0,
        radius: circleR,
        originX: "center",
        originY: "center",
        fill: "",
        stroke: COLORS.marking,
        strokeWidth: markW,
        selectable: false,
        evented: false,
      });

      const h = new fabric.Text("H", {
        left: 0,
        top: 0,
        originX: "center",
        originY: "center",
        fontSize: Math.max(20, circleR * 1.05),
        fontWeight: "900",
        fill: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        selectable: false,
        evented: false,
      });

      children = [pad, square, ...corners];
      if (variant === "full") {
        children.push(circle, h);
      }
      }
    } else if (type === "tlof-rooftop") {
      const half = tlofD / 2;
      const red = "#d8161f";
      const white = "#ffffff";
      const borderW = Math.max(2, tlofD * 0.012);
      const armW = tlofD * 0.2;
      const armLen = tlofD * 0.82;

      const pad = new fabric.Rect({
        left: -half,
        top: -half,
        width: tlofD,
        height: tlofD,
        fill: red,
        selectable: false,
        evented: false,
      });

      const border = new fabric.Rect({
        left: -half,
        top: -half,
        width: tlofD,
        height: tlofD,
        fill: "",
        stroke: white,
        strokeWidth: borderW,
        selectable: false,
        evented: false,
      });

      const vArm = new fabric.Rect({
        left: -armW / 2,
        top: -armLen / 2,
        width: armW,
        height: armLen,
        fill: white,
        selectable: false,
        evented: false,
      });

      const hArm = new fabric.Rect({
        left: -armLen / 2,
        top: -armW / 2,
        width: armLen,
        height: armW,
        fill: white,
        selectable: false,
        evented: false,
      });

      const h = new fabric.Text("H", {
        left: 0,
        top: 0,
        originX: "center",
        originY: "center",
        fontSize: Math.max(18, armW * 1.1),
        fontWeight: "900",
        fill: red,
        fontFamily: "Arial, Helvetica, sans-serif",
        selectable: false,
        evented: false,
      });

      children = [pad, border, vArm, hArm, h];
    } else {
      return null;
    }

    const group = new fabric.Group(children, {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
      selectable: true,
      evented: true,
    });
    group.heliBase = type;
    group.heliBaseVariant = variant;
    styleBaseGroup(group);
    return group;
  }

  function keepScaleOnTop() {
    const c = canvasRef.current;
    const scale = c?.getObjects().find((o) => o.heliScale);
    scale?.bringToFront();
  }

  function restackBases() {
    const c = canvasRef.current;
    if (!c) return;
    let idx = 0;
    ["safety", "fato", ...TLOF_TYPES].forEach((type) => {
      const obj = c.getObjects().find((o) => o.heliBase === type);
      if (obj) {
        c.moveTo(obj, idx);
        idx += 1;
      }
    });
    keepScaleOnTop();
  }

  function addBaseLayer(type, { silent = false, at = null, variant = "full" } = {}) {
    const c = canvasRef.current;
    if (!c || !fabric || !BASE_TYPES.includes(type)) return;

    if (isTlofType(type)) {
      c.getObjects()
        .filter((o) => isTlofType(o.heliBase) && o.heliBase !== type)
        .forEach((o) => c.remove(o));
    }

    if (c.getObjects().some((o) => o.heliBase === type)) {
      if (!silent) highlightBase(type);
      return;
    }
    const group = createBaseGroup(type, at, { variant });
    if (!group) return;
    c.add(group);
    restackBases();
    if (!silent) {
      c.setActiveObject(group);
      emitInfo(group);
    }
    c.requestRenderAll();
    if (!silent) notify();
  }

  function rebuildForDims() {
    const c = canvasRef.current;
    if (!c || !fabric) return;

    const scalable = [];
    const bases = [];
    const extras = [];

    c.getObjects().forEach((o) => {
      if (o.heliScale) return;
      if (SCALABLE_PALETTE_IDS.includes(o.heliType)) {
        scalable.push({
          id: o.heliType,
          at: { cx: o.left, cy: o.top },
          scaleX: o.scaleX,
          scaleY: o.scaleY,
        });
      } else if (o.heliBase) {
        bases.push({
          type: o.heliBase,
          at: { cx: o.left, cy: o.top },
          variant: o.heliBaseVariant || "full",
          scaleX: o.scaleX,
          scaleY: o.scaleY,
        });
      } else if (o.heliType && !isWeatherType(o.heliType)) {
        extras.push(o);
      }
    });

    drawGround();

    scalable.forEach(({ id, at, scaleX, scaleY }) => {
      const obj = createComponentByPaletteId(id, at);
      if (obj) {
        if (scaleX != null) obj.set({ scaleX, scaleY: scaleY ?? scaleX });
        styleInteractiveObject(obj);
        c.add(obj);
      }
    });

    bases.forEach(({ type, at, variant, scaleX, scaleY }) => {
      const group = createBaseGroup(type, at, { variant });
      if (group) {
        if (scaleX != null) group.set({ scaleX, scaleY: scaleY ?? scaleX });
        styleBaseGroup(group);
        c.add(group);
      }
    });

    extras.forEach((o) => c.add(o));
    syncWeatherLabels();
    keepScaleOnTop();
    c.requestRenderAll();
    notify();
  }

  function highlightBase(type) {
    const c = canvasRef.current;
    if (!c) return;
    const obj = c.getObjects().find((o) => o.heliBase === type);
    if (!obj) return;
    const rect = obj.type === "group" ? obj.getObjects()[0] : obj;
    if (!rect) return;
    const orig = rect.stroke || "#ffffff";
    const origW = rect.strokeWidth || 1.5;
    rect.set({ stroke: "#f59e0b", strokeWidth: 3 });
    c.requestRenderAll();
    setTimeout(() => {
      if (!canvasRef.current) return;
      rect.set({ stroke: orig, strokeWidth: origW });
      c.requestRenderAll();
    }, 700);
  }

  function drawScaleBar() {
    const c = canvasRef.current;
    if (!c || !fabric) return;
    const s = scaleRef.current;
    const seg = 10 * s;
    const segCount = 5;
    const barW = seg * segCount;
    const barH = 10;
    const x0 = baseSizeRef.current.w - barW - 20;
    const y0 = baseSizeRef.current.h - 34;
    const parts = [];

    for (let i = 0; i < segCount; i++) {
      parts.push(
        new fabric.Rect({
          left: x0 + i * seg,
          top: y0,
          width: seg,
          height: barH,
          fill: i % 2 === 0 ? "#000000" : "#ffffff",
          stroke: "#000000",
          strokeWidth: 0.5,
        })
      );
    }

    for (let i = 0; i <= segCount; i++) {
      parts.push(
        new fabric.Text(`${i * 10}${i === segCount ? " m" : ""}`, {
          left: x0 + i * seg,
          top: y0 - 11,
          originX: "center",
          fontSize: 11,
          fontWeight: "600",
          fill: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        })
      );
    }

    const bar = new fabric.Group(parts, { selectable: false, evented: false });
    bar.heliScale = true;
    c.add(bar);
  }

  function placeComponent(obj, pos) {
    const c = canvasRef.current;
    if (!c || !obj) return;
    if (pos) {
      obj.set({
        left: pos.x,
        top: pos.y,
        originX: "center",
        originY: "center",
      });
      obj.setCoords();
    }
    styleInteractiveObject(obj, { scalable: isScalableObject(obj) });
    c.add(obj);
    c.setActiveObject(obj);
    emitInfo(obj);
    c.requestRenderAll();
    notify();
  }

  function createOutlineRect(size, stroke, dash, strokeWidth = 1.5) {
    return new fabric.Rect({
      left: -size / 2,
      top: -size / 2,
      width: size,
      height: size,
      fill: "transparent",
      stroke,
      strokeDashArray: dash ?? undefined,
      strokeWidth,
      selectable: false,
      evented: false,
    });
  }

  function createLayerRect(size, fill, stroke, dash) {
    return new fabric.Rect({
      left: -size / 2,
      top: -size / 2,
      width: size,
      height: size,
      fill,
      stroke,
      strokeDashArray: dash,
      strokeWidth: 1.5,
      selectable: false,
      evented: false,
    });
  }

  function createFatoComponent(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const fatoD = layoutDims.fato * s;
    const center = at || canvasCenter();
    const group = new fabric.Group([createOutlineRect(fatoD, "#ffffff", [4, 4])], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "fato";
    return group;
  }

  function createSafetyComponent(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const safetyD = (layoutDims.fato + 2 * layoutDims.safety) * s;
    const center = at || canvasCenter();
    const group = new fabric.Group([createOutlineRect(safetyD, "#1f2937")], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "safety";
    return group;
  }

  function createTlofPerimeterComponent(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const tlofD = layoutDims.tlof * s;
    const center = at || canvasCenter();
    const group = new fabric.Group([createOutlineRect(tlofD, "#ffffff")], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "tlof-perimeter";
    return group;
  }

  function createApproachComponent(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const H = baseSizeRef.current.h;
    const lenPx = COMPONENT_M.approachLen * s;
    const center = at || { cx: 30 + lenPx / 2, cy: H / 2 };

    const line = new fabric.Line([0, 12, lenPx, 12], {
      stroke: "#1f4e9c",
      strokeWidth: 4,
      strokeDashArray: [10, 6],
    });
    const head = new fabric.Triangle({
      left: lenPx,
      top: 0,
      width: 22,
      height: 24,
      angle: 90,
      fill: "#1f4e9c",
    });
    const group = new fabric.Group([line, head], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "approach";
    return group;
  }

  function createComponentByPaletteId(id, at) {
    switch (id) {
      case "pavement":
        return createPavement(at);
      case "fato":
        return createFatoComponent(at);
      case "tlof-perimeter":
        return createTlofPerimeterComponent(at);
      case "marking-touchdown":
        return createMarkingTouchdown(at);
      case "marking-h":
        return createMarkingH(at);
      case "safety":
        return createSafetyComponent(at);
      case "approach":
        return createApproachComponent(at);
      default:
        return null;
    }
  }

  function createPavement(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const size = layoutDims.fato * s;
    const center = at || canvasCenter();
    const pad = new fabric.Rect({
      left: -size / 2,
      top: -size / 2,
      width: size,
      height: size,
      fill: COLORS.pavement,
      selectable: false,
      evented: false,
    });
    const group = new fabric.Group([pad], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "pavement";
    return group;
  }

  function createMarkingTouchdown(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const tlofD = layoutDims.tlof * s;
    const half = tlofD / 2;
    const markW = Math.max(3, tlofD * 0.028);
    const circleR = half * 0.84;
    const center = at || canvasCenter();

    const circle = new fabric.Circle({
      left: 0,
      top: 0,
      radius: circleR,
      originX: "center",
      originY: "center",
      fill: "",
      stroke: COLORS.marking,
      strokeWidth: markW,
      selectable: false,
      evented: false,
    });

    const group = new fabric.Group([circle], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "marking-touchdown";
    return group;
  }

  function createMarkingH(at) {
    if (!fabric) return null;
    const s = scaleRef.current;
    const tlofD = layoutDims.tlof * s;
    const half = tlofD / 2;
    const circleR = half * 0.84;
    const center = at || canvasCenter();

    const h = new fabric.Text("H", {
      left: 0,
      top: 0,
      originX: "center",
      originY: "center",
      fontSize: Math.max(20, circleR * 1.05),
      fontWeight: "900",
      fill: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      selectable: false,
      evented: false,
    });

    const group = new fabric.Group([h], {
      left: center.cx ?? center.x,
      top: center.cy ?? center.y,
      originX: "center",
      originY: "center",
    });
    group.heliType = "marking-h";
    return group;
  }

  function flushPendingAdds() {
    const pending = pendingAddsRef.current.splice(0);
    pending.forEach(({ id, pos }) => addPaletteItem(id, pos));
  }

  function addPaletteItem(id, pos) {
    const item = getPaletteItemById(id);
    if (!item) return;

    const c = canvasRef.current;
    if (!c || !fabric) {
      pendingAddsRef.current.push({ id, pos: pos ?? null });
      return;
    }

    if (isWeatherType(item.type)) return;

    const placement = pos ?? defaultPlacementPos();
    const at = posToAt(placement);
    const s = scaleRef.current;

    const syncObj = createComponentByPaletteId(id, at);
    if (syncObj) {
      placeComponent(syncObj, placement);
      return;
    }

    if (id === "windcone") {
      loadWindconeImage(fabric, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    }

    if (isObstacleType(item.type)) {
      const kind = obstacleKindFromType(item.type);
      loadObstacleImage(fabric, kind, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    }

    if (item.type === "marshaler") {
      loadMarshalerImage(fabric, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    }

    addComponent(item.type, placement);
  }

  function addComponent(type, pos) {
    const c = canvasRef.current;
    if (!c || !fabric) return;
    const placement = pos ?? defaultPlacementPos();
    if (BASE_TYPES.includes(type)) {
      addBaseLayer(type, { at: posToAt(placement) });
      return;
    }
    const s = scaleRef.current;
    let obj = null;

    if (type === "windcone") {
      loadWindconeImage(fabric, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    } else if (isObstacleType(type)) {
      const kind = obstacleKindFromType(type);
      loadObstacleImage(fabric, kind, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    } else if (type === "marshaler") {
      loadMarshalerImage(fabric, s, (img) => {
        if (!img || canvasRef.current !== c) return;
        placeComponent(img, placement);
      });
      return;
    } else if (isWeatherType(type)) {
      return;
    } else if (type === "approach") {
      const lenPx = COMPONENT_M.approachLen * s;
      const line = new fabric.Line([0, 12, lenPx, 12], {
        stroke: "#1f4e9c",
        strokeWidth: 4,
        strokeDashArray: [10, 6],
      });
      const head = new fabric.Triangle({
        left: lenPx,
        top: 0,
        width: 22,
        height: 24,
        angle: 90,
        fill: "#1f4e9c",
      });
      obj = new fabric.Group([line, head]);
      obj.heliType = "approach";
    }

    if (obj) placeComponent(obj, placement);
  }

  function removeSelected() {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObjects().filter(
      (o) => (o.heliType || o.heliBase) && !o.heliFixed && !isWeatherType(o.heliType)
    );
    if (active.length === 0) return;
    active.forEach((o) => c.remove(o));
    c.discardActiveObject();
    onSelectInfo?.(null);
    c.requestRenderAll();
    notify();
  }

  function clearComponents() {
    const c = canvasRef.current;
    if (!c) return;
    c.getObjects()
      .filter((o) => (o.heliType || o.heliBase) && !o.heliFixed && !isWeatherType(o.heliType))
      .forEach((o) => c.remove(o));
    onSelectInfo?.(null);
    c.requestRenderAll();
    notify();
  }

  // init
  useEffect(() => {
    let mounted = true;
    let canvasEl = null;
    (async () => {
      const mod = await import("fabric");
      fabric = mod.fabric || mod.default || mod;
      if (!mounted || !elRef.current) return;
      const container = containerRef.current;
      const width = container?.clientWidth || 640;
      const height = container?.clientHeight || (fullSize ? 480 : 420);
      baseSizeRef.current = { w: width, h: height };
      const c = new fabric.Canvas(elRef.current, {
        width,
        height,
        selection: true,
        preserveObjectStacking: true,
      });
      canvasRef.current = c;

      const initExtent = layoutDims.fato + 2 * layoutDims.safety || 20;
      scaleRef.current = (Math.min(width, height) * 0.7) / initExtent;

      // selection / transform events -> emit live size info
      const handleSel = (e) => emitInfo((e.selected && e.selected[0]) || c.getActiveObject());
      c.on("selection:created", handleSel);
      c.on("selection:updated", handleSel);
      c.on("selection:cleared", () => onSelectInfo?.(null));
      c.on("object:scaling", (e) => emitInfo(e.target));
      c.on("object:modified", (e) => emitInfo(e.target));
      c.on("object:moving", (e) => emitInfo(e.target));

      drawGround();
      notify();
      setCanvasReady(true);
      flushPendingAdds();
      onReady?.();

      canvasEl = elRef.current;
      wheelHandlerRef.current = (e) => {
        if (!canvasRef.current) return;
        e.preventDefault();
        const pointer = canvasRef.current.getPointer(e);
        const factor = e.deltaY < 0 ? VIEW_ZOOM_STEP : 1 / VIEW_ZOOM_STEP;
        zoomByFactor(factor, new fabric.Point(pointer.x, pointer.y));
      };
      canvasEl?.addEventListener("wheel", wheelHandlerRef.current, {
        passive: false,
      });

      // Keyboard: Delete / Backspace removes the selected component.
      keyHandlerRef.current = (e) => {
        if (e.key !== "Delete" && e.key !== "Backspace") return;
        const tag = (e.target?.tagName || "").toLowerCase();
        const typing =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          e.target?.isContentEditable;
        if (typing) return; // don't hijack typing in form fields
        const c2 = canvasRef.current;
        if (!c2 || c2.getActiveObjects().length === 0) return;
        e.preventDefault();
        removeSelected();
      };
      window.addEventListener("keydown", keyHandlerRef.current);
    })();
    return () => {
      mounted = false;
      if (wheelHandlerRef.current && canvasEl) {
        canvasEl.removeEventListener("wheel", wheelHandlerRef.current);
        wheelHandlerRef.current = null;
      }
      if (keyHandlerRef.current) {
        window.removeEventListener("keydown", keyHandlerRef.current);
        keyHandlerRef.current = null;
      }
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
      setCanvasReady(false);
      pendingAddsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canvasReady) return;
    const syncSize = () => {
      resizeCanvas(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(() => syncSize());
    ro.observe(container);
    syncSize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady, fullSize]);

  // redraw base when dims change
  useEffect(() => {
    if (!canvasRef.current || !fabric) return;
    updateCanvasScale();
    rebuildForDims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.fato, dims.safety, dims.tlof]);

  function onDrop(e) {
    e.preventDefault();
    const pos = pointerFromClient(e.clientX, e.clientY);
    const id = e.dataTransfer.getData("heli/id");
    if (id && DRAGGABLE_IDS.includes(id)) {
      addPaletteItem(id, pos);
      return;
    }
    const type = e.dataTransfer.getData("heli/type");
    if (type && type !== "delete") {
      addComponent(type, pos);
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-end gap-1">
        <div className="flex items-center gap-1 rounded-md bg-white p-1 shadow ring-1 ring-slate-200">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded text-sm font-bold text-slate-600 hover:bg-slate-100"
            onClick={() => zoomByFactor(1 / VIEW_ZOOM_STEP)}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className="min-w-[3rem] rounded px-1 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
            onClick={resetViewZoom}
            title="Reset zoom"
          >
            {viewZoomPct}%
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded text-sm font-bold text-slate-600 hover:bg-slate-100"
            onClick={() => zoomByFactor(VIEW_ZOOM_STEP)}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-lg ring-1 ring-slate-300 ${
          fullSize ? "aspect-[16/10] min-h-[420px]" : "h-[420px]"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={(e) => e.preventDefault()}
      >
        <canvas ref={elRef} />
        {selectInfo && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow">
            {selectInfo.label}: {selectInfo.w} × {selectInfo.h} m
          </div>
        )}
        <p className="pointer-events-none absolute bottom-2 left-3 z-10 text-[10px] text-white/80 drop-shadow">
          Scroll untuk zoom
        </p>
      </div>
    </div>
  );
});

export default LayoutCanvas;
