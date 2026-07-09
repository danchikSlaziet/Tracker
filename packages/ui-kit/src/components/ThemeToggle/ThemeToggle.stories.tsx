import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'
import { fn, expect, userEvent, within } from 'storybook/test'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  args: {
    onToggle: fn(),
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark'],
    },
    onToggle: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const LightTheme: Story = {
  args: {
    theme: 'light',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Переключить тему' })

    await expect(button).toHaveTextContent('🌙')
    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Переключить тему' })

    await expect(button).toHaveTextContent('☀️')
    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}
