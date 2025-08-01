import { ReactNode } from 'react'
import { useParallax } from '../hooks/useParallax'
import { clsx } from 'clsx'
import Particles from 'react-tsparticles'

interface Props {
  children: ReactNode
  variant?: 'black-light' | 'black' | 'black-dark'
  effect?: 'parallax' | 'particles'
}

const particleConfig = {
  fullScreen: { enable: false },
  particles: {
    number: { value: 40 },
    size: { value: 2 },
    move: { speed: 0.2 },
    color: { value: '#ffffff' },
    opacity: { value: 0.2 },
  },
}

export default function Background({
  children,
  variant = 'black',
  effect,
}: Props) {
  const ref = useParallax(effect === 'parallax')

  return (
    <div
      ref={ref}
      className={clsx(
        'relative w-full min-h-screen bg-noise bg-cover overflow-hidden bg-matte',
        variant === 'black-light' && 'bg-black-light',
        variant === 'black' && 'bg-black',
        variant === 'black-dark' && 'bg-black-dark'
      )}
    >
      {effect === 'particles' && <Particles options={particleConfig} />}
      {children}
    </div>
  )
}
