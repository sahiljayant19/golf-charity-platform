import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/client'
import {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  calculatePrizePool,
  distributePrizePool,
  generateUserNumbers,
  checkMatches,
} from '@/lib/draw/engine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase.from('draws').select('*').order('draw_month', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { drawMonth, drawType } = await req.json()

  if (!drawMonth || !drawType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if draw already exists for this month
  const { data: existingDraw } = await supabase
    .from('draws')
    .select('id')
    .eq('draw_month', drawMonth)
    .single()

  if (existingDraw) {
    return NextResponse.json({ error: 'Draw already exists for this month' }, { status: 400 })
  }

  // Generate winning numbers
  let winningNumbers: number[]
  if (drawType === 'random') {
    winningNumbers = generateRandomNumbers()
  } else {
    winningNumbers = await generateAlgorithmicNumbers()
  }

  // Calculate prize pool
  const prizePool = await calculatePrizePool()

  // Get previous jackpot rollover
  const { data: previousDraw } = await supabase
    .from('draws')
    .select('jackpot_rollover_amount')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .single()

  const jackpotRollover = previousDraw?.jackpot_rollover_amount || 0

  // Get active subscriber count
  const { count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const totalSubscribers = count || 0

  // Create draw
  const { data, error } = await supabase
    .from('draws')
    .insert({
      draw_month: drawMonth,
      draw_type: drawType,
      status: 'pending',
      winning_numbers: winningNumbers,
      jackpot_rollover_amount: jackpotRollover,
      total_subscribers: totalSubscribers,
      prize_pool_amount: prizePool,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
