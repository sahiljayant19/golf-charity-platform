import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { generateUserNumbers } from '@/lib/draw/engine'

export async function POST(req: NextRequest) {
  const { userId, drawId } = await req.json()

  if (!userId || !drawId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if user already has an entry for this draw
  const { data: existingEntry } = await supabase
    .from('draw_entries')
    .select('id')
    .eq('draw_id', drawId)
    .eq('user_id', userId)
    .single()

  if (existingEntry) {
    return NextResponse.json(
      { error: 'User already has an entry for this draw' },
      { status: 400 }
    )
  }

  // Generate random numbers for user
  const userNumbers = generateUserNumbers()

  // Create draw entry
  const { data, error } = await supabase
    .from('draw_entries')
    .insert({
      draw_id: drawId,
      user_id: userId,
      user_numbers: userNumbers,
      match_type: '0',
      prize_amount: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const drawId = searchParams.get('drawId')

  let query = supabase.from('draw_entries').select('*')

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (drawId) {
    query = query.eq('draw_id', drawId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
