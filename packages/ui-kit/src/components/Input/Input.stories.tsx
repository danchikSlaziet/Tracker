import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { expect, userEvent, within } from 'storybook/test'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Введите текст...')
    
    await userEvent.type(input, 'Привет, мир!')
    await expect(input).toHaveValue('Привет, мир!')
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Поле ввода',
    error: 'Это обязательное поле',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Это обязательное поле')).toBeVisible()
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Заблокированное поле',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Заблокированное поле')

    await expect(input).toBeDisabled()
  },
}

// связь label и input через htmlFor
export const WithLabel: Story = {
  args: {
    label: 'Email',
    id: 'email-input',
    placeholder: 'user@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Email')

    await expect(input).toBeInTheDocument()
    await userEvent.type(input, 'test@mail.ru')
    await expect(input).toHaveValue('test@mail.ru')
  },
}
