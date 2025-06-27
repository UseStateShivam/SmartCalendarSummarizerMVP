'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const ConnectPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get('code')

      if (!code) {
        setError('Authorization code not found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          // Store token securely in cookie (via server route)
          await fetch('/api/set-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: data.access_token }),
          })

          router.push('/dashboard')
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    exchangeCode()
  }, [])

  if (loading) return <p className="p-6 text-white">Connecting to Google Calendar...</p>
  if (error) return <p className="p-6 text-red-400">{error}</p>

  return null
}

export default ConnectPage
