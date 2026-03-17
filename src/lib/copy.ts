export const BANNED_JARGON_WORDS = [
  'kernel',
  'telemetry',
  'registry',
  'protocol',
  'synthesis',
  'nominal',
  'orbital',
  'neural',
  'dossier',
  'vector',
] as const;

export function humanizeToken(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';
  // Only humanize obvious tokens like FOO_BAR or NODE_123.
  const looksLikeToken = /^[A-Z0-9]+(?:_[A-Z0-9]+)+$/.test(raw);
  if (!looksLikeToken) return raw;

  const words = raw
    .split('_')
    .filter(Boolean)
    .map((w) => w.toLowerCase());

  // Title-case words, keep common acronyms as-is
  return words
    .map((w) => {
      if (w === 'ai') return 'AI';
      if (w === 'qr') return 'QR';
      if (w === 'api') return 'API';
      if (w === 'gps') return 'GPS';
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export function sentenceCase(input: string): string {
  const s = (input || '').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

