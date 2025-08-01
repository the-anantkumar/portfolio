
import { motion } from 'framer-motion'
import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
  imageSrc: string;
  link: string;
  technologies?: string[];
  status?: string;
  metrics?: {
    users?: string;
    rating?: string;
    github?: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, imageSrc, link, technologies, status = '', metrics }) => (
  <div className="glass-morphism-heavy rounded-2xl p-6 border border-accent-cyan/30">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-display font-bold text-gradient-tech">{title}</h3>
      {status && (
        <span className={`px-2 py-1 text-xs font-mono rounded ${
          status === 'live' ? 'bg-accent-green/20 text-accent-green' :
          status === 'development' ? 'bg-accent-electric/20 text-accent-electric' :
          'bg-accent-cyan/20 text-accent-cyan'
        }`}>
          {status.toUpperCase()}
        </span>
      )}
    </div>
    <p className="text-gray-300 mb-4 font-mono text-sm">{description}</p>
    {technologies && (
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech) => (
          <span key={tech} className="px-2 py-1 text-xs bg-matte-carbon rounded border border-accent-cyan/30 text-accent-cyan">
            {tech}
          </span>
        ))}
      </div>
    )}
    {metrics && (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {metrics.users && <div><div className="text-accent-electric font-bold">{metrics.users}</div><div className="text-gray-500">USERS</div></div>}
        {metrics.rating && <div><div className="text-accent-green font-bold">{metrics.rating}</div><div className="text-gray-500">RATING</div></div>}
        {metrics.github && <div><div className="text-accent-purple font-bold">{metrics.github}</div><div className="text-gray-500">STARS</div></div>}
      </div>
    )}
  </div>
);

const TechPanel = ({ title, subtitle, children, ...props }: any) => (
  <div className="glass-morphism-heavy rounded-2xl p-6 border border-white/10 relative overflow-hidden">
    <div className="relative z-10">
      <h3 className="text-xl font-display font-bold text-gradient-tech mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 font-mono mb-4">{subtitle}</p>}
      {children}
    </div>
    <div className="absolute inset-0 tech-grid opacity-5" />
  </div>
)

export default function Projects() {
  const projects = [
    {
      title: "Codeforces POTD Extension",
      description: "A sophisticated Chrome extension that leverages machine learning algorithms to recommend personalized daily coding challenges. Features intelligent difficulty progression, performance analytics, and community engagement tools.",
      imageSrc: "/images/project1.svg",
      link: "#",
      technologies: ["JavaScript", "Chrome APIs", "ML", "Node.js", "MongoDB"],
      status: "live" as const,
      metrics: {
        users: "2.5K+",
        rating: "4.9★",
        github: "150+"
      }
    },
    {
      title: "Image Encryption Engine",
      description: "High-performance image encryption application utilizing chaotic logistic maps for quantum-resistant security. Implements advanced cryptographic techniques with real-time processing capabilities.",
      imageSrc: "/images/project2.svg", 
      link: "#",
      technologies: ["Java", "Swing", "Cryptography", "Chaos Theory", "OpenCV"],
      status: "completed" as const,
      metrics: {
        github: "85+",
        rating: "4.7★"
      }
    },
    {
      title: "Neural Network Compiler",
      description: "Custom compiler that optimizes neural network architectures for edge devices. Features automatic quantization, pruning, and hardware-specific optimization strategies.",
      imageSrc: "/images/project1.svg",
      link: "#",
      technologies: ["Python", "LLVM", "TensorFlow", "CUDA", "C++"],
      status: "development" as const,
      metrics: {
        github: "120+"
      }
    },
    {
      title: "Distributed Audio Synthesizer",
      description: "Real-time audio synthesis engine with distributed processing capabilities. Enables collaborative music creation across multiple devices with ultra-low latency.",
      imageSrc: "/images/project2.svg",
      link: "#", 
      technologies: ["Rust", "WebRTC", "WASM", "Web Audio API", "Docker"],
      status: "development" as const,
      metrics: {
        users: "500+",
        github: "95+"
      }
    }
  ]

  const techStats = [
    { label: "Total Projects", value: "25+", color: "cyan" },
    { label: "GitHub Stars", value: "450+", color: "purple" },
    { label: "Active Users", value: "3K+", color: "electric" },
    { label: "Code Commits", value: "1.2K+", color: "green" }
  ]

  return (

      <div className="min-h-screen relative">
        {/* Background tech effects */}
        <div className="absolute inset-0 tech-grid opacity-5 pointer-events-none" />
        
        <div className="relative z-10 space-y-12">
          
          {/* Header Section */}
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-display font-bold text-gradient-tech"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              PROJECTS
            </motion.h1>
            
            <motion.div
              className="w-32 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent mx-auto"
              initial={{ width: 0 }}
              animate={{ width: '8rem' }}
              transition={{ duration: 1, delay: 0.4 }}
            />
            
            <motion.p 
              className="text-xl text-gray-300 font-mono max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Showcasing innovative solutions in{' '}
              <span className="text-accent-cyan">distributed systems</span>,{' '}
              <span className="text-accent-electric">machine learning</span>, and{' '}
              <span className="text-accent-purple">creative technology</span>
            </motion.p>
          </motion.div>

          {/* Tech Stats Dashboard */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {techStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              >
                <TechPanel
                  title={stat.value}
                  subtitle={stat.label}
                  variant="neon"
                  className="text-center"
                >
                  <div className="h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-electric rounded-full opacity-50" />
                </TechPanel>
              </motion.div>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.4 + index * 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <ProjectCard {...project} />
              </motion.div>
            ))}
          </motion.div>

          {/* Tech Philosophy Section */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <TechPanel
              title="Engineering Philosophy"
              subtitle="Code as Art, Logic as Music"
              className="text-center"
              holographic
              scanLine
              dataFlow
            >
              <div className="space-y-6">
                <p className="text-gray-300 font-mono leading-relaxed">
                  Every project is a synthesis of{' '}
                  <span className="text-accent-cyan">technical precision</span> and{' '}
                  <span className="text-accent-purple">creative expression</span>. 
                  Like composing progressive rock, building software requires complex 
                  rhythms, unexpected harmonies, and flawless execution.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-accent-cyan font-display font-bold">INNOVATION</div>
                    <div className="text-sm text-gray-400 font-mono">Pushing boundaries with emerging technologies</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-accent-purple font-display font-bold">PERFORMANCE</div>
                    <div className="text-sm text-gray-400 font-mono">Optimizing for speed and scalability</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-accent-electric font-display font-bold">IMPACT</div>
                    <div className="text-sm text-gray-400 font-mono">Creating solutions that matter</div>
                  </div>
                </div>
              </div>
            </TechPanel>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center pt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
          >
            <motion.a
              href="#contact"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-electric text-matte-black font-bold font-display rounded-xl shadow-neon-cyan"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.6)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>LET'S BUILD SOMETHING EPIC</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>
        </div>
      </div>
  )
}