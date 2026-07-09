import type { Meta, StoryObj } from '@storybook/react'
import { PageLoader } from './PageLoader'

const meta: Meta<typeof PageLoader> = {
  title: 'Components/PageLoader',
  component: PageLoader,
}

export default meta
type Story = StoryObj<typeof PageLoader>

export const Default: Story = {}