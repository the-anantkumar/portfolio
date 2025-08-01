import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState('engineer')
  const [audioVisualization, setAudioVisualization] = useState(Array(20).fill(0))
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true })

  // Simulate audio visualization
  useEffect(() => {
    if (!isInView) return
    
    const interval = setInterval(() => {
      setAudioVisualization(prev => 
        prev.map(() => Math.random() * 100)
      )
    }, 150)

    return () => clearInterval(interval)
  }, [isInView])

  const tabs = [
    { 
      id: 'engineer', 
      label: 'SOFTWARE_ENGINEER', 
      icon: '⚡',
      color: 'accent-cyan'
    },
    { 
      id: 'musician', 
      label: 'MUSICIAN', 
      icon: '🎵',
      color: 'accent-purple'
    },
    { 
      id: 'innovator', 
      label: 'INNOVATOR', 
      icon: '🚀',
      color: 'accent-electric'
    }
  ]

  const skills = {
    engineer: [
      { name: 'Python', level: 95, category: 'BACKEND' },
      { name: 'JavaScript', level: 90, category: 'FRONTEND' },
      { name: 'AWS', level: 85, category: 'CLOUD' },
      { name: 'Kubernetes', level: 80, category: 'DEVOPS' },
      { name: 'Machine Learning', level: 75, category: 'AI/ML' },
      { name: 'PostgreSQL', level: 85, category: 'DATABASE' }
    ],
    musician: [
      { name: 'Piano', level: 90, category: 'KEYBOARD' },
      { name: 'Guitar', level: 75, category: 'STRING' },
      { name: 'Composition', level: 80, category: 'CREATION' },
      { name: 'Music Theory', level: 85, category: 'THEORY' },
      { name: 'Digital Audio', level: 70, category: 'PRODUCTION' },
      { name: 'Progressive Rock', level: 95, category: 'GENRE' }
    ],
    innovator: [
      { name: 'System Design', level: 90, category: 'ARCHITECTURE' },
      { name: 'Algorithm Design', level: 85, category: 'LOGIC' },
      { name: 'Research', level: 80, category: 'DISCOVERY' },
      { name: 'Problem Solving', level: 95, category: 'ANALYSIS' },
      { name: 'Innovation', level: 88, category: 'CREATIVITY' },
      { name: 'Leadership', level: 75, category: 'TEAM' }
    ]
  }

  const achievements = [
    {
      type: 'TECHNICAL',
      title: 'Global Rank #103',
      description: 'CodeChef Div 2 Contest (10K+ participants)',
      icon: '🏆',
      color: 'accent-green'
    },
    {
      type: 'MUSICAL', 
      title: 'Trinity College London',
      description: 'Keyboard certification with highest rankings',
      icon: '🎹',
      color: 'accent-purple'
    },
    {
      type: 'ACADEMIC',
      title: 'Dual Degree',
      description: 'B.E. Electronics + M.Sc. Mathematics (BITS Pilani)',
      icon: '🎓',
      color: 'accent-electric'
    }
  ]

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="py-20 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 tech-grid opacity-5" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />

      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-7xl font-display font-bold text-gradient-tech mb-6">
            ABOUT_ME.EXE
          </h2>
          <motion.div
            className="w-32 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent mx-auto"
            initial={{ width: 0 }}
            animate={isInView ? { width: '8rem' } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          
          {/* Profile Section */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            
            {/* Profile Image with Tech Frame */}
            <div className="relative w-80 h-80 mx-auto lg:mx-0">
              
              {/* Audio Visualization Ring */}
              <div className="absolute inset-0 rounded-full">
                {audioVisualization.map((height, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-1 bg-gradient-to-t from-accent-cyan to-accent-purple rounded-full"
                    style={{
                      height: `${Math.max(height * 0.4, 10)}px`,
                      left: `${50 + 45 * Math.cos(index * 18 * Math.PI / 180)}%`,
                      top: `${50 + 45 * Math.sin(index * 18 * Math.PI / 180)}%`,
                      transformOrigin: 'center bottom',
                      transform: `translate(-50%, -100%) rotate(${index * 18}deg)`
                    }}
                    animate={{ height: `${Math.max(height * 0.4, 10)}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
              
              {/* Main Profile Image */}
              <motion.div 
                className="relative w-64 h-64 mx-auto top-8 glass-morphism-heavy rounded-full overflow-hidden border-2 border-accent-cyan/30"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/images/profile.svg"
                  alt="Anant Kumar Srivastava"
                  className="w-full h-full object-cover"
                />
                
                {/* Holographic overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10 animate-pulse" />
              </motion.div>

              {/* Tech Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-accent-cyan" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-accent-electric" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-accent-purple" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent-green" />
            </div>

            {/* Bio Section */}
            <div className="space-y-6">
              <motion.div
                className="glass-morphism-heavy rounded-2xl p-6 border border-accent-cyan/20"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h3 className="text-xl font-display font-bold text-gradient-tech mb-4">
                  SYSTEM_PROFILE
                </h3>
                <p className="text-gray-300 font-mono leading-relaxed">
                  I'm <span className="text-accent-cyan font-bold">Anant Kumar Srivastava</span>, 
                  a software engineer with a B.E. in Electronics and Instrumentation and an M.Sc. 
                  in Mathematics from <span className="text-accent-electric">BITS Pilani</span> (2019–2024).
                </p>
                <p className="text-gray-300 font-mono leading-relaxed mt-4">
                  I create <span className="text-accent-purple">scalable data systems</span> by day 
                  and compose <span className="text-accent-green">progressive rock</span> by night, 
                  finding harmony between algorithmic precision and creative expression.
                </p>
              </motion.div>

              {/* Achievements Grid */}
              <div className="grid gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    className="glass-morphism rounded-xl p-4 border border-white/10 hover:border-accent-cyan/30 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-mono px-2 py-1 rounded bg-${achievement.color}/20 text-${achievement.color}`}>
                            {achievement.type}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-white">{achievement.title}</h4>
                        <p className="text-sm text-gray-400 font-mono">{achievement.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skills Matrix */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 p-2 glass-morphism rounded-xl border border-white/10">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}/20 to-${tab.color}/10 text-${tab.color} border border-${tab.color}/30`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Skills Display */}
            <motion.div
              className="glass-morphism-heavy rounded-2xl p-6 border border-accent-cyan/20 min-h-[400px]"
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-4">
                {skills[activeTab as keyof typeof skills].map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    className="space-y-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {/* Skill Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="font-display font-bold text-white">{skill.name}</span>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-accent-electric/20 text-accent-electric">
                          {skill.category}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-accent-cyan">
                        {skill.level}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-matte-carbon rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-electric rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                      
                      {/* Animated glow */}
                      <motion.div
                        className="absolute top-0 left-0 h-full w-4 bg-gradient-to-r from-transparent to-white/30 rounded-full"
                        initial={{ x: '-100%' }}
                        animate={{ x: `${skill.level * 4}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech Philosophy */}
            <motion.div
              className="glass-morphism rounded-xl p-4 border border-accent-purple/20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <p className="text-sm font-mono text-gray-300 leading-relaxed">
                "Like crafting a <span className="text-accent-purple">progressive rock symphony</span>, 
                building software requires complex rhythms, unexpected harmonies, 
                and <span className="text-accent-cyan">flawless execution</span>."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute top-20 right-20 opacity-20">
        <motion.div
          className="w-6 h-6 border border-accent-cyan rounded rotate-45"
          animate={{ rotate: 405, scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="absolute bottom-20 left-20 opacity-30">
        <motion.div
          className="w-4 h-4 border border-accent-purple"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  )
}