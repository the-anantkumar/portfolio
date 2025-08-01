import { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, 'ref'> {
  children: ReactNode
  variant?: 'default' | 'highlighted' | 'interactive' | 'neon' | 'data' | 'tech'
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  glow?: 'none' | 'cyan' | 'purple' | 'pink' | 'green' | 'electric'
  border?: 'subtle' | 'visible' | 'glow' | 'none'
  scanLine?: boolean
  dataFlow?: boolean
  holographic?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    children,
    className = '',
    variant = 'default',
    blur = 'md',
    glow = 'none',
    border = 'subtle',
    scanLine = false,
    dataFlow = false,
    holographic = false,
    ...props
  },
  ref
) {
  // Base glass morphism styles
  const baseClasses = "relative overflow-hidden rounded-xl"
  
  // Variant styles
  const variantClasses = {
    default: 'glass-morphism',
    highlighted: 'glass-morphism-heavy',
    interactive: 'glass-morphism hover:glass-morphism-heavy transition-all duration-300 cursor-pointer',
    neon: 'bg-glass-heavy border-2 border-accent-cyan shadow-neon-cyan',
    data: 'bg-gradient-to-br from-glass-medium to-glass-light backdrop-blur-xl',
    tech: 'bg-gradient-to-br from-matte-carbon/50 to-matte-slate/30 backdrop-blur-2xl'
  }

  // Blur intensity
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl'
  }

  // Border styles
  const borderClasses = {
    none: '',
    subtle: 'border border-white/10',
    visible: 'border border-white/20',
    glow: 'border border-accent-cyan/50 shadow-tech-glow'
  }

  // Glow effects
  const glowClasses = {
    none: '',
    cyan: 'shadow-neon-cyan',
    purple: 'shadow-neon-purple', 
    pink: 'shadow-neon-pink',
    green: 'shadow-[0_0_20px_rgba(0,255,136,0.5)]',
    electric: 'shadow-[0_0_20px_rgba(0,212,255,0.5)]'
  }

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    blurClasses[blur],
    borderClasses[border],
    glowClasses[glow],
    holographic && 'holographic',
    className
  ].filter(Boolean).join(' ')

  return (
    <motion.div
      ref={ref}
      className={finalClasses}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] // Custom easing for tech feel
      }}
      whileHover={variant === 'interactive' ? {
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      } : undefined}
      {...props}
    >
      {/* Scan line effect */}
      {scanLine && (
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent scan-line" />
      )}

      {/* Data flow effect */}
      {dataFlow && (
        <div className="absolute bottom-0 left-0 w-full h-px data-flow" />
      )}

      {/* Inner glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />

      {/* Tech grid overlay for tech variant */}
      {variant === 'tech' && (
        <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
      )}

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accents for neon variant */}
      {variant === 'neon' && (
        <>
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-accent-cyan" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-accent-cyan" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-accent-cyan" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-accent-cyan" />
        </>
      )}

      {/* Additional tech elements for tech variant */}
      {variant === 'tech' && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-accent-electric rounded-full animate-pulse" />
      )}
    </motion.div>
  )
})

export default GlassCard

// Utility component for creating tech panels
export function TechPanel({ 
  title, 
  subtitle, 
  children, 
  icon,
  ...props 
}: {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: ReactNode
} & GlassCardProps) {
  return (
    <GlassCard variant="tech" scanLine dataFlow {...props}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-gradient-tech">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-400 font-mono mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-2xl text-accent-cyan">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </GlassCard>
  )
}

// Utility component for stat display
export function StatCard({ 
  label, 
  value, 
  trend, 
  icon,
  color = 'cyan'
}: {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  icon?: ReactNode
  color?: 'cyan' | 'purple' | 'green' | 'electric'
}) {
  const colorClasses = {
    cyan: 'text-accent-cyan border-accent-cyan/30',
    purple: 'text-accent-purple border-accent-purple/30',
    green: 'text-accent-green border-accent-green/30',
    electric: 'text-accent-electric border-accent-electric/30'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }

  return (
    <GlassCard 
      variant="interactive" 
      className={`border-2 ${colorClasses[color]}`}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 30px rgba(0, 255, 255, 0.3)` 
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {icon && (
            <span className={`text-lg ${colorClasses[color].split(' ')[0]}`}>
              {icon}
            </span>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <span className={`text-2xl font-bold font-display ${colorClasses[color].split(' ')[0]}`}>
            {value}
          </span>
          {trend && (
            <span className={`text-sm ${colorClasses[color].split(' ')[0]} opacity-70`}>
              {trendIcons[trend]}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}