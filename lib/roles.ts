// lib/roles.ts

import { supabase } from '@/lib/supabaseClient'

export const getRoleIdByName = async (roleName: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single()

  if (error) {
    console.error(`Error fetching role ID for ${roleName}:`, error.message)
    return null
  }

  return data.id
}
