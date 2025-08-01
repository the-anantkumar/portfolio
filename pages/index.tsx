// pages/index.tsx
import Head from 'next/head'
import Hero from '../components/Hero'

import AboutSection from '../components/AboutSection'
import ProjectsSection from '../components/ProjectsSection'
import ExperienceSection from '../components/ExperienceSection'
import SkillsSection from '../components/SkillsSection'
import AchievementsSection from '../components/AchievementsSection'
import ContactSection from '../components/ContactSection'

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

      {/* Additional sections */}
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <AchievementsSection />
      <ContactSection />
    </>
  )
}
