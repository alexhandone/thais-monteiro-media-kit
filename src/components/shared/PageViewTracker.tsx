"use client";

import { useEffect } from "react";

export function PageViewTracker() {
  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;

    if (path.startsWith("/admin")) {
      return;
    }

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
