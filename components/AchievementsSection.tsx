import { motion } from 'framer-motion'

export default function AchievementsSection() {
  return (
    <motion.section
      id="achievements"
      className="py-20 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h1 className="text-4xl font-bold font-heading mb-4">Achievements</h1>
      <ul className="list-disc list-inside text-left">
        <li>
          Global rank&nbsp;103 among 10k+ participants in a CodeChef Div&nbsp;2 contest.
        </li>
        <li>
          Keyboard player certified by Trinity College London with one of its highest rankings.
        </li>
      </ul>
    </motion.section>
  )
}
