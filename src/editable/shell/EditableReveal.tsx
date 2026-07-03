'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function EditableReveal({ children, className = '', index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-mounted={mounted ? 'true' : 'false'}
      className={`editable-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {children}
    </div>
  )
}
