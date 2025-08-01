// pages/api/github-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next'

interface GitHubContribution {
  date: string
  contributionCount: number
}

interface GitHubStats {
  totalContributions: number
  currentStreak: number
  longestStreak: number
  contributions: GitHubContribution[]
}

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'

// GitHub GraphQL query to fetch contribution data
const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

function calculateStreaks(contributions: GitHubContribution[]): { current: number; longest: number } {
  const sortedContributions = contributions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate current streak (from today backwards)
  const today = new Date()
  let checkDate = new Date(today)
  
  for (const contribution of sortedContributions) {
    const contribDate = new Date(contribution.date)
    
    if (contribution.contributionCount > 0) {
      if (contribDate.toDateString() === checkDate.toDateString()) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    } else if (contribDate.toDateString() === checkDate.toDateString()) {
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  // Calculate longest streak
  for (const contribution of contributions) {
    if (contribution.contributionCount > 0) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return { current: currentStreak, longest: longestStreak }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GitHubStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username } = req.query

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' })
  }

  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' })
  }

  try {
    // Get data for the last year
    const to = new Date()
    const from = new Date()
    from.setFullYear(from.getFullYear() - 1)

    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: {
          username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      throw new Error(`GitHub API errors: ${JSON.stringify(data.errors)}`)
    }

    const contributionsCollection = data.data?.user?.contributionsCollection
    if (!contributionsCollection) {
      throw new Error('No contributions data found')
    }

    // Extract contribution data
    const contributions: GitHubContribution[] = []
    contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributions.push({
          date: day.date,
          contributionCount: day.contributionCount,
        })
      })
    })

    // Calculate streaks
    const streaks = calculateStreaks(contributions)

    const stats: GitHubStats = {
      totalContributions: contributionsCollection.contributionCalendar.totalContributions,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      contributions,
    }

    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(stats)

  } catch (error) {
    console.error('GitHub stats API error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch GitHub stats' 
    })
  }
}