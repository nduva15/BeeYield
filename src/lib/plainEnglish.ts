export const PLAIN_ENGLISH = {
  casing: {
    heading: 'Title Case',
    helperText: 'Sentence case',
  },
  bannedJargon: [
    'kernel',
    'telemetry',
    'registry',
    'protocol',
    'synthesis',
    'dossier',
    'vector',
    'orbital',
    'neural',
    'nominal',
  ],
  tokenPatterns: ['ALL_CAPS_WITH_UNDERSCORES', 'NODE_*', 'KEY_LIKE_LABELS'],
} as const;

const ACRONYM_RE = /^[A-Z0-9]{1,4}$/;

export function humanizeKeyLabel(input?: string) {
  const label = (input || '').trim();
  if (!label) return '';

  const looksLikeKey =
    label.includes('_') || (/^[A-Z0-9\s-]+$/.test(label) && label.toUpperCase() === label);
  if (!looksLikeKey) return label;

  const words = label
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      if (ACRONYM_RE.test(w)) return w;
      const lower = w.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

  return words.join(' ');
}

export function sentenceCase(input?: string) {
  const s = (input || '').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

