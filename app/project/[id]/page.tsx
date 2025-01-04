// app/project/[id]/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProjectHeader from '@/components/ProjectHeader'
import Sidebar from '@/components/Sidebar'
import CalendarView from '@/components/CalendarView'
import WorkboardList from '@/components/WorkboardList'
import { supabase } from '@/lib/supabaseClient'
import { getRoleIdByName } from '@/lib/roles'
import { useAuth } from '@/context/AuthContext'

interface InsertProject {
  name: string
  description?: string | null
}

interface InsertUserRole {
  user_id: string
  project_id: string
  role_id: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

interface UserRole {
  id: string
  user_id: string
  project_id: string
  role_id: string
  project?: Project | null
}

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>('')
  const [activeView, setActiveView] = useState<'boards' | 'calendar'>('boards')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [projectName, setProjectName] = useState<string>('')

  // Unwrap the params Promise using React.use()
  const { id } = React.use(params)

  useEffect(() => {
    if (id) {
      setProjectId(id)
      fetchProjectData(id)
    }
  }, [id])

  const fetchProjectData = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from<"projects",Project>('projects')
        .select('name')
        .eq('id', id)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setProjectName(data.name)
      }
    } catch (err) {
      console.error('Error fetching project data:', err)
      setError('Failed to fetch project data.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingProject(true)
    setCreateError(null)

    // Basic validation
    if (!newProjectName.trim()) {
      setCreateError('Project name is required.')
      setCreatingProject(false)
      return
    }

    try {
      // Fetch the admin role ID
      const adminRoleId = await getRoleIdByName('admin')

      if (!adminRoleId) {
        setCreateError('Admin role not found. Please contact support.')
        setCreatingProject(false)
        return
      }

      // Insert the new project
      const { data: projectData, error: projectError } = await supabase
        .from<"projects",Project>('projects')
        .insert<InsertProject>([
          {
            name: newProjectName,
            description: newProjectDescription,
          },
        ])
        .select()
        .single()

      if (projectError) {
        setCreateError(projectError.message)
      } else if (projectData) {
        // Assign the current user to the new project with the admin role
        const { error: userRoleError } = await supabase
          .from<"user_roles",UserRole>('user_roles')
          .insert<InsertUserRole>([
            {
              user_id: user!.id,
              project_id: projectData.id,
              role_id: adminRoleId,
            },
          ])

        if (userRoleError) {
          setCreateError(userRoleError.message)
        } else {
          // Refresh the projects list
          fetchProjectData(projectId)
          // Reset form fields
          setNewProjectName('')
          setNewProjectDescription('')
          setShowCreateForm(false)
        }
      } else {
        setCreateError('Failed to create project. Please try again.')
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setCreateError('An unexpected error occurred.')
    } finally {
      setCreatingProject(false)
    }
  }

  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [newProjectName, setNewProjectName] = useState<string>('')
  const [newProjectDescription, setNewProjectDescription] = useState<string>('')
  const [creatingProject, setCreatingProject] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Trello-inspired Header */}
      <ProjectHeader
        currentProjectName={projectName}
        onSwitchProject={() => router.push('/dashboard')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          projectId={projectId}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 overflow-auto p-4">
          {activeView === 'boards' ? (
            <WorkboardList projectId={projectId} />
          ) : (
            <CalendarView projectId={projectId} />
          )}
        </div>
      </div>
    </div>
  )
}
