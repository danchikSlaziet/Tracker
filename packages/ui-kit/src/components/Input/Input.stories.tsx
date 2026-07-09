import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Поле ввода',
    error: 'Это обязательное поле',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Заблокированное поле',
    disabled: true,
  },
}