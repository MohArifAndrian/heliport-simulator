/** Palette item definitions — layout matches the design mockup (7×2 grid). */

import { WIND_CONE_ICON } from "./windconeArt";

export const TLOF_TYPES = ["tlof", "tlof-rooftop"];

export const PALETTE_ITEMS = [
  {
    id: "pavement",
    type: "pavement",
    label: "Permukaan Heliport (Pavement)",
    icon: "pavement",
    draggable: true,
    hint: "Klik atau drag permukaan pavemen ke kanvas — bisa dipindah",
  },
  {
    id: "fato",
    type: "fato",
    label: "FATO Perimeter",
    icon: "fato-perimeter",
    draggable: true,
    hint: "Klik atau drag FATO ke kanvas — bisa dipindah",
  },
  {
    id: "tlof-perimeter",
    type: "tlof",
    label: "TLOF Perimeter",
    icon: "tlof-perimeter",
    draggable: true,
    hint: "Klik atau drag TLOF ke kanvas — bisa dipindah",
  },
  {
    id: "marking-touchdown",
    type: "marking-touchdown",
    label: "Marka Touchdown/ Positioning",
    icon: "marking-touchdown",
    draggable: true,
    hint: "Klik atau drag marka lingkaran touchdown ke kanvas",
  },
  {
    id: "marking-h",
    type: "marking-h",
    label: "Marka Identifikasi (H)",
    icon: "marking-h",
    draggable: true,
    hint: "Klik atau drag marka identifikasi H ke kanvas",
  },
  {
    id: "safety",
    type: "safety",
    label: "Safety Area",
    icon: "safety-perimeter",
    draggable: true,
    hint: "Klik atau drag Safety Area ke kanvas — bisa dipindah",
  },
  {
    id: "approach",
    type: "approach",
    label: "Approach/ Departure Path",
    icon: "approach",
    draggable: true,
    hint: "Klik atau drag ke kanvas — bisa diputar dengan handle rotasi",
  },
  {
    id: "windcone",
    type: "windcone",
    label: "Wind Direction Indicator",
    icon: WIND_CONE_ICON,
    colorIcon: true,
    draggable: true,
    hint: "Klik atau drag ke kanvas",
  },
  {
    id: "imc",
    type: "imc",
    label: "IMC",
    icon: "imc",
    draggable: true,
    hint: "Klik atau drag label IMC ke kanvas",
  },
  {
    id: "vmc",
    type: "vmc",
    label: "VMC",
    icon: "vmc",
    draggable: true,
    hint: "Klik atau drag label VMC ke kanvas",
  },
  {
    id: "marshaler",
    type: "marshaler",
    label: "Marshaler",
    icon: "marshaler",
    draggable: true,
    hint: "Klik atau drag marshaler ke kanvas — bisa dipindah",
  },
  {
    id: "obstacle-gedung",
    type: "obstacle-gedung",
    label: "Gedung",
    icon: "obstacle-gedung",
    draggable: true,
    hint: "Klik atau drag gedung ke kanvas sebagai obstacle",
  },
  {
    id: "obstacle-pohon",
    type: "obstacle-pohon",
    label: "Pohon",
    icon: "obstacle-pohon",
    draggable: true,
    hint: "Klik atau drag pohon ke kanvas sebagai obstacle",
  },
];

export const DELETE_PALETTE_ITEM = {
  id: "delete",
  type: "delete",
  label: "Hapus",
  icon: "delete",
  draggable: false,
  destructive: true,
  hint: "Hapus komponen terpilih (Delete / Backspace)",
};

export const DRAGGABLE_TYPES = PALETTE_ITEMS.filter((p) => p.draggable).map(
  (p) => p.type
);

export const DRAGGABLE_IDS = PALETTE_ITEMS.filter((p) => p.draggable).map(
  (p) => p.id
);

export function getPaletteItemById(id) {
  return PALETTE_ITEMS.find((p) => p.id === id) ?? null;
}

/** Maps palette / canvas heliType → validation key used in checks. */
export const PRESENT_VALIDATION_MAP = {
  fato: "fato",
  "tlof-perimeter": "tlof",
  safety: "safety",
  approach: "approach",
  windcone: "windcone",
};

export const SCALABLE_PALETTE_IDS = [
  "pavement",
  "fato",
  "tlof-perimeter",
  "marking-touchdown",
  "marking-h",
  "safety",
];

export const BASE_TYPES = [...TLOF_TYPES, "fato", "safety"];

export function isTlofType(type) {
  return TLOF_TYPES.includes(type);
}
