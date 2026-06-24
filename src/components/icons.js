export const LOGO_URL = "/logo-poltekbang.png";

export function SiteLogo({ size = 36, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="Logo Politeknik Penerbangan"
      width={size}
      height={size}
      draggable={false}
      className={`object-contain ${className}`}
    />
  );
}

/** Logo lebih besar untuk header portal dosen. */
export function DosenLogo({ className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="Logo Politeknik Penerbangan"
      width={48}
      height={48}
      draggable={false}
      className={`h-12 w-12 object-contain ${className}`}
    />
  );
}

export const IconH = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M9 8v8M15 8v8M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
export const IconSquareDashed = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);
export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconWind = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <path d="M5 4v16" />
    <path d="M5 5h12l-3 3 3 3H5" fill="currentColor" stroke="none" />
  </svg>
);
export const IconCube = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...p}>
    <path d="M12 2l9 5v10l-9 5-9-5V7z" />
    <path d="M12 2v20M3 7l9 5 9-5" />
  </svg>
);
export const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
export const IconWarn = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}>
    <path d="M12 3l9 16H3z" />
    <path d="M12 10v4M12 17v.5" />
  </svg>
);
