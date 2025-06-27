'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSignUp } from '@/lib/hooks/useSignUp' // <-- import the hook

function SignUpPage() {
  const {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    error,
    handleSignUp,
  } = useSignUp()

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
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-[#B9B9B9]">
        <h2 className="text-[#202224] text-2xl sm:text-3xl font-semibold text-center mb-2">
          Create an Account
        </h2>
        <p className="text-[#202224] text-sm sm:text-base opacity-80 text-center mb-6">
          Create your account to get access to the panel
        </p>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSignUp}>
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
            <label className="text-[#202224] text-sm opacity-80">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full mt-1 border border-[#b9b9b975] rounded-md p-3 text-sm bg-[#F1F4F9]"
            />
          </div>

          <div className="w-full">
            <label className="text-[#202224] text-sm opacity-80">Password</label>
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
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#202224] opacity-80">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4880FF] underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default SignUpPage
