const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const DATE_LONG_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const WEEKDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/** Long date + time for detail views. */
export function formatDateLongId(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_LONG_FORMATTER.format(date);
}

/** Stable date-time formatting for UI (fixed timezone avoids server/client drift). */
export function formatDateTimeId(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_TIME_FORMATTER.format(date);
}

/** Short weekday label without locale-sensitive toLocaleDateString. */
export function formatWeekdayShortId(value) {
  const date = value instanceof Date ? value : new Date(value);
  return WEEKDAY_SHORT[date.getDay()] ?? "—";
}
