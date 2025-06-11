import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import ProjectCard from '../components/ProjectCard'
import TimelineItem from '../components/TimelineItem'

export default function Home() {
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setStatus('Message sent!')
        form.reset()
      } else {
        const body = await res.json()
        setStatus(body.error || 'Something went wrong')
      }
    } catch (err) {
      setStatus('Failed to submit form')
    }
  }

  return (
    <>
      <Head>
        <title>Home - Portfolio</title>
        <meta name="description" content="Personal portfolio homepage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Hero />

      <motion.section
        id="about"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Image
          src="/images/profile.svg"
          alt="Profile photo"
          width={200}
          height={200}
          className="mx-auto rounded-full mb-4"
        />
        <h1 className="text-4xl font-bold mb-4">About Me</h1>
        <p>Write something about yourself here.</p>
      </motion.section>

      <motion.section
        id="projects"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <ProjectCard
            title="Project One"
            description="Description of project one."
            imageSrc="/images/project1.svg"
            link="#"
          />
          <ProjectCard
            title="Project Two"
            description="Description of project two."
            imageSrc="/images/project2.svg"
            link="#"
          />
        </div>
      </motion.section>

      <motion.section
        id="experience"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold mb-4">Experience</h1>
        <ul className="border-l-2 border-gray-300 ml-2">
          <TimelineItem title="Company A" subtitle="Role" date="2020 - Present">
            Brief description of your role at Company A.
          </TimelineItem>
          <TimelineItem title="Company B" subtitle="Role" date="2018 - 2020">
            Brief description of your role at Company B.
          </TimelineItem>
        </ul>
      </motion.section>

      <motion.section
        id="skills"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold mb-4">Skills</h1>
        <p>List your skills here.</p>
      </motion.section>

      <motion.section
        id="achievements"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold mb-4">Achievements</h1>
        <p>Share your achievements here.</p>
      </motion.section>

      <motion.section
        id="contact"
        className="py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4 mx-auto" aria-label="Contact form">
          <label className="block">
            <span className="sr-only">Name</span>
            <input className="w-full p-2 border" name="name" placeholder="Name" required />
          </label>
          <label className="block">
            <span className="sr-only">Email</span>
            <input className="w-full p-2 border" name="email" type="email" placeholder="Email" required />
          </label>
          <label className="block">
            <span className="sr-only">Message</span>
            <textarea className="w-full p-2 border" name="message" placeholder="Message" required />
          </label>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">Send</button>
        </form>
        {status && <p className="mt-4" role="status">{status}</p>}
      </motion.section>
    </>
  )
}
