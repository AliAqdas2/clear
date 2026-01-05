'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { login } from './actions'
import { Mail, Lock, ShieldCheck } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-extrabold text-text-main bg-primary hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 mt-2 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Logging in...' : 'Log In'}
    </button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap px-6 py-4 md:px-10">
        <div className="flex items-center gap-3 text-text-main">
          <div className="size-8 text-primary">
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_logo)">
                <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
              </g>
              <defs>
                <clipPath id="clip0_logo"><rect fill="white" height="48" width="48" /></clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight">Clear</h2>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-text-secondary">
            Don&apos;t have an account?
            <Link className="text-text-main font-bold hover:underline ml-1" href="/signup">
              Sign Up
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[480px] bg-white shadow-xl rounded-2xl overflow-hidden border border-transparent">
          {/* Card Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl mb-3">
              Welcome Back
            </h1>
            <p className="text-base text-text-secondary">
              Log in to manage your financial clarity.
            </p>
          </div>

          {/* Login Form */}
          <form action={handleSubmit} className="px-8 pb-10 flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-xl border-input-border bg-white text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-primary sm:text-base py-3.5 pl-4 pr-10 shadow-sm transition-all"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-xl border-input-border bg-white text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-primary sm:text-base py-3.5 pl-4 pr-10 shadow-sm transition-all"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <SubmitButton />

            <div className="block sm:hidden text-center mt-2">
              <p className="text-sm font-medium text-text-secondary">
                Don&apos;t have an account?
                <Link className="text-text-main font-bold hover:underline ml-1" href="/signup">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex items-center gap-2 text-text-secondary opacity-60">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium">Bank-level security encryption</span>
        </div>
      </main>
    </div>
  )
}
