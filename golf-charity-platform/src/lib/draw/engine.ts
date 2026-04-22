import { supabase } from '@/lib/supabase/client'

export interface DrawResult {
  winningNumbers: number[]
  prizePool: number
  jackpotRollover: number
}

export interface PrizeDistribution {
  matchType: '5' | '4' | '3'
  poolPercentage: number
  rollover: boolean
  totalAmount: number
  winnersCount: number
  prizePerWinner: number
}

// Generate random winning numbers (1-45, 5 numbers)
export function generateRandomNumbers(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

// Algorithmic draw - weighted by user score frequency
export async function generateAlgorithmicNumbers(): Promise<number[]> {
  // Get all user scores
  const { data: scores } = await supabase
    .from('scores')
    .select('score')
    .order('score_date', { ascending: false })

  if (!scores || scores.length === 0) {
    return generateRandomNumbers()
  }

  // Calculate frequency of each score
  const frequency: Record<number, number> = {}
  scores.forEach((s) => {
    frequency[s.score] = (frequency[s.score] || 0) + 1
  })

  // Weight numbers based on score frequency (higher frequency = higher weight)
  const weightedNumbers: number[] = []
  for (let i = 1; i <= 45; i++) {
    const weight = frequency[i] || 1
    for (let j = 0; j < weight; j++) {
      weightedNumbers.push(i)
    }
  }

  // Draw 5 unique numbers
  const winningNumbers: number[] = []
  const availableNumbers = [...weightedNumbers]
  
  while (winningNumbers.length < 5 && availableNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length)
    const num = availableNumbers[randomIndex]
    if (!winningNumbers.includes(num)) {
      winningNumbers.push(num)
    }
    // Remove all instances of this number
    availableNumbers.splice(randomIndex, 1)
  }

  return winningNumbers.sort((a, b) => a - b)
}

// Calculate prize pool based on active subscribers
export async function calculatePrizePool(): Promise<number> {
  const { count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const activeSubscribers = count || 0
  const monthlyPrice = 19.99 // Base monthly price
  const prizePoolPercentage = 0.5 // 50% of subscription goes to prize pool
  
  return activeSubscribers * monthlyPrice * prizePoolPercentage
}

// Distribute prize pool according to PRD rules
export function distributePrizePool(
  totalPool: number,
  jackpotRollover: number = 0
): PrizeDistribution[] {
  const jackpotPool = totalPool * 0.4 + jackpotRollover
  const fourMatchPool = totalPool * 0.35
  const threeMatchPool = totalPool * 0.25

  return [
    {
      matchType: '5',
      poolPercentage: 40,
      rollover: true,
      totalAmount: jackpotPool,
      winnersCount: 0,
      prizePerWinner: 0,
    },
    {
      matchType: '4',
      poolPercentage: 35,
      rollover: false,
      totalAmount: fourMatchPool,
      winnersCount: 0,
      prizePerWinner: 0,
    },
    {
      matchType: '3',
      poolPercentage: 25,
      rollover: false,
      totalAmount: threeMatchPool,
      winnersCount: 0,
      prizePerWinner: 0,
    },
  ]
}

// Check how many numbers match
export function checkMatches(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter((num) => winningNumbers.includes(num)).length
}

// Calculate prize for a user based on matches
export function calculatePrize(
  matches: number,
  prizeDistribution: PrizeDistribution[]
): number {
  const distribution = prizeDistribution.find((d) => d.matchType === matches.toString())
  if (!distribution || distribution.winnersCount === 0) return 0
  return distribution.prizePerWinner
}

// Generate user numbers for draw entry
export function generateUserNumbers(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}
