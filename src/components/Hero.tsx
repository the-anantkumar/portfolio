import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [audioContext, setAudioContext] = useState(null)
  const canvasRef = useRef(null)
  const controls = useAnimation()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  // Audio visualization effect (static for demo)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 80

    let animationId
    let time = 0

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Create circular waveform
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)'
      ctx.lineWidth = 2
      
      for (let i = 0; i < 360; i += 2) {
        const angle = (i * Math.PI) / 180
        const wave = Math.sin(time * 0.01 + i * 0.1) * 15
        const x = centerX + Math.cos(angle) * (radius + wave)
        const y = centerY + Math.sin(angle) * (radius + wave)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.stroke()
      
      // Inner frequency rings
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 - ring * 0.1})`
        ctx.lineWidth = 1
        
        for (let i = 0; i < 360; i += 5) {
          const angle = (i * Math.PI) / 180
          const wave = Math.sin(time * 0.02 + i * 0.2 + ring) * (10 - ring * 2)
          const r = radius - (ring + 1) * 20
          const x = centerX + Math.cos(angle) * (r + wave)
          const y = centerY + Math.sin(angle) * (r + wave)
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()
      }
      
      time += 1
      animationId = requestAnimationFrame(drawWaveform)
    }

    drawWaveform()
    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleCTAClick = (href) => {
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-matte-black via-matte-charcoal to-matte-carbon">
        <div className="absolute inset-0 holographic opacity-30" />
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Geometric Elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 border border-accent-cyan opacity-20"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: 'linear-gradient(45deg, transparent 48%, rgba(0,255,255,0.1) 50%, transparent 52%)'
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 border border-accent-purple opacity-30"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center px-4 max-w-7xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Audio Visualizer */}
        <motion.div 
          className="absolute -top-32 left-1/2 transform -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <canvas 
            ref={canvasRef}
            width="200"
            height="200"
            className="opacity-60"
          />
        </motion.div>

        {/* Main Title with Glass Morphism */}
        <motion.div 
          className="relative glass-morphism-heavy rounded-2xl p-8 mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Scan line effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-cyan to-transparent scan-line" />
          
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-6 text-gradient-tech"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            ANANT KUMAR
          </motion.h1>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 neon-text-purple"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            SRIVASTAVA
          </motion.h2>
          
          <motion.div 
            className="w-32 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: '8rem' }}
            transition={{ duration: 1, delay: 1 }}
          />
          
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-heading leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Software Engineer <span className="neon-text-cyan">•</span> Data Architect <span className="neon-text-purple">•</span> Musician
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 mt-4 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            Crafting <span className="text-accent-electric">scalable systems</span> and{' '}
            <span className="text-accent-green">exceptional experiences</span>
          </motion.p>
        </motion.div>

        {/* Tech Stack Indicators */}
        <motion.div 
          className="flex justify-center space-x-8 mb-8 font-mono text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          {['REACT', 'PYTHON', 'AWS', 'KUBERNETES'].map((tech, index) => (
            <motion.span
              key={tech}
              className="relative"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            >
              {tech}
              <div className="absolute -bottom-1 left-0 w-full h-px bg-accent-cyan opacity-30" />
            </motion.span>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.button
            onClick={() => handleCTAClick('#projects')}
            className="group relative px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-electric text-matte-black font-bold font-heading rounded-lg overflow-hidden shadow-neon-cyan"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>VIEW PROJECTS</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-accent-electric to-accent-cyan"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            onClick={() => handleCTAClick('#contact')}
            className="group relative px-8 py-4 border-2 border-accent-purple text-accent-purple font-bold font-heading rounded-lg backdrop-blur-sm hover:bg-accent-purple hover:text-matte-black transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">CONNECT</span>
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <div className="relative">
            <div className="w-6 h-10 border-2 border-accent-cyan rounded-full flex justify-center">
              <motion.div 
                className="w-1 h-3 bg-accent-cyan rounded-full mt-2"
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono">SCROLL</p>
          </div>
        </motion.div>
      </div>

      {/* Data flow effect at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 data-flow" />
    </section>
  )
}