"use client";

import { useEffect, useState } from "react";

export function ConditionalHeader({ children }: { children: React.ReactNode }) {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  if (embedded) return null;
  return <>{children}</>;
}
