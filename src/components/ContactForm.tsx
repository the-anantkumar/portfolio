import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  idPrefix?: string
  className?: string
}

export default function ContactForm({ idPrefix = 'contact', className = '' }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    message: ''
  })
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'CONTACT_SYSTEM_v2.1.0 INITIALIZED...',
    'ENCRYPTION_PROTOCOLS: ACTIVE',
    'READY_FOR_INPUT >'
  ])
  
  const formRef = useRef<HTMLFormElement>(null)

  // Simulate terminal typing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalLines(prev => [...prev, 'AWAITING_TRANSMISSION...'])
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Add terminal feedback
    if (value.length > 0 && !terminalLines.includes(`${field.toUpperCase()}_FIELD: ACTIVE`)) {
      setTerminalLines(prev => [...prev, `${field.toUpperCase()}_FIELD: ACTIVE`])
    }
  }

  const validateForm = () => {
    const errors = []
    if (!formData.name.trim()) errors.push('NAME_REQUIRED')
    if (!formData.email.includes('@')) errors.push('INVALID_EMAIL_FORMAT')
    if (formData.message.length < 10) errors.push('MESSAGE_TOO_SHORT')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Terminal feedback
    setTerminalLines(prev => [...prev, 'VALIDATING_INPUT...'])
    
    const errors = validateForm()
    if (errors.length > 0) {
      setStatus(`VALIDATION_ERROR: ${errors.join(', ')}`)
      setTerminalLines(prev => [...prev, `ERROR: ${errors[0]}`, 'TRANSMISSION_FAILED'])
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTerminalLines(prev => [...prev, 'ESTABLISHING_CONNECTION...', 'ENCRYPTING_PAYLOAD...', 'TRANSMITTING...'])
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStatus('MESSAGE_TRANSMITTED_SUCCESSFULLY')
      setTerminalLines(prev => [...prev, 'TRANSMISSION_COMPLETE', 'CONNECTION_TERMINATED', 'READY_FOR_NEW_TRANSMISSION >'])
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus('TRANSMISSION_FAILED: CONNECTION_TIMEOUT')
      setTerminalLines(prev => [...prev, 'ERROR: CONNECTION_TIMEOUT', 'RETRY_RECOMMENDED'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Terminal Output */}
      <motion.div
        className="glass-morphism-heavy rounded-2xl p-6 border border-accent-cyan/30 font-mono text-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-400 ml-4">contact_terminal.exe</span>
          </div>
          <div className="text-xs text-gray-500">
            STATUS: {isSubmitting ? 'TRANSMITTING' : 'READY'}
          </div>
        </div>

        {/* Terminal Content */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          <AnimatePresence>
            {terminalLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${
                  line.includes('ERROR') ? 'text-red-400' :
                  line.includes('SUCCESS') || line.includes('COMPLETE') ? 'text-accent-green' :
                  line.includes('ACTIVE') || line.includes('READY') ? 'text-accent-cyan' :
                  'text-gray-300'
                }`}
              >
                {line.includes('>') ? (
                  <span className="flex items-center">
                    {line}
                    <motion.span
                      className="ml-1 w-2 h-4 bg-accent-cyan"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </span>
                ) : line}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        
        {/* Name Field */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <label 
            className="block text-sm font-mono text-gray-300 mb-2 tracking-wider"
            htmlFor={`${idPrefix}-name`}
          >
            IDENTITY_MODULE
          </label>
          <div className="relative">
            <input
              id={`${idPrefix}-name`}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className="w-full p-4 bg-matte-carbon/50 border-2 border-white/10 rounded-xl backdrop-blur-md text-white placeholder-gray-500 font-mono focus:outline-none focus:border-accent-cyan focus:shadow-neon-cyan transition-all duration-300"
              placeholder="ENTER_YOUR_NAME"
              required
            />
            
            {/* Field Status Indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {formData.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-accent-green rounded-full"
                />
              )}
            </div>

            {/* Focus Animation */}
            {focusedField === 'name' && (
              <motion.div
                className="absolute inset-0 border-2 border-accent-cyan rounded-xl pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        {/* Email Field */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label 
            className="block text-sm font-mono text-gray-300 mb-2 tracking-wider"
            htmlFor={`${idPrefix}-email`}
          >
            COMMUNICATION_PROTOCOL
          </label>
          <div className="relative">
            <input
              id={`${idPrefix}-email`}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="w-full p-4 bg-matte-carbon/50 border-2 border-white/10 rounded-xl backdrop-blur-md text-white placeholder-gray-500 font-mono focus:outline-none focus:border-accent-electric focus:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all duration-300"
              placeholder="YOUR.EMAIL@DOMAIN.COM"
              required
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {formData.email.includes('@') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-accent-electric rounded-full"
                />
              )}
            </div>

            {focusedField === 'email' && (
              <motion.div
                className="absolute inset-0 border-2 border-accent-electric rounded-xl pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        {/* Message Field */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <label 
            className="block text-sm font-mono text-gray-300 mb-2 tracking-wider"
            htmlFor={`${idPrefix}-message`}
          >
            MESSAGE_PAYLOAD
          </label>
          <div className="relative">
            <textarea
              id={`${idPrefix}-message`}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              rows={6}
              className="w-full p-4 bg-matte-carbon/50 border-2 border-white/10 rounded-xl backdrop-blur-md text-white placeholder-gray-500 font-mono focus:outline-none focus:border-accent-purple focus:shadow-neon-purple transition-all duration-300 resize-none"
              placeholder="COMPOSE_YOUR_MESSAGE_HERE..."
              required
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 text-xs font-mono text-gray-500">
              {formData.message.length}/1000
            </div>

            <div className="absolute top-3 right-3">
              {formData.message.length >= 10 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-accent-purple rounded-full"
                />
              )}
            </div>

            {focusedField === 'message' && (
              <motion.div
                className="absolute inset-0 border-2 border-accent-purple rounded-xl pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-electric text-matte-black font-bold font-display rounded-xl overflow-hidden shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!isSubmitting ? { 
            scale: 1.02,
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)'
          } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span className="relative z-10 flex items-center justify-center space-x-3">
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-matte-black border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>TRANSMITTING...</span>
              </>
            ) : (
              <>
                <span>INITIATE_TRANSMISSION</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⚡
                </motion.span>
              </>
            )}
          </span>
          
          {/* Button Glow Effect */}
          {!isSubmitting && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-accent-electric to-accent-cyan"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>
      </motion.form>

      {/* Status Display */}
      <AnimatePresence>
        {status && (
          <motion.div
            className={`p-4 rounded-xl border font-mono text-sm ${
              status.includes('SUCCESS') || status.includes('COMPLETE')
                ? 'bg-accent-green/20 border-accent-green text-accent-green'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span>{status}</span>
              <motion.button
                onClick={() => setStatus(null)}
                className="text-xs opacity-70 hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                DISMISS
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}