"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const EVENT = "app:navigate";

export function beginNavigation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function start() {
      setPending(true);
    }

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    }

    window.addEventListener(EVENT, start);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(EVENT, start);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timeout = window.setTimeout(() => setPending(false), 12000);
    return () => window.clearTimeout(timeout);
  }, [pending]);

  if (!pending) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-teal-100"
      role="progressbar"
      aria-label="Loading page"
    >
      <div className="nav-progress h-full bg-teal-600" />
    </div>
  );
}
