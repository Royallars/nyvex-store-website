export type CartLine = { productId: string; quantity: number; unitCents: number };

export function calculateTotalCents(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + Math.max(0, line.quantity) * Math.max(0, line.unitCents), 0);
}
