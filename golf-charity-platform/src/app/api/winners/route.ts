import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')

  let query = supabase
    .from('winners')
    .select('*, profiles(full_name, email), draw_entries(user_numbers, draw_id)')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (status) {
    query = query.eq('verification_status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { winnerId, proofImageUrl } = await req.json()

  if (!winnerId || !proofImageUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('winners')
    .update({
      proof_image_url: proofImageUrl,
      verification_status: 'pending',
    })
    .eq('id', winnerId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
