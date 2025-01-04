'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Login Form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-green-500 rounded-lg" />
            <span className="text-xl font-semibold text-green-500">Pro Mana</span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Please enter your details to sign in
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-green-500 hover:text-green-600"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
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
                alt="Login illustration"
                className="w-full h-auto rounded-lg"
              />
              <p className="text-gray-600 mt-6 text-center">
                A special place where disciplined people make their data management dreams come true.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}