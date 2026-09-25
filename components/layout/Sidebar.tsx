"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";

export function Sidebar({
  items,
  open,
  onNavigate,
}: {
  items: NavItem[];
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[248px] shrink-0 transform flex-col border-r border-slate-200 bg-white text-slate-700 transition-transform lg:sticky lg:bottom-auto lg:top-0 lg:self-start lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="px-5 pb-4 pt-6">
        <Link href="/" className="block">
          <span className="block text-[15px] font-bold tracking-tight text-neutral-950">EmpFleet</span>
          <span className="mt-0.5 block text-[11px] text-slate-400">Company car booking</span>
        </Link>
      </div>
      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {items.map((item) => {
          const active = isActive(pathname, item.href, items);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-neutral-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function isActive(pathname: string, href: string, items: NavItem[]) {
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (!matches.some((item) => item.href === href)) return false;
  const best = matches.reduce((longest, item) =>
    item.href.length > longest.href.length ? item : longest,
  );
  return best.href === href;
}

function NavIcon({ href }: { href: string }) {
  const common = "h-[18px] w-[18px] shrink-0";
  switch (href) {
    case "/admin/dashboard":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "/admin/requests":
    case "/employee/requests":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h11M8 12h11M8 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
        </svg>
      );
    case "/admin/calendar":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "/admin/map":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    case "/admin/cars":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5 5.2 8.4A2 2 0 0 1 7.1 7h9.8a2 2 0 0 1 1.9 1.4L21 13.5M5 17h.01M19 17h.01M4 13.5h16v3.2A1.3 1.3 0 0 1 18.7 18H5.3A1.3 1.3 0 0 1 4 16.7v-3.2Z" />
        </svg>
      );
    case "/admin/drivers":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-1.2A3.8 3.8 0 0 0 12.2 14H7.8A3.8 3.8 0 0 0 4 17.8V19" />
          <circle cx="10" cy="8" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 19v-1.1A3.2 3.2 0 0 0 17.4 15M16.2 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "/admin/registrations":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19v-1.2A3.8 3.8 0 0 0 11.2 14H6.8A3.8 3.8 0 0 0 3 17.8V19" />
          <circle cx="9" cy="8" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 8v6M16 11h6" />
        </svg>
      );
    case "/employee/requests/new":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      );
    case "/driver/trips":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 8.2 8h7.6L20 16.5M7 18.5h.01M17 18.5h.01M5 16.5h14" />
        </svg>
      );
    default:
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      );
  }
}
