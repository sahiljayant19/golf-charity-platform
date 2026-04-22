import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabaseAdmin = createServiceClient()
  const { status, adminNotes } = await req.json()

  if (!status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updateData: any = {
    verification_status: status,
    admin_notes: adminNotes,
  }

  if (status === 'approved') {
    updateData.paid_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('winners')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
