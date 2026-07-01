// Convert a hex color (#rrggbb) to an "r,g,b" string for use inside rgba().
export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r},${g},${b}`
}
