import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: ReactNode
  variant?: 'default' | 'highlighted' | 'interactive'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  glow?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    children,
    className,
    variant = 'default',
    blur = 'md',
    border = true,
    glow = false,
    ...props
  },
  ref
) {
  const baseClasses = 'relative backdrop-blur-md rounded-xl overflow-hidden'

  const variantClasses = {
    default: 'bg-glass-light dark:bg-glass-dark',
    highlighted:
      'bg-gradient-to-br from-glass-light to-transparent dark:from-glass-dark dark:to-glass-darker',
    interactive:
      'bg-glass-light dark:bg-glass-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-all duration-300',
  }

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  const borderClasses = border ? 'border border-white/20 dark:border-white/10' : ''
  const glowClasses = glow ? 'shadow-glow' : 'shadow-glass'

  return (
    <motion.div
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        blurClasses[blur],
        borderClasses,
        glowClasses,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
})

export default GlassCard

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
