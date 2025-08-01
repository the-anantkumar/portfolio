import { useEffect, useRef } from 'react'

export function useParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return

    const handleScroll = () => {
      const offset = window.scrollY * 0.1
      if (ref.current) {
        ref.current.style.transform = `translateY(${offset}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [enabled])

  return ref
}
