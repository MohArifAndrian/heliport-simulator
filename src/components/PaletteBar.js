"use client";

import { useRef } from "react";
import { PALETTE_ITEMS, DELETE_PALETTE_ITEM } from "@/lib/paletteConfig";
import { makeWindconeDragGhost } from "@/lib/windconeArt";
import { isWeatherType, makeWeatherDragGhost } from "@/lib/weatherLabelArt";
import { PaletteIcon, resolvePaletteIconKey } from "@/components/paletteIcons";

const ALL_ITEMS = [...PALETTE_ITEMS, DELETE_PALETTE_ITEM];

export default function PaletteBar({ onAdd, onDelete }) {
  const ghostRef = useRef(null);
  const suppressClickRef = useRef(false);

  function handleDragStart(e, item) {
    if (!item.draggable || item.type === "delete") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("heli/id", item.id);
    e.dataTransfer.setData("heli/type", item.type);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "copy";

    if (ghostRef.current) ghostRef.current.remove();

    let ghost;
    if (item.type === "windcone") {
      ghost = makeWindconeDragGhost();
      e.dataTransfer.setDragImage(ghost, 36, 40);
    } else if (isWeatherType(item.type)) {
      ghost = makeWeatherDragGhost(item.type);
      e.dataTransfer.setDragImage(ghost, 36, 28);
    } else {
      const clone = e.currentTarget.cloneNode(true);
      clone.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:96px;" +
        "opacity:0.95;pointer-events:none;z-index:9999;";
      document.body.appendChild(clone);
      ghost = clone;
      e.dataTransfer.setDragImage(clone, 48, 48);
    }
    ghostRef.current = ghost;
  }

  function handleDragEnd() {
    suppressClickRef.current = true;
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 150);
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  }

  function handleActivate(item) {
    if (suppressClickRef.current) return;
    if (item.type === "delete") {
      onDelete?.();
      return;
    }
    onAdd?.(item.id);
  }

  function handleKeyDown(e, item) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate(item);
    }
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {ALL_ITEMS.map((item) => {
        const isDelete = item.destructive;
        const className = [
          "flex min-h-[88px] flex-col items-center justify-center gap-1.5",
          "rounded-lg border bg-white px-1.5 py-2",
          "text-center text-[10px] font-medium leading-tight",
          "select-none outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          isDelete
            ? "border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
            : "border-slate-200 text-slate-600 hover:border-brand hover:shadow-sm",
          item.draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        ].join(" ");

        if (item.draggable) {
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              draggable
              onClick={() => handleActivate(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              title={item.hint}
              className={className}
            >
              <span className="flex h-7 flex-none items-center justify-center pointer-events-none">
                <PaletteIcon iconKey={resolvePaletteIconKey(item)} />
              </span>
              <span className="px-0.5 pointer-events-none">{item.label}</span>
            </div>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleActivate(item)}
            title={item.hint}
            className={className}
          >
            <span className="flex h-7 flex-none items-center justify-center">
              <PaletteIcon iconKey={resolvePaletteIconKey(item)} />
            </span>
            <span className="px-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
