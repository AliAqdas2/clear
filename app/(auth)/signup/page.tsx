'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { signup } from './actions'
import { Mail, Lock, User, BadgeCheck, Smartphone, Camera, ShieldCheck } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-extrabold text-text-main bg-primary hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 mt-2 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Creating account...' : 'Sign Up'}
    </button>
  )
}

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!agreed) {
      setError('Please agree to the Terms of Service')
      return
    }
    setError(null)
    const result = await signup(formData)
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
            Already have an account?
            <Link className="text-text-main font-bold hover:underline ml-1" href="/login">
              Log In
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[560px] bg-white shadow-xl rounded-2xl overflow-hidden border border-transparent">
          {/* Card Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl mb-3">
              Welcome to Clear
            </h1>
            <p className="text-base text-text-secondary">
              Manage your cash flow with clarity and trust.
            </p>
          </div>

          {/* Registration Form */}
          <form action={handleSubmit} className="px-8 pb-10 flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Avatar Upload Placeholder */}
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative group cursor-pointer">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-background-light shadow-sm flex items-center justify-center overflow-hidden">
                  <User className="w-10 h-10 text-primary/50" />
                </div>
                <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center border-2 border-white text-text-main shadow-sm transition-transform group-hover:scale-110">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <span className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                Upload Photo (Optional)
              </span>
            </div>

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
                  placeholder="Choose a strong password"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-xl border-input-border bg-white text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-primary sm:text-base py-3.5 pl-4 pr-10 shadow-sm transition-all"
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a unique username"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Real Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main" htmlFor="realName">
                Real Name
              </label>
              <div className="relative">
                <input
                  className="block w-full rounded-xl border-input-border bg-white text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-primary sm:text-base py-3.5 pl-4 pr-10 shadow-sm transition-all"
                  id="realName"
                  name="realName"
                  type="text"
                  placeholder="What's your real name?"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <BadgeCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-1">This helps friends identify you for loans.</p>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-main" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative flex rounded-xl shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-input-border bg-background-light text-text-secondary sm:text-sm font-medium">
                  PK +92
                </span>
                <input
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border-input-border bg-white text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-primary sm:text-base py-3.5 px-4 shadow-sm transition-all"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="300 1234567"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs text-text-secondary">Private & Secure. We never spam.</p>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mt-2">
              <div className="flex h-6 items-center">
                <input
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary bg-white"
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label className="font-medium text-text-main" htmlFor="terms">
                  I agree to the Terms of Service
                </label>
                <p className="text-text-secondary text-xs">
                  By signing up, you agree to our transparent terms and privacy policy.
                </p>
              </div>
            </div>

            <SubmitButton />

            <div className="block sm:hidden text-center mt-2">
              <p className="text-sm font-medium text-text-secondary">
                Already have an account?
                <Link className="text-text-main font-bold hover:underline ml-1" href="/login">
                  Log In
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
