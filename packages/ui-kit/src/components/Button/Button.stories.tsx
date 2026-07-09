import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { fn, expect, userEvent, within } from 'storybook/test'

// Конфигурация компонента в боковом меню Storybook
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // Автоматически генерирует документацию во вкладке Docs
  args: {
    onClick: fn(), // Мок-функция на уровне ВСЕХ историй этого компонента
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// Дефолтное состояние кнопки
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Нажми меня',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Нажми меня' })

    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

// Второстепенная кнопка
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Второстепенная кнопка',
  },
}

// Кнопка опасного действия
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Удалить что-то',
  },
}

// Состояние загрузки
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Загрузка',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    await expect(button).toHaveTextContent('Загрузка...')
    await expect(button).toBeDisabled()
    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

// Состояние ghost
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    isLoading: false,
    children: 'Ghost',
  },
}