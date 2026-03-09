/** Formats a number as Colombian Peso: $ 1.580.000 */
export function formatCOP(amount: number): string {
  const rounded = Math.round(amount)
  return `$ ${rounded.toLocaleString('es-CO')}`
}
