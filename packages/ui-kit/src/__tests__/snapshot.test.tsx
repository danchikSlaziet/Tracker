import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button, Input, Avatar, ThemeToggle, PageLoader } from '../index'

describe('DOM Snapshots', () => {
  describe('Button', () => {
    it('primary', () => {
      const { container } = render(<Button variant="primary">Нажми</Button>)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('loading', () => {
      const { container } = render(<Button isLoading>Нажми</Button>)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('disabled', () => {
      const { container } = render(<Button disabled>Нажми</Button>)
      expect(container.innerHTML).toMatchSnapshot()
    })
  })

  describe('Input', () => {
    it('default', () => {
      const { container } = render(<Input placeholder="Введите текст" />)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('with error', () => {
      const { container } = render(<Input error="Обязательное поле" />)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('with label', () => {
      const { container } = render(<Input label="Email" id="email" />)
      expect(container.innerHTML).toMatchSnapshot()
    })
  })

  describe('Avatar', () => {
    it('initials', () => {
      const { container } = render(<Avatar email="danis@mail.ru" />)
      expect(container.innerHTML).toMatchSnapshot()
    })
  })

  describe('ThemeToggle', () => {
    it('light', () => {
      const { container } = render(<ThemeToggle theme="light" onToggle={() => { }} />)
      expect(container.innerHTML).toMatchSnapshot()
    })

    it('dark', () => {
      const { container } = render(<ThemeToggle theme="dark" onToggle={() => { }} />)
      expect(container.innerHTML).toMatchSnapshot()
    })
  })

  describe('PageLoader', () => {
    it('default', () => {
      const { container } = render(<PageLoader />)
      expect(container.innerHTML).toMatchSnapshot()
    })
  })
})