/**
 * Deterministic "random-like" helpers.
 *
 * These are pure functions (no Math.random/Date.now) so they can be used
 * during render without breaking React purity lint rules.
 */

export function hashToUint32(seed: string | number): number {
  const s = String(seed);
  // FNV-1a 32-bit
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Returns a stable number in [0, 1). */
export function hashToUnit(seed: string | number): number {
  // 2^32
  return hashToUint32(seed) / 4294967296;
}

export function hashToRange(seed: string | number, min: number, max: number): number {
  if (max <= min) return min;
  return min + (max - min) * hashToUnit(seed);
}

export function hashToInt(seed: string | number, min: number, max: number): number {
  return Math.floor(hashToRange(seed, min, max + 1));
}

