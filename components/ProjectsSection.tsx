import { motion } from 'framer-motion'
import ProjectCard from './ProjectCard'

export default function ProjectsSection() {
  return (
    <motion.section
      id="projects"
      className="py-20 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h1 className="text-4xl font-bold font-heading mb-4">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <ProjectCard
          title="Codeforces POTD Extension"
          description="Chrome extension recommending daily Codeforces problems; 2500+ users with a 4.9★ rating."
          imageSrc="/images/project1.svg"
          link="#"
        />
        <ProjectCard
          title="Image Encryption App"
          description="Java Swing tool using chaotic logistic maps for fast image encryption."
          imageSrc="/images/project2.svg"
          link="#"
        />
      </div>
    </motion.section>
  )
}
