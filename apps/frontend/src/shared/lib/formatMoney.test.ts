import { describe, it, expect } from 'vitest'
import { formatMoney } from './formatMoney'

describe('Утилита formatMoney', () => {
  
  it('должна правильно форматировать копейки в рубли', () => {
    const amountInKopecks = 15050
    const result = formatMoney(amountInKopecks)
    
    const normalizedResult = result.replace(/\s/g, ' ') // убираем неразрывный пробел от toLocaleString
    expect(normalizedResult).toBe('151 ₽')
  })
  it('должна корректно обрабатывать 0', () => {
    const result = formatMoney(0)
    const normalizedResult = result.replace(/\s/g, ' ')
    expect(normalizedResult).toBe('0 ₽')
  })
})