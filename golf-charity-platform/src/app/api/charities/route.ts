import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')

  let query = supabase
    .from('charities')
    .select('*, charity_events(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name')

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = createServiceClient()
  const { name, description, imageUrl, websiteUrl, isFeatured } = await req.json()

  if (!name || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('charities')
    .insert({
      name,
      description,
      image_url: imageUrl,
      website_url: websiteUrl,
      is_featured: isFeatured || false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const supabaseAdmin = createServiceClient()
  const { id, name, description, imageUrl, websiteUrl, isFeatured, isActive } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Charity ID required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('charities')
    .update({
      name,
      description,
      image_url: imageUrl,
      website_url: websiteUrl,
      is_featured: isFeatured,
      is_active: isActive,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = createServiceClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Charity ID required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('charities').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
