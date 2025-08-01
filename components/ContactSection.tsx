import { motion } from 'framer-motion'
import ContactForm from './ContactForm'

export default function ContactSection() {
  return (
    <motion.section
      id="contact"
      className="py-20 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h1 className="text-4xl font-bold font-heading mb-4">Contact</h1>
      <ContactForm idPrefix="home-contact" className="max-w-md space-y-4 mx-auto" />
    </motion.section>
  )
}
