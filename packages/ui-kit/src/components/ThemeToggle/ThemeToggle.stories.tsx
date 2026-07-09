import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
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
}

export const DarkTheme: Story = {
  args: {
    theme: 'dark',
  },
}
