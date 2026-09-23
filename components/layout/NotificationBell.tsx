"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";

export function NotificationBell() {
  const { items, unread, markAllRead } = useNotifications(8000);
  const [open, setOpen] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread.length) {
      await markAllRead();
    }
  }

  async function markOne(id: string) {
    await api.updateNotification(id, { isRead: true });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>
        {unread.length > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread.length}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-medium text-slate-800">Notifications</p>
            <Button type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : (
              items.slice(0, 12).map((item) => (
                <Link
                  key={item.id}
                  href={item.requestId ? notificationHref(item.requestId) : "#"}
                  onClick={() => {
                    if (!item.isRead) markOne(item.id);
                    setOpen(false);
                  }}
                  className={`block border-b border-slate-100 px-3 py-3 hover:bg-slate-50 ${item.isRead ? "" : "bg-teal-50/60"}`}
                >
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(item.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function notificationHref(requestId: string): string {
  if (typeof window === "undefined") return "/";
  const role = window.localStorage.getItem("car-session");
  try {
    const session = role ? JSON.parse(role) : null;
    if (session?.role === "admin") return `/admin/requests`;
    if (session?.role === "driver") return `/driver/trips/${requestId}`;
    return `/employee/requests/${requestId}`;
  } catch {
    return "/";
  }
}
