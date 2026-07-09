import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'
import { expect, within } from 'storybook/test'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    src: { control: 'text' },
    email: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

// Аватар без картинки (показывает инициалы)
export const Initials: Story = {
  args: {
    email: 'Danis@mail.ru',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('D')).toBeVisible()
  },
}

// Аватар с картинкой (абсолютная ссылка, например из Telegram)
export const WithImage: Story = {
  args: {
    email: 'Danis@mail.ru',
    src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    size: 'lg',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const img = canvas.getByAltText('Аватар Danis@mail.ru')
    
    await expect(img).toBeVisible()
  },
}
