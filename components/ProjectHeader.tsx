// components/ProjectHeader.tsx

'use client'

import React from 'react'

interface ProjectHeaderProps {
  currentProjectName: string
  onSwitchProject: () => void
}

export default function ProjectHeader({
  currentProjectName,
  onSwitchProject,
}: ProjectHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-blue-600 text-white py-3 px-4">
      {/* Project Switcher */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSwitchProject}
          className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
        >
          Switch Project
        </button>
        <h1 className="font-bold text-xl">{currentProjectName}</h1>
      </div>

      {/* Additional header items (e.g., search, user menu) */}
      <div>Extra Header Tools</div>
    </header>
  )
}
