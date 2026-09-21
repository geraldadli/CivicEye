export function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Shortens free text to at most `max` characters, cutting on a word boundary.
export function truncateWords(text: string, max: number) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s,.;:!?-]+$/, '')}…`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
