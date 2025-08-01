import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTerminalMode, setIsTerminalMode] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const socialLinks = [
    { 
      name: 'GitHub', 
      href: 'https://github.com/your-username', 
      icon: '⚡',
      description: 'CODE_REPOSITORY',
      status: 'ACTIVE'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com/in/your-profile', 
      icon: '🔗',
      description: 'PROFESSIONAL_NETWORK',
      status: 'ONLINE'
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com/your-handle', 
      icon: '📡',
      description: 'SOCIAL_BROADCAST',
      status: 'STREAMING'
    },
    { 
      name: 'Email', 
      href: 'mailto:your-email@example.com', 
      icon: '📧',
      description: 'DIRECT_COMM',
      status: 'READY'
    },
  ]

  const techSpecs = [
    { label: 'UPTIME', value: '99.9%' },
    { label: 'LATENCY', value: '<50ms' },
    { label: 'BUILDS', value: '1.2K+' },
    { label: 'COMMITS', value: 'DAILY' }
  ]

  return (
    <motion.footer 
      className="relative mt-20 bg-gradient-to-t from-matte-black via-matte-charcoal to-matte-carbon border-t border-accent-cyan/20 overflow-hidden" 
      role="contentinfo"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Tech Grid Background */}
      <div className="absolute inset-0 tech-grid opacity-10" />
      
      {/* Scan Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-purple to-transparent" />
      
      {/* Data Flow Animation */}
      <div className="absolute top-1/2 left-0 w-full h-px data-flow" />

      <div className="relative container mx-auto px-4 py-16">
        
        {/* Terminal Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="glass-morphism-heavy rounded-2xl p-6 border border-accent-cyan/30 relative overflow-hidden">
            {/* Terminal UI */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-mono text-gray-400 ml-4">
                  anant@portfolio:~$ status --all
                </span>
              </div>
              
              <button
                onClick={() => setIsTerminalMode(!isTerminalMode)}
                className="px-3 py-1 text-xs font-mono bg-accent-cyan/20 text-accent-cyan rounded border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors"
              >
                {isTerminalMode ? 'GUI_MODE' : 'TERMINAL_MODE'}
              </button>
            </div>

            <motion.div 
              className="font-mono text-sm space-y-1"
              animate={isTerminalMode ? { opacity: 1 } : { opacity: 0.7 }}
            >
              <div className="text-accent-green">
                ✓ SYSTEM_STATUS: <span className="text-accent-cyan">OPERATIONAL</span>
              </div>
              <div className="text-accent-green">
                ✓ LAST_DEPLOY: <span className="text-gray-300">{currentTime.toISOString().split('T')[0]}</span>
              </div>
              <div className="text-accent-green">
                ✓ ACTIVE_CONNECTIONS: <span className="text-accent-electric">{socialLinks.length}</span>
              </div>
              <div className="text-accent-green">
                ✓ TIMESTAMP: <span className="text-gray-300">{currentTime.toLocaleTimeString()}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Brand & Mission */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Logo Area */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-electric p-1">
                  <div className="w-full h-full bg-matte-black rounded-lg flex items-center justify-center">
                    <span className="text-accent-cyan font-bold font-display text-xl">AKS</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-electric rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-gradient-tech">
                    ANANT KUMAR SRIVASTAVA
                  </div>
                  <div className="text-sm font-mono text-gray-400 tracking-wider">
                    SOFTWARE_ENGINEER.EXE
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 font-mono leading-relaxed">
                Building the future through{' '}
                <span className="text-accent-cyan">scalable systems</span>,{' '}
                <span className="text-accent-purple">elegant algorithms</span>, and{' '}
                <span className="text-accent-electric">progressive sounds</span>.
              </p>
            </div>

            {/* Tech Specs */}
            <div className="grid grid-cols-2 gap-3">
              {techSpecs.map((spec, index) => (
                <motion.div
                  key={spec.label}
                  className="glass-morphism rounded-lg p-3 border border-accent-cyan/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-xs font-mono text-gray-500 mb-1">{spec.label}</div>
                  <div className="text-sm font-bold text-accent-electric">{spec.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Connection Matrix */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-display font-bold text-gradient-tech mb-6">
              CONNECTION_MATRIX
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative glass-morphism rounded-xl p-4 border border-white/10 hover:border-accent-cyan/50 transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 30px rgba(0, 255, 255, 0.2)' 
                  }}
                >
                  {/* Status indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                      <span className="text-xs font-mono text-gray-500">{link.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-accent-cyan group-hover:text-accent-electric transition-colors">
                        {link.name.toUpperCase()}
                      </div>
                      <div className="text-xs font-mono text-gray-400">
                        {link.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover scan line */}
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* System Footer */}
        <motion.div 
          className="mt-16 pt-8 border-t border-white/10 space-y-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
        >
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400 font-mono">
                &copy; {new Date().getFullYear()} ANANT_KUMAR_SRIVASTAVA.SYS
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                ALL_RIGHTS_RESERVED // BUILT_WITH_❤️_AND_☕
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs font-mono text-gray-500">
              <span>BUILD_#{Math.floor(Math.random() * 1000)}</span>
              <span>•</span>
              <span>LAST_UPDATE: {currentTime.toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-accent-green">STATUS_OK</span>
            </div>
          </div>

          {/* Final Scan Line */}
          <motion.div 
            className="w-full h-px bg-gradient-to-r from-transparent via-accent-cyan via-accent-purple via-accent-electric to-transparent"
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 2, delay: 1.4 }}
            viewport={{ once: true }}
          />
        </motion.div>

        {/* Floating Tech Elements */}
        <div className="absolute top-10 right-10 opacity-20">
          <motion.div
            className="w-8 h-8 border border-accent-cyan rounded rotate-45"
            animate={{ rotate: 405 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="absolute bottom-10 left-10 opacity-30">
          <motion.div
            className="w-6 h-6 border border-accent-purple"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </motion.footer>
  )
}