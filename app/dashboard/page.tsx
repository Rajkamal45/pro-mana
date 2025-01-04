// app/dashboard/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getRoleIdByName } from '@/lib/roles'
import { 
    PlusIcon, 
    FolderIcon, 
    DocumentTextIcon, 
    ClipboardListIcon 
  } from '@heroicons/react/outline'
// **Insert Types**
interface InsertProject {
  name: string
  description?: string | null
}

interface InsertUserRole {
  user_id: string
  project_id: string
  role_id: string
}

// **Select Types**
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
  project?: Project | null // Adjusted to Project | null for one-to-one relationship
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false)

  // State for creating a new project
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [newProjectName, setNewProjectName] = useState<string>('')
  const [newProjectDescription, setNewProjectDescription] = useState<string>('')
  const [creatingProject, setCreatingProject] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    setLoadingProjects(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from<'user_roles', UserRole>('user_roles') // Provide correct types
        .select(`
          project:projects (
            id,
            name,
            description,
            status,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user!.id)
        .not('project', 'is', null) // Ensures project is not null

      if (error) {
        setError(error.message)
      } else if (data) {
        // Since each `user_role` has one `project`, map directly
        const fetchedProjects: Project[] = data
          .map((ur) => ur.project)
          .filter((project): project is Project => !!project) // Ensure non-null projects

        setProjects(fetchedProjects)
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to fetch projects.')
    } finally {
      setLoadingProjects(false)
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
        .from<'projects', Project>('projects') // Correct type arguments
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
          .from<'user_roles', UserRole>('user_roles') // Correct type arguments
          .insert<InsertUserRole>([
            {
              user_id: user!.id, // Non-null assertion
              project_id: projectData.id,
              role_id: adminRoleId,
            },
          ])

        if (userRoleError) {
          setCreateError(userRoleError.message)
        } else {
          // Refresh the projects list
          fetchProjects()
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        <button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Create New Project
        </button>

        {/* Create Project Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-2xl mb-4">Create New Project</h2>
              {createError && <p className="text-red-500 mb-2">{createError}</p>}
              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label className="block text-gray-700">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    rows={4}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="mr-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    disabled={creatingProject}
                  >
                    {creatingProject ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

{loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((skeleton) => (
                <div 
                  key={skeleton} 
                  className="bg-white rounded-lg shadow-md animate-pulse p-6"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <ClipboardListIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No Projects Yet
              </h2>
              <p className="text-gray-500 mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/project/${project.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <FolderIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <h2 className="text-xl font-semibold text-gray-800">
                          {project.name}
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {project.status}
                        </span>
                        <div className="flex items-center text-gray-500">
                          <DocumentTextIcon className="w-5 h-5 mr-2" />
                          <span className="text-sm">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </div>
    </ProtectedRoute>
  )
}
