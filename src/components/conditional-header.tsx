"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => window.self !== window.top;
const getServerSnapshot = () => false;

export function ConditionalHeader({ children }: { children: React.ReactNode }) {
  const embedded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (embedded) return null;
  return <>{children}</>;
}
