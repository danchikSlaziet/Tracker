export function formatMoney(amountInKopecks: number): string {
  return (amountInKopecks / 100).toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  })
}