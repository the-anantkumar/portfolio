import Head from 'next/head'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

export default function About() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <Head>
        <title>About - Portfolio</title>
        <meta
          name="description"
          content="Learn more about the person behind this portfolio."
        />
        <meta property="og:title" content="About - Portfolio" />
        <meta
          property="og:description"
          content="Learn more about the person behind this portfolio."
        />
        <meta property="og:image" content="/images/profile.svg" />
      </Head>
      <div className="grid gap-8 md:grid-cols-2 items-start">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            type: 'spring',
            bounce: shouldReduceMotion ? 0 : 0.4,
          }}
          className="relative w-52 h-52 mx-auto"
        >
          <Image
            src="/images/profile.svg"
            alt="Profile photo"
            width={200}
            height={200}
            className="rounded-full mb-4"
            unoptimized // Add this for SVG files
          />
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full pointer-events-none text-accent"
          >
            <motion.circle
              cx="100"
              cy="100"
              r="98"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 1 }}
            />
          </motion.svg>
        </motion.div>
        <div>
          <h1 className="text-4xl font-bold font-heading mb-4">About Me</h1>
          <p>
            I'm Anant Kumar Srivastava, a software engineer with a B.E. in
            Electronics and Instrumentation and an M.Sc. in Mathematics from BITS
            Pilani (2019–2024). I enjoy creating scalable data systems and simple
            user experiences.
          </p>
        </div>
      </div>
    </>
  )
}