import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { userId, score, scoreDate } = await req.json()

  if (!userId || !score || !scoreDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (score < 1 || score > 45) {
    return NextResponse.json(
      { error: 'Score must be between 1 and 45' },
      { status: 400 }
    )
  }

  // Check if score already exists for this date
  const { data: existingScore } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('score_date', scoreDate)
    .single()

  if (existingScore) {
    return NextResponse.json(
      { error: 'Score already exists for this date' },
      { status: 400 }
    )
  }

  // Get current count of scores
  const { data: currentScores } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .order('score_date', { ascending: false })

  // If user has 5 scores, delete the oldest one
  if (currentScores && currentScores.length >= 5) {
    const oldestScore = currentScores[currentScores.length - 1]
    await supabase.from('scores').delete().eq('id', oldestScore.id)
  }

  // Insert new score
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      score,
      score_date: scoreDate,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const { scoreId, score, scoreDate } = await req.json()

  if (!scoreId || !score || !scoreDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (score < 1 || score > 45) {
    return NextResponse.json(
      { error: 'Score must be between 1 and 45' },
      { status: 400 }
    )
  }

  // Check if another score exists for this date (excluding current score)
  const { data: existingScore } = await supabase
    .from('scores')
    .select('id')
    .eq('score_date', scoreDate)
    .neq('id', scoreId)
    .single()

  if (existingScore) {
    return NextResponse.json(
      { error: 'Score already exists for this date' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('scores')
    .update({
      score,
      score_date: scoreDate,
    })
    .eq('id', scoreId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const scoreId = searchParams.get('scoreId')

  if (!scoreId) {
    return NextResponse.json({ error: 'Score ID required' }, { status: 400 })
  }

  const { error } = await supabase.from('scores').delete().eq('id', scoreId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
