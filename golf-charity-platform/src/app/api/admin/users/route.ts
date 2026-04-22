import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const supabaseAdmin = createServiceClient()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, subscriptions(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
