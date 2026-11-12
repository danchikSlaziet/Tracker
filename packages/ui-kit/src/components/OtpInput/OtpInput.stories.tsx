import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from 'storybook/test'
import { OtpInput } from './OtpInput'

const meta: Meta<typeof OtpInput> = {
  title: 'Components/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  args: {
    onChange: () => { },
  },
  argTypes: {
    error: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof OtpInput>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return <OtpInput {...args} value={value} onChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Цифра 1'), '123456')
    await expect(canvas.getByLabelText('Цифра 1')).toHaveValue('1')
    await expect(canvas.getByLabelText('Цифра 6')).toHaveValue('6')
  },
}

export const WithError: Story = {
  args: {
    value: '123',
    error: 'Неверный код или он устарел',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Неверный код или он устарел')).toBeVisible()
  },
}

export const Disabled: Story = {
  args: {
    value: '123456',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText('Цифра 1')).toBeDisabled()
  },
}