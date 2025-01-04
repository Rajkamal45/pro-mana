// components/Sidebar.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

interface SidebarProps {
  projectId: string
  activeView: 'boards' | 'calendar'
  setActiveView: (view: 'boards' | 'calendar') => void
}

export default function Sidebar({ projectId, activeView, setActiveView }: SidebarProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useEffect(() => {
    // fetch user avatar or set fallback
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    } else {
      // fallback
      setAvatarUrl('')
    }
  }, [user])

  const handleCreateWorkboard = async () => {
    const workboardName = prompt('Enter workboard name:')
    if (!workboardName) return

    // Example insert into workboards
    try {
      const { error } = await supabase
        .from('workboards')
        .insert([
          {
            project_id: projectId,
            name: workboardName,
          },
        ])
      if (error) {
        console.error('Error creating workboard:', error)
      } else {
        // Possibly refresh something or show success
        alert('Workboard created!')
      }
    } catch (err) {
      console.error('Error creating workboard:', err)
    }
  }

  return (
    <aside className="w-64 bg-gray-200 p-4 flex flex-col">
      {/* User Profile */}
      <div className="flex items-center space-x-2 mb-6">
        {true ? (
          <img src='${avatarUrl}' alt="User Avatar" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 bg-black rounded-full" />
        )}
        <div className="text-gray-700">
          {user?.user_metadata?.full_name || user?.email}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1">
        <button
          className={`block w-full text-left px-3 py-2 mb-2 rounded ${activeView === 'boards' ? 'bg-gray-300' : ''}`}
          onClick={() => setActiveView('boards')}
        >
          Workboards
        </button>
        
        {/* Simple link to a members page (not shown in this snippet) */}
        <button
          className="block w-full text-left px-3 py-2 mb-2 rounded hover:bg-gray-300"
          onClick={() => alert('Members page placeholder')}
        >
          Members
        </button>

        <button
          className={`block w-full text-left px-3 py-2 mb-2 rounded ${activeView === 'calendar' ? 'bg-gray-300' : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          Calendar
        </button>
      </nav>

      {/* Create Workboard */}
      <button
        onClick={handleCreateWorkboard}
        className="mt-auto bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
      >
        Create Workboard
      </button>
    </aside>
  )
}
