import { useState } from "react";

const STORAGE_KEY = "beeyield-device-id";

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useDeviceId(): string {
  const [id] = useState(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const newId = generateId();
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  });
  return id;
}
