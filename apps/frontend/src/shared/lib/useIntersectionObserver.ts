import { useEffect, useRef } from 'react'

export const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries // за одним блоком следим
      if (entry.isIntersecting) {
        callback()
      }
    }, options)

    observer.observe(trigger)

    return () => {
      if (trigger) {
        observer.unobserve(trigger)
      }
    }
  }, [callback, options])

  return triggerRef
}