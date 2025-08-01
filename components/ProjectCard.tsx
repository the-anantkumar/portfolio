import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  title: string
  description: string
  imageSrc: string
  link?: string
}

export default function ProjectCard({ title, description, imageSrc, link }: Props) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.article
      className="relative rounded-lg p-4 shadow-lg bg-white group"
      aria-labelledby={title.replace(/\s+/g, '-') + '-title'}
      initial={false}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      <Image
        src={imageSrc}
        alt={title + ' screenshot'}
        width={600}
        height={400}
        className="mb-2 rounded"
      />
      <h3 id={title.replace(/\s+/g, '-') + '-title'} className="text-xl font-semibold font-heading mb-2">
        {title}
      </h3>
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
      >
        <p className="mb-2 text-gray-700">{description}</p>
        {link && (
          <a href={link} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
            View More
          </a>
        )}
      </motion.div>
      <motion.svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none text-accent"
        initial={{ opacity: 0, pathLength: 0 }}
        whileHover={{ opacity: 1, pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        aria-hidden="true"
      >
        <motion.rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="8"
          ry="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </motion.svg>
    </motion.article>
  )
}
