import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hero from './components/Hero'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import ExperienceSection from './components/ExperienceSection'
import SkillsSection from './components/SkillsSection'
import AchievementsSection from './components/AchievementsSection'
import ContactSection from './components/ContactSection'
import Navbar from './components/Navbar'
import Footer from './components/Footer'


import React, { useState } from 'react';

function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Navbar theme={theme} onToggleTheme={handleToggleTheme} />
      <Hero />
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <AchievementsSection />
      <ContactSection />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}
