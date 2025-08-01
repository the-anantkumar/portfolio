// pages/index.tsx
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Hero from '../components/Hero'

// Dynamically import client‐only sections
const AboutSection       = dynamic(() => import('../components/AboutSection'),       { ssr: false })
const ProjectsSection    = dynamic(() => import('../components/ProjectsSection'),    { ssr: false })
const ExperienceSection  = dynamic(() => import('../components/ExperienceSection'),  { ssr: false })
const SkillsSection      = dynamic(() => import('../components/SkillsSection'),      { ssr: false })
const AchievementsSection= dynamic(() => import('../components/AchievementsSection'),{ ssr: false })
const ContactSection     = dynamic(() => import('../components/ContactSection'),     { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>Home – Portfolio</title>
        <meta name="description" content="Personal portfolio homepage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* This is pure SSR‐safe */}
      <Hero />

      {/* These load on the client only—no SSR, no hydration mismatch */}
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <AchievementsSection />
      <ContactSection />
    </>
  )
}
