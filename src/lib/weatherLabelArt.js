/** IMC / VMC weather label PNG assets for canvas, palette, and drag preview. */

export const IMC_IMAGE_URL = "/imc.png";
export const VMC_IMAGE_URL = "/vmc.png";

export const WEATHER_TYPES = ["vmc", "imc"];

/** Sign width on canvas (~2.8 m). */
export const WEATHER_WIDTH_M = 2.8;

export function weatherImageUrl(kind) {
  return kind === "imc" ? IMC_IMAGE_URL : VMC_IMAGE_URL;
}

export function isWeatherType(type) {
  return WEATHER_TYPES.includes(type);
}

/** Load PNG as Fabric.Image scaled to sign width (metres → px). */
export function loadWeatherImage(fabric, kind, scalePxPerM, onReady) {
  const url = weatherImageUrl(kind);
  const targetW = WEATHER_WIDTH_M * scalePxPerM;

  fabric.Image.fromURL(
    url,
    (img) => {
      if (!img) {
        onReady?.(null);
        return;
      }
      const scale = targetW / (img.width || targetW);
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: "left",
        originY: "top",
      });
      img.heliType = kind;
      onReady?.(img);
    },
    { crossOrigin: "anonymous" }
  );
}

/** DOM element for HTML5 drag preview. */
export function makeWeatherDragGhost(kind) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:72px;height:56px;" +
    "display:flex;align-items:center;justify-content:center;" +
    "background:#fff;border:1px solid #e2e8f0;border-radius:10px;" +
    "box-shadow:0 4px 14px rgba(0,0,0,.15);pointer-events:none;z-index:9999;";
  const img = document.createElement("img");
  img.src = weatherImageUrl(kind);
  img.width = 56;
  img.height = 40;
  img.alt = "";
  img.draggable = false;
  img.style.objectFit = "contain";
  wrap.appendChild(img);
  document.body.appendChild(wrap);
  return wrap;
}
