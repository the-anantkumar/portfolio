import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SkillsSection() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true })

  const skillCategories = [
    { id: 'all', label: 'ALL_SYSTEMS', icon: '🌐', color: 'accent-cyan' },
    { id: 'languages', label: 'LANGUAGES', icon: '⚡', color: 'accent-electric' },
    { id: 'cloud', label: 'CLOUD_INFRA', icon: '☁️', color: 'accent-purple' },
    { id: 'data', label: 'DATA_SYSTEMS', icon: '🗄️', color: 'accent-green' },
    { id: 'tools', label: 'DEV_TOOLS', icon: '🔧', color: 'accent-pink' }
  ]

  const skills = [
    // Languages
    { name: 'Python', level: 95, category: 'languages', experience: '5+ years', projects: 25, icon: '🐍' },
    { name: 'JavaScript', level: 90, category: 'languages', experience: '4+ years', projects: 20, icon: '⚡' },
    { name: 'Java', level: 85, category: 'languages', experience: '3+ years', projects: 15, icon: '☕' },
    { name: 'C++', level: 80, category: 'languages', experience: '4+ years', projects: 12, icon: '⚙️' },
    { name: 'SQL', level: 88, category: 'languages', experience: '4+ years', projects: 18, icon: '🗃️' },
    { name: 'Bash', level: 75, category: 'languages', experience: '3+ years', projects: 10, icon: '💻' },

    // Cloud & Infrastructure  
    { name: 'AWS', level: 90, category: 'cloud', experience: '3+ years', projects: 15, icon: '☁️' },
    { name: 'Kubernetes', level: 85, category: 'cloud', experience: '2+ years', projects: 8, icon: '🎡' },
    { name: 'Docker', level: 88, category: 'cloud', experience: '3+ years', projects: 20, icon: '🐳' },
    { name: 'Google Cloud', level: 75, category: 'cloud', experience: '2+ years', projects: 6, icon: '🌤️' },
    { name: 'Terraform', level: 80, category: 'cloud', experience: '2+ years', projects: 5, icon: '🏗️' },

    // Data Systems
    { name: 'Apache Airflow', level: 85, category: 'data', experience: '2+ years', projects: 8, icon: '🌪️' },
    { name: 'Redis', level: 82, category: 'data', experience: '2+ years', projects: 12, icon: '🔥' },
    { name: 'PostgreSQL', level: 88, category: 'data', experience: '3+ years', projects: 15, icon: '🐘' },
    { name: 'Spark', level: 78, category: 'data', experience: '1+ years', projects: 4, icon: '⚡' },
    { name: 'Presto', level: 75, category: 'data', experience: '1+ years', projects: 3, icon: '🎯' },

    // Tools & Others
    { name: 'Git', level: 92, category: 'tools', experience: '5+ years', projects: 30, icon: '🌳' },
    { name: 'Node.js', level: 85, category: 'tools', experience: '3+ years', projects: 15, icon: '🟢' },
    { name: 'Grafana', level: 80, category: 'tools', experience: '2+ years', projects: 6, icon: '📊' },
    { name: 'Maven', level: 75, category: 'tools', experience: '2+ years', projects: 8, icon: '📦' },
    { name: 'Linux', level: 88, category: 'tools', experience: '4+ years', projects: 25, icon: '🐧' },
    { name: 'CI/CD', level: 82, category: 'tools', experience: '2+ years', projects: 10, icon: '🔄' }
  ]

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory)

  const getSkillColor = (level: number) => {
    if (level >= 90) return 'accent-green'
    if (level >= 80) return 'accent-cyan'
    if (level >= 70) return 'accent-electric'
    return 'accent-purple'
  }

  const getExpertiseLevel = (level: number) => {
    if (level >= 90) return 'EXPERT'
    if (level >= 80) return 'ADVANCED'
    if (level >= 70) return 'PROFICIENT'
    return 'INTERMEDIATE'
  }

  return (
    <section 
      ref={sectionRef}
      id="skills" 
      className="py-20 relative overflow-hidden"
    >
      {/* Background Tech Effects */}
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
            TECH_MATRIX
          </h2>
          <motion.div
            className="w-32 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: '8rem' } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-300 font-mono">
            Mapping the digital landscape through{' '}
            <span className="text-accent-cyan">code</span>,{' '}
            <span className="text-accent-purple">cloud</span>, and{' '}
            <span className="text-accent-electric">creativity</span>
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {skillCategories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-mono font-bold transition-all duration-300 border-2 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r from-${category.color}/20 to-${category.color}/10 border-${category.color} text-${category.color} shadow-neon-cyan`
                  : 'border-white/20 text-gray-400 hover:text-white hover:border-white/40 glass-morphism'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          layout
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              className="group relative glass-morphism-heavy rounded-2xl p-6 border border-white/10 hover:border-accent-cyan/50 transition-all duration-500 cursor-pointer"
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0, 255, 255, 0.1)' 
              }}
              onHoverStart={() => setHoveredSkill(skill.name)}
              onHoverEnd={() => setHoveredSkill(null)}
            >
              {/* Skill Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white group-hover:text-accent-cyan transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-500">
                      {skill.experience}
                    </p>
                  </div>
                </div>
                
                {/* Expertise Badge */}
                <div className={`px-2 py-1 rounded text-xs font-mono font-bold bg-${getSkillColor(skill.level)}/20 text-${getSkillColor(skill.level)}`}>
                  {getExpertiseLevel(skill.level)}
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={`rgb(var(--${getSkillColor(skill.level)}))`}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={isInView ? { 
                      strokeDashoffset: 2 * Math.PI * 40 * (1 - skill.level / 100) 
                    } : {}}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                    className={`drop-shadow-[0_0_8px_rgb(var(--${getSkillColor(skill.level)}))]`}
                  />
                </svg>
                
                {/* Percentage in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span 
                    className={`text-lg font-bold font-display text-${getSkillColor(skill.level)}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    {skill.level}%
                  </motion.span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center space-y-2">
                <div className="flex justify-center space-x-4 text-sm font-mono">
                  <div>
                    <span className="text-gray-500">PROJECTS:</span>
                    <span className="text-accent-electric ml-1 font-bold">{skill.projects}</span>
                  </div>
                </div>
              </div>

              {/* Hover Details */}
              {hoveredSkill === skill.name && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-matte-black/90 to-matte-carbon/90 backdrop-blur-md rounded-2xl p-6 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center space-y-3">
                    <div className="text-3xl">{skill.icon}</div>
                    <h4 className="font-display font-bold text-accent-cyan text-xl">
                      {skill.name}
                    </h4>
                    <div className="space-y-1 text-sm font-mono">
                      <p><span className="text-gray-500">Experience:</span> <span className="text-white">{skill.experience}</span></p>
                      <p><span className="text-gray-500">Projects:</span> <span className="text-accent-electric">{skill.projects}</span></p>
                      <p><span className="text-gray-500">Proficiency:</span> <span className={`text-${getSkillColor(skill.level)}`}>{skill.level}%</span></p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scan line effect */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-accent-electric opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-accent-green opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="mt-16 glass-morphism-heavy rounded-2xl p-8 border border-accent-cyan/20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold font-display text-accent-cyan mb-2">
                {skills.length}+
              </div>
              <div className="text-sm font-mono text-gray-400">TECHNOLOGIES</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display text-accent-electric mb-2">
                {skills.reduce((sum, skill) => sum + skill.projects, 0)}+
              </div>
              <div className="text-sm font-mono text-gray-400">PROJECTS</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display text-accent-purple mb-2">
                {Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length)}%
              </div>
              <div className="text-sm font-mono text-gray-400">AVG PROFICIENCY</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display text-accent-green mb-2">
                5+
              </div>
              <div className="text-sm font-mono text-gray-400">YEARS CODING</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-10 opacity-20">
        <motion.div
          className="w-8 h-8 border border-accent-cyan rounded"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </section>
  )
}