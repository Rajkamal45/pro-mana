// app/project/[id]/workboard/[workboardId]/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Task {
  id: string
  workboard_id: string
  title: string
  description?: string
  due_date: string
  created_at?: string
  updated_at?: string
}

interface WorkboardDetailsProps {
  params: Promise<{ id: string; workboardId: string }>
}

export default function WorkboardDetails({ params }: WorkboardDetailsProps) {
  const router = useRouter()
  const [workboardId, setWorkboardId] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [workboardName, setWorkboardName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [newTaskTitle, setNewTaskTitle] = useState<string>('')
  const [newTaskDescription, setNewTaskDescription] = useState<string>('')
  const [creatingTask, setCreatingTask] = useState<boolean>(false)

  // Unwrap the params Promise using React.use()
  const { id, workboardId: wbId } = React.use(params)

  useEffect(() => {
    if (wbId) {
      setWorkboardId(wbId)
      fetchWorkboardDetails(wbId)
      fetchTasks(wbId)
    }
  }, [wbId])

  const fetchWorkboardDetails = async (wbId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('workboards')
        .select('name, description')
        .eq('id', wbId)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setWorkboardName(data.name)
      }
    } catch (err) {
      console.error('Error fetching workboard details:', err)
      setError('Failed to fetch workboard details.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async (wbId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from<"tasks",Task>('tasks')
        .select('*')
        .eq('workboard_id', wbId)

      if (error) {
        setError(error.message)
      } else if (data) {
        setTasks(data)
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError('Failed to fetch tasks.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingTask(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            workboard_id: workboardId,
            title: newTaskTitle,
            description: newTaskDescription,
            deadline: new Date().toISOString(), // Set appropriate due date
          },
        ])
      if (error) {
        console.error('Error creating task:', error)
        alert(`Error: ${error.message}`)
      } else {
        // Refresh tasks
        fetchTasks(workboardId)
        // Reset form fields
        setNewTaskTitle('')
        setNewTaskDescription('')
      }
    } catch (err) {
      console.error('Error creating task:', err)
      alert('An unexpected error occurred while creating the task.')
    } finally {
      setCreatingTask(false)
    }
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  if (loading) {
    return <p>Loading workboard details...</p>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{workboardName}</h2>

      {/* Create Task Form */}
      <form onSubmit={handleCreateTask} className="mb-6">
        <div className="mb-2">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="Task Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={creatingTask}
        >
          {creatingTask ? 'Creating...' : 'Add Task'}
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            {task.description && <p className="text-gray-600">{task.description}</p>}
            <p className="text-sm text-blue-500">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
