import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import GlassCard from './GlassCard'

// Dynamically import to avoid SSR issues
const GitHubCalendar = dynamic(() => import('react-github-calendar'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
      <div className="flex space-x-2">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-3 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  )
})

interface GitHubStats {
  totalContributions: number
  currentStreak: number
  longestStreak: number
}

export default function GitHubActivity({ username = "your-github-username" }) {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        // You can implement your own API route or use GitHub's API directly
        const response = await fetch(`/api/github-stats?username=${username}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          throw new Error('Failed to fetch GitHub stats')
        }
      } catch (err) {
        setError('Unable to load GitHub activity')
        console.error('GitHub stats error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGitHubStats()
  }, [username])

  const calendarTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
  }

  return (
    <motion.section 
      className="py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold font-heading text-center mb-12 bg-gradient-to-r from-accent to-primary-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          GitHub Activity
        </motion.h2>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                ))}
              </>
            ) : error ? (
              <GlassCard className="p-6 text-center">
                <p className="text-red-400">{error}</p>
              </GlassCard>
            ) : stats ? (
              <>
                <StatCard 
                  title="Total Contributions" 
                  value={stats.totalContributions.toLocaleString()} 
                  icon="📊"
                />
                <StatCard 
                  title="Current Streak" 
                  value={`${stats.currentStreak} days`} 
                  icon="🔥"
                />
                <StatCard 
                  title="Longest Streak" 
                  value={`${stats.longestStreak} days`} 
                  icon="⚡"
                />
              </>
            ) : null}
          </div>

          {/* GitHub Calendar */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
                Contribution Graph
              </h3>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="github-calendar-container">
                  <GitHubCalendar
                    username={username}
                    colorScheme="dark"
                    theme={calendarTheme}
                    fontSize={14}
                    blockSize={12}
                    blockMargin={4}
                    blockRadius={2}
                    showWeekdayLabels
                    style={{
                      color: 'var(--tw-colors-gray-300)',
                    }}
                  />
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-6" variant="interactive">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{icon}</div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-accent">{value}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}