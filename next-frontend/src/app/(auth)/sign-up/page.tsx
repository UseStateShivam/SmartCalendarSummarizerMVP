'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function SignUpPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // optional: store username in user metadata
      }
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main>
      <Image
        src="/Shape.svg"
        alt="main-shape"
        layout="fill"
        objectFit="cover"
        priority
      />
      <div className="relative z-10 flex flex-col items-center justify-center w-[456px] h-[600px] p-8 bg-white rounded-2xl shadow-lg border border-[#B9B9B9]">
        <h2 className="text-[#202224] text-[24px] font-semibold text-center mb-2">
          Create an Account
        </h2>
        <p className="text-[#202224] text-[14px] opacity-80 text-center mb-6">
          Create your account to get access to the panel
        </p>
        <form className="flex flex-col gap-4 w-full items-center" onSubmit={handleSignUp}>
          <div className="w-full">
            <label className="text-[#202224] text-[13px] opacity-80">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-1 border border-[#b9b9b975] rounded-md p-3 text-[14px] bg-[#F1F4F9]"
              required
            />
          </div>
          <div className="w-full">
            <label className="text-[#202224] text-[13px] opacity-80">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full mt-1 border border-[#b9b9b975] rounded-md p-3 text-[14px] bg-[#F1F4F9]"
            />
          </div>
          <div className="w-full mt-2">
            <label className="text-[#202224] text-[13px] flex justify-between opacity-80">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full mt-1 border border-[#B9B9B975] rounded-md p-3 text-[14px] bg-[#F1F4F9]"
              required
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <input type="checkbox" id="remember" className="accent-[#4880FF]" defaultChecked />
            <label htmlFor="remember" className="text-[13px] text-[#202224] opacity-70">
              Remember Password
            </label>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="bg-[#4880FF] text-white rounded-md p-2 font-medium text-center w-[80%] hover:cursor-pointer mt-6"
          >
            Request Access
          </button>
        </form>
        <p className="text-center mt-4 text-sm opacity-80 text-[#202224]">
          Already have an account?&nbsp;
          <Link href="/login" className="text-[#4880FF] underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default SignUpPage
