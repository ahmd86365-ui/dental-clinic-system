"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 30_000;

/**
 * Keeps a notification view fresh two ways at once: a Supabase Realtime
 * subscription for instant updates when available, and a polling interval as
 * a self-healing safety net regardless of whether Realtime is actually
 * delivering events (silently misconfigured, dropped connection, etc.). Both
 * paths just call `onRefresh` — whichever fires first wins.
 */
export function useNotificationRefresh(onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const interval = setInterval(() => onRefreshRef.current(), POLL_INTERVAL_MS);

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notification" },
        () => onRefreshRef.current()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);
}
