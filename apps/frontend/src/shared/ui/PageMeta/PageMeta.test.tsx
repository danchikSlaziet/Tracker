import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { PageMeta } from './PageMeta'

describe('PageMeta', () => {
  beforeEach(() => {
    document.title = ''
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.remove()
    }
  })

  it('renders title with app branding', () => {
    render(<PageMeta title="Дашборд" />)
    expect(document.title).toBe('Дашборд | Finance Tracker')
  })

  it('renders default title when no title passed', () => {
    render(<PageMeta />)
    expect(document.title).toBe('Finance Tracker — Учёт и аналитика финансов')
  })

  it('renders meta description tag', () => {
    render(<PageMeta title="Категории" description="Управление категориями" />)
    const meta = document.querySelector('meta[name="description"]')
    expect(meta?.getAttribute('content')).toBe('Управление категориями')
  })
})
