import type { Meta, StoryObj } from '@storybook/react'
import { PageLoader } from './PageLoader'
import { expect, within } from 'storybook/test'

const meta: Meta<typeof PageLoader> = {
  title: 'Components/PageLoader',
  component: PageLoader,
}

export default meta
type Story = StoryObj<typeof PageLoader>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
  },
}