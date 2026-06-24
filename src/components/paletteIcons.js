/** Palette icons matching the design mockup — inline SVG for SSR-safe hydration. */

import { WIND_CONE_ICON_URL } from "@/lib/windconeArt";
import { BUILDING_IMAGE_URL, TREE_IMAGE_URL } from "@/lib/obstacleArt";
import { MARSHALER_IMAGE_URL } from "@/lib/marshalerArt";
import { IMC_IMAGE_URL, VMC_IMAGE_URL } from "@/lib/weatherLabelArt";

const ICON_SIZE = 28;

export function PalettePavementIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} aria-hidden>
      <rect x="5" y="5" width="14" height="14" rx="1" fill="#9ca3af" />
    </svg>
  );
}

export function PaletteFatoPerimeterIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        stroke="#374151"
        strokeWidth="1.5"
        strokeDasharray="3.5 2.5"
      />
    </svg>
  );
}

export function PaletteTlofPerimeterIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden>
      <rect x="5" y="5" width="14" height="14" stroke="#1f2937" strokeWidth="1.5" />
    </svg>
  );
}

export function PaletteMarkingTouchdownIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="#eab308" strokeWidth="1.8" />
    </svg>
  );
}

export function PaletteMarkingHIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden>
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="none"
        stroke="#6b7280"
        strokeWidth="0.6"
        fontSize="15"
        fontWeight="400"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        H
      </text>
    </svg>
  );
}

export function PaletteSafetyPerimeterIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden>
      <rect x="5" y="5" width="14" height="14" stroke="#1f2937" strokeWidth="1.2" />
    </svg>
  );
}

export function PaletteApproachIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} aria-hidden className="text-brand">
      <path
        d="M4 12h12M13 8l5 4-5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaletteWindconeIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${WIND_CONE_ICON_URL}?width=56&height=56`}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PaletteGedungIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BUILDING_IMAGE_URL}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PalettePohonIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={TREE_IMAGE_URL}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PaletteImcIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={IMC_IMAGE_URL}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PaletteVmcIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={VMC_IMAGE_URL}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PaletteMarshalerIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARSHALER_IMAGE_URL}
      width={ICON_SIZE}
      height={ICON_SIZE}
      alt=""
      draggable={false}
      className="object-contain"
    />
  );
}

export function PaletteTrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" aria-hidden className="text-red-500">
      <path
        d="M4 7h16M9 7V5h6v2M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const PALETTE_CUSTOM_ICONS = {
  pavement: PalettePavementIcon,
  "fato-perimeter": PaletteFatoPerimeterIcon,
  fato: PaletteFatoPerimeterIcon,
  "tlof-perimeter": PaletteTlofPerimeterIcon,
  "marking-touchdown": PaletteMarkingTouchdownIcon,
  "marking-h": PaletteMarkingHIcon,
  "safety-perimeter": PaletteSafetyPerimeterIcon,
  safety: PaletteSafetyPerimeterIcon,
  approach: PaletteApproachIcon,
  windcone: PaletteWindconeIcon,
  imc: PaletteImcIcon,
  vmc: PaletteVmcIcon,
  marshaler: PaletteMarshalerIcon,
  "obstacle-gedung": PaletteGedungIcon,
  "obstacle-pohon": PalettePohonIcon,
  delete: PaletteTrashIcon,
};

export function resolvePaletteIconKey(item) {
  if (typeof item.icon === "string" && PALETTE_CUSTOM_ICONS[item.icon]) {
    return item.icon;
  }
  return item.id;
}

export function PaletteIcon({ iconKey }) {
  const Icon = PALETTE_CUSTOM_ICONS[iconKey];
  if (!Icon) return <span className="h-7 w-7" aria-hidden />;
  return <Icon />;
}
