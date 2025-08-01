import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure smooth appearance
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent" />
      </div>

      {/* Floating orbs - static initially */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div 
        className={`relative z-10 text-center px-4 max-w-6xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 p-12 mb-8 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-bold font-heading mb-6 bg-gradient-to-r from-accent via-primary-400 to-accent bg-clip-text text-transparent">
              Anant Kumar Srivastava
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Software engineer crafting scalable data systems and 
              <span className="text-accent font-semibold"> exceptional user experiences</span>
            </p>

            <div className="w-32 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="#projects">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-accent to-primary-400 text-dark-900 font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="relative z-10">View My Work</span>
            </button>
          </Link>

          <Link href="#contact">
            <button className="group px-8 py-4 border-2 border-accent text-accent font-semibold rounded-full backdrop-blur-sm hover:bg-accent hover:text-dark-900 transition-all duration-300 hover:scale-105">
              Get In Touch
            </button>
          </Link>
        </div>

        {/* Simple scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center animate-pulse">
            <div className="w-1 h-3 bg-accent rounded-full mt-2" />
          </div>
        </div>
      </div>
    </section>
  )
}