import { useEffect } from 'react'

export interface PageMetaProps {
  title?: string
  description?: string
}

const BASE_TITLE = 'Finance Tracker'

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} — Учёт и аналитика финансов`

    let metaDesc = document.querySelector('meta[name="description"]')
    const prevDescription = metaDesc?.getAttribute('content') ?? ''

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (metaDesc && prevDescription) {
        metaDesc.setAttribute('content', prevDescription)
      }
    }
  }, [title, description])

  return null
}
