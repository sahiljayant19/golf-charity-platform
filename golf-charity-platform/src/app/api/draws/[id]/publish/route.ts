import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/client'
import { distributePrizePool, checkMatches } from '@/lib/draw/engine'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const drawId = params.id

  // Get draw details
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single()

  if (drawError || !draw) {
    return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
  }

  const serviceSupabase = createServiceClient()

  // Get all draw entries for this draw
  const { data: entries } = await serviceSupabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId)

  if (!entries) {
    return NextResponse.json({ error: 'No entries found' }, { status: 404 })
  }

  // Calculate prize distribution
  const prizeDistribution = distributePrizePool(
    draw.prize_pool_amount,
    draw.jackpot_rollover_amount
  )

  // Calculate matches for each entry
  const results = entries.map((entry) => {
    const matches = checkMatches(entry.user_numbers, draw.winning_numbers)
    return {
      ...entry,
      matches,
    }
  })

  // Count winners for each match type
  const fiveMatchWinners = results.filter((r) => r.matches === 5)
  const fourMatchWinners = results.filter((r) => r.matches === 4)
  const threeMatchWinners = results.filter((r) => r.matches === 3)

  // Update prize distribution with winner counts
  prizeDistribution[0].winnersCount = fiveMatchWinners.length
  prizeDistribution[1].winnersCount = fourMatchWinners.length
  prizeDistribution[2].winnersCount = threeMatchWinners.length

  // Calculate prize per winner
  prizeDistribution[0].prizePerWinner =
    fiveMatchWinners.length > 0 ? prizeDistribution[0].totalAmount / fiveMatchWinners.length : 0
  prizeDistribution[1].prizePerWinner =
    fourMatchWinners.length > 0 ? prizeDistribution[1].totalAmount / fourMatchWinners.length : 0
  prizeDistribution[2].prizePerWinner =
    threeMatchWinners.length > 0 ? prizeDistribution[2].totalAmount / threeMatchWinners.length : 0

  // Update draw entries with match type and prize
  for (const result of results) {
    const matchType = result.matches.toString() as '5' | '4' | '3' | '0'
    const distribution = prizeDistribution.find((d) => d.matchType === matchType)
    const prizeAmount = distribution ? distribution.prizePerWinner : 0

    await serviceSupabase
      .from('draw_entries')
      .update({
        match_type: matchType,
        prize_amount: prizeAmount,
      })
      .eq('id', result.id)

    // Create winner entry for non-zero prizes
    if (prizeAmount > 0) {
      await serviceSupabase.from('winners').insert({
        draw_entry_id: result.id,
        user_id: result.user_id,
        match_type: matchType,
        prize_amount: prizeAmount,
        verification_status: 'pending',
      })
    }
  }

  // Calculate new jackpot rollover (if no 5-match winners)
  const newJackpotRollover =
    fiveMatchWinners.length === 0 ? prizeDistribution[0].totalAmount : 0

  // Update draw status to published
  const { error: updateError } = await serviceSupabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', drawId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    prizeDistribution,
    winners: {
      fiveMatch: fiveMatchWinners.length,
      fourMatch: fourMatchWinners.length,
      threeMatch: threeMatchWinners.length,
    },
    jackpotRollover: newJackpotRollover,
  })
}
