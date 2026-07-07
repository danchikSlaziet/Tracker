import type { TelegramAuthData } from '@finance/shared-types'
import { useEffect, useRef } from 'react'

interface TelegramLoginButtonProps {
  onAuth: (user: TelegramAuthData) => void
}

export function TelegramLoginButton({ onAuth }: TelegramLoginButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (window as any).TelegramLoginWidgetCallback = (user: TelegramAuthData) => {
      onAuth(user)
    }

    const script = document.createElement('script')
    script.setAttribute('src', 'https://telegram.org/js/telegram-widget.js?22')
    script.setAttribute('async', 'true')
    script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'TelegramLoginWidgetCallback')

    ref.current?.appendChild(script)

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ''
      }
      delete (window as any).TelegramLoginWidgetCallback
    }
  }, [])

  return <div ref={ref} />
}