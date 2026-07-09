import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

// Конфигурация компонента в боковом меню Storybook
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // Автоматически генерирует документацию во вкладке Docs
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
}

// Состояние ghost
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    isLoading: false,
    children: 'Ghost',
  },
}