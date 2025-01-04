// app/api/check-username/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json(
      { available: false, message: 'Username is required.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, username is available
      return NextResponse.json({ available: true, message: 'Username is available.' })
    }
    // Other errors
    return NextResponse.json(
      { available: false, message: error.message },
      { status: 500 }
    )
  }

  // Username exists
  return NextResponse.json({ available: false, message: 'Username is already taken.' })
}
