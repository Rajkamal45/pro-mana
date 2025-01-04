// components/WorkboardList.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Workboard {
  id: string
  project_id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

interface WorkboardListProps {
  projectId: string
}

export default function WorkboardList({ projectId }: WorkboardListProps) {
  const [workboards, setWorkboards] = useState<Workboard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    fetchWorkboards()
  }, [projectId])

  const fetchWorkboards = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from<"workboards",Workboard>('workboards')
        .select('*')
        .eq('project_id', projectId)

      if (error) {
        setError(error.message)
      } else if (data) {
        setWorkboards(data)
      }
    } catch (err) {
      console.error('Error fetching workboards:', err)
      setError('Failed to fetch workboards.')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (loading) {
    return <p>Loading workboards...</p>
  }

  if (workboards.length === 0) {
    return <p>No workboards created yet.</p>
  }

  return (
    <div className="space-y-4">
      {workboards.map((wb) => (
        <Link key={wb.id} href={`/project/${projectId}/workboard/${wb.id}`}>
          <div className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-lg">{wb.name}</h3>
            {wb.description && <p className="text-gray-600">{wb.description}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
