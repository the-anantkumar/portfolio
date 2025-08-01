import { useState } from 'react'
import { motion } from 'framer-motion'

export async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>,
  setStatus: (status: string | null) => void
) {
  e.preventDefault()
  const form = e.currentTarget
  const data = {
    name: (form.elements.namedItem('name') as HTMLInputElement)?.value || '',
    email: (form.elements.namedItem('email') as HTMLInputElement)?.value || '',
    message: (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || '',
  }

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setStatus('Message sent! ✨')
      form.reset()
    } else {
      const body = await res.json()
      setStatus(body.error || 'Something went wrong')
    }
  } catch (err) {
    setStatus('Failed to submit form')
  }
}

interface Props {
  idPrefix?: string
  className?: string
}

export default function ContactForm({ idPrefix = 'contact', className = 'space-y-6' }: Props) {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, setStatus)} className={className} aria-label="Contact form">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <label className="block" htmlFor={`${idPrefix}-name`}>
            <span className="block text-sm font-medium text-gray-300 mb-2">Name</span>
            <input
              id={`${idPrefix}-name`}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
              name="name"
              placeholder="Your Name"
              required
            />
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <label className="block" htmlFor={`${idPrefix}-email`}>
            <span className="block text-sm font-medium text-gray-300 mb-2">Email</span>
            <input
              id={`${idPrefix}-email`}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
            />
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <label className="block" htmlFor={`${idPrefix}-message`}>
            <span className="block text-sm font-medium text-gray-300 mb-2">Message</span>
            <textarea
              id={`${idPrefix}-message`}
              className="w-full p-4 h-32 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 resize-none"
              name="message"
              placeholder="Tell me about your project or just say hello!"
              required
            />
          </label>
        </motion.div>

        <motion.button
          type="submit"
          className="group relative w-full px-8 py-4 bg-gradient-to-r from-accent to-primary-400 text-dark-900 font-semibold rounded-lg overflow-hidden shadow-lg hover:shadow-neon transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <span className="relative z-10 flex items-center justify-center space-x-2">
            <span>Send Message</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✈️
            </motion.span>
          </span>
          
          {/* Hover effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "0%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </form>

      {status && (
        <motion.div
          className="mt-6 p-4 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20"
          role="status"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-center text-accent font-medium">{status}</p>
        </motion.div>
      )}
    </>
  )
}