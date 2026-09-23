"use client";

import { useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./useAuth";
import { usePolling } from "./usePolling";
import type { Notification } from "@/lib/types";

export function useNotifications(intervalMs = 8000) {
  const { session } = useAuth();
  const userId = session?.id || "";

  const { data, loading, reload } = usePolling(
    async () => {
      if (!userId) return [] as Notification[];
      const [items, unreadQuery] = await Promise.all([
        api.getNotifications({ userId }),
        api.getNotifications({ userId, isRead: false }),
      ]);
      const unreadIds = new Set(unreadQuery.filter((item) => !item.isRead).map((item) => item.id));
      return items
        .map((item) => ({ ...item, isRead: item.isRead && !unreadIds.has(item.id) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    intervalMs,
    [userId],
  );

  const items = data || [];
  const unread = useMemo(() => items.filter((item) => !item.isRead), [items]);

  async function markAllRead() {
    await Promise.all(unread.map((item) => api.updateNotification(item.id, { isRead: true })));
    await reload();
  }

  return { items, unread, loading, reload, markAllRead };
}
