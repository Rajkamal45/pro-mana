'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: '',
    username: ''
  })

  // Auto-populate username when email changes and username is empty
  useEffect(() => {
    if (!formData.username && formData.email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        username: formData.email.split('@')[0]
      }))
    }
  }, [formData.email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.username) {
        throw new Error('Username is required.')
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (data?.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: formData.role,
              username: formData.username,
            },
          ])

        if (insertError) throw insertError
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Registration Form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-green-500 rounded-lg" />
            <span className="text-xl font-semibold text-green-500">Pro Move</span>
          </div>

          <div className="space-y-6">
            {/* Back to login link */}
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill in the details below to get started
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />

                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Job role"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username (auto-generated from email)"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-green-500 hover:text-green-600">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center p-12">
        <div className="relative w-full max-w-lg">
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 right-4 w-72 h-72 bg-purple-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
          
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <img
                src="/images/login.svg"
                alt="Registration illustration"
                className="w-full h-auto rounded-lg"
              />
              <p className="text-gray-600 mt-6 text-center">
                Join our community of professionals and start managing your data efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}