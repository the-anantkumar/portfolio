import { motion } from 'framer-motion'
import { FaGuitar } from 'react-icons/fa'
import { GiPianoKeys } from 'react-icons/gi'

export default function InstrumentShowcase() {
  const instruments = [
    { label: 'Piano', icon: <GiPianoKeys /> },
    { label: 'Guitar', icon: <FaGuitar /> },
  ]

  return (
    <section className="py-20">
      <h2 className="text-4xl font-heading text-center mb-8">Instruments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {instruments.map(({ label, icon }) => (
          <motion.div
            key={label}
            whileHover={{ y: -4, boxShadow: '0 5px 15px rgba(0,0,0,0.4)' }}
            className="backdrop-blur-md bg-glass-dark p-6 rounded-xl text-center"
          >
            <div className="text-5xl text-accent mb-2">{icon}</div>
            <p className="text-lg text-gray-200">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
