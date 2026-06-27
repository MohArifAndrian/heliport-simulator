"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavForRole } from "@/lib/portalNav";
import { usePortalSession } from "@/components/PortalSessionProvider";

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  if (href === "/dashboard/admin/settings") {
    return pathname === href || pathname.startsWith("/dashboard/admin/settings");
  }
  if (href === "/dashboard/settings") {
    return pathname === "/dashboard/settings";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name, active }) {
  const color = active ? "text-accent" : "text-white/60";
  const props = {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    className: color,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
        </svg>
      );
    case "account":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M6 20v-1a6 6 0 0 1 12 0v1" strokeLinecap="round" />
          <path d="M16 4.5l1.5 1.5M20 4.5l-1.5 1.5" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 11c1.7 0 3-1.3 3-3S17.7 5 16 5s-3 1.3-3 3 1.3 3 3 3zM8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3z" />
          <path d="M8 13c-2.7 0-5 1.3-5 3v2h10v-2c0-1.7-2.3-3-5-3zM16 13c-.3 0-.6 0-1 .1 1.2.8 2 2 2 3.9v2h6v-2c0-1.7-2.3-3-5-3z" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5z" />
          <path d="M8 7h8M8 11h8" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return <span className={`h-[18px] w-[18px] rounded ${active ? "bg-accent" : "bg-white/20"}`} />;
  }
}

export default function DosenSidebar() {
  const pathname = usePathname();
  const { session, loading } = usePortalSession();
  const role = session?.role;

  if (loading || !role) {
    return (
      <>
        <div className="mb-4 h-8 animate-pulse rounded-lg bg-slate-200 lg:hidden" />
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="portal-sidebar p-4 text-xs text-white/50">Memuat menu…</div>
        </aside>
      </>
    );
  }

  const navGroups = getNavForRole(role);
  const flatNav = navGroups.flatMap((g) => g.items);

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {flatNav.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                active
                  ? "bg-brand-dark text-accent"
                  : "bg-white text-brand-dark ring-1 ring-slate-200",
              ].join(" ")}
            >
              {item.shortLabel || item.label}
            </Link>
          );
        })}
      </div>

      <aside className="hidden w-60 shrink-0 lg:block">
        <nav className="portal-sidebar sticky top-4">
          {navGroups.map((group) => (
            <div key={group.section}>
              <div className="portal-sidebar-section">{group.section}</div>
              <ul className="space-y-0.5 p-2">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={active ? "portal-nav-link portal-nav-link-active" : "portal-nav-link"}
                      >
                        <NavIcon name={item.icon} active={active} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
