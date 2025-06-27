'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'

function Page() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative px-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Shape.svg"
          alt="main-shape"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md bg-white rounded-2xl shadow-lg p-8 border border-[#B9B9B9]">
        <h2 className="text-[#202224] text-2xl sm:text-3xl font-semibold text-center mb-2">
          Login to Account
        </h2>
        <p className="text-[#202224] text-sm sm:text-base opacity-80 text-center mb-6">
          Please enter your email and password to continue
        </p>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleLogin}>
          <div className="w-full">
            <label className="text-[#202224] text-sm opacity-80">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-1 border border-[#b9b9b975] rounded-md p-3 text-sm bg-[#F1F4F9]"
              required
            />
          </div>

          <div className="w-full">
            <label className="text-[#202224] text-sm flex justify-between opacity-80">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 border border-[#B9B9B975] rounded-md p-3 text-sm bg-[#F1F4F9]"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="bg-[#4880FF] text-white rounded-md py-2 font-medium w-full hover:opacity-90 mt-4 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#202224] opacity-80">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-[#4880FF] underline">
            Create Account
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Page
