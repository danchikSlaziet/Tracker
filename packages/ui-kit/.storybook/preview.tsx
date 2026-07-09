import type { Preview, Decorator } from '@storybook/react'
import { useEffect } from 'react'
import '../src/index.css'

// Декоратор, который будет следить за темой и вешать data-theme
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '24px',
      borderRadius: '8px',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <Story />
    </div>
  )
}


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
  decorators: [withTheme]
}

// иконка переключения темы в шапке Storybook
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Глобальная тема для компонентов',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Светлая тема', icon: 'circlehollow' },
        { value: 'dark', title: 'Темная тема', icon: 'circle' }
      ],
      showName: true,
    },
  },
}

export default preview
