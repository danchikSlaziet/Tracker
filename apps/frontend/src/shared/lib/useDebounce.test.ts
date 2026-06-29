import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

// Управляем фейковыми таймерами (чтобы не ждать реальные 500мс в тестах)
vi.useFakeTimers()

describe('Хук useDebounce', () => {
  it('должен возвращать то же самое значение при первом рендере', () => {
    const { result } = renderHook(() => useDebounce('Привет', 500))
    expect(result.current).toBe('Привет')
  })

  it('должен обновить значение только после истечения задержки', () => {

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'Начало' } }
    )

    // меняем пропс и перерисовываем хук
    rerender({ value: 'Конец' })

    // задержка еще не прошла
    expect(result.current).toBe('Начало')

    // проматываем время 
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('Конец')
  })
})