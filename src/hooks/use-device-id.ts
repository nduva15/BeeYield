import { useEffect, useState } from "react";

const STORAGE_KEY = "beeyield-device-id";

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Stable per-browser identifier. Empty during SSR / first render, then filled
 * in after hydration so the markup matches on both sides.
 */
export function useDeviceId(): string {
  const [id, setId] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setId(existing);
      return;
    }
    const newId = generateId();
    localStorage.setItem(STORAGE_KEY, newId);
    setId(newId);
  }, []);

  return id;
}
