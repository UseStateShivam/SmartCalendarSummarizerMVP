'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const DashboardPage = () => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])

  // 🔐 Get Supabase user and protect route
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUser(user)
    }

    getUser()
  }, [])

  // 📆 Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('google_access_token')
      if (!token) return

      try {
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()
        if (data.items) {
          setEvents(
            data.items.map((event: any) => ({
              id: event.id,
              summary: event.summary || '(No title)',
              start: event.start?.dateTime || event.start?.date || '',
              aiSummary: '', // Will be filled by OpenAI
            }))
          )
        } else {
          console.error('No events:', data)
        }
      } catch (err) {
        console.error('Error fetching events:', err)
      }
    }

    fetchEvents()
  }, [])

  // 🔁 Generate OpenAI summary
  const generateSummary = async (event: any, index: number) => {
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: event.summary }),
      })

      const data = await res.json()

      const updated = [...events]
      updated[index].aiSummary = data.summary
      setEvents(updated)
    } catch (err) {
      console.error('Error generating summary:', err)
    }
  }


  // 🔗 Start Google OAuth flow
  const connectGoogleCalendar = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly")
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
  }

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#202224] text-white px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.email?.split('@')[0]}</h1>
        <button onClick={handleLogout} className="bg-[#B9B9B9] text-black px-4 py-2 rounded hover:opacity-80">
          Logout
        </button>
      </div>

      <button
        onClick={connectGoogleCalendar}
        className="bg-[#4880FF] text-white px-6 py-3 rounded-lg mb-10 hover:bg-blue-600"
      >
        Connect Google Calendar
      </button>

      <div className="grid gap-6">
        {events.length === 0 ? (
          <p className="text-[#B9B9B9]">No events yet. Connect your Google Calendar to get started.</p>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="bg-[#F1F4F9] text-black p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{event.summary}</h2>
              <p className="text-sm text-gray-600">{event.start}</p>
              <p className="mt-2">
                {event.aiSummary ? event.aiSummary : (
                  <span className="text-[#B9B9B9] italic">No summary yet.</span>
                )}
              </p>
              <button
                onClick={() => generateSummary(event, index)}
                className="mt-4 bg-[#4880FF] text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Regenerate Summary
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DashboardPage
