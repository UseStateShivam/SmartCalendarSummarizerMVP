'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const DashboardPage = () => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserAndSummaries = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const res = await fetch('/api/events')
      const data = await res.json()

      if (!Array.isArray(data)) {
        console.error('Expected events array, got:', data)
        setLoading(false)
        return
      }

      const calendarEvents = data

      const { data: saved } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)

      const merged = calendarEvents.map((event: any) => {
        const match = saved?.find((s) => s.event_id === event.id)
        return {
          ...event,
          aiSummary: match?.summary || null,
        }
      })

      setEvents(merged)
      setLoading(false)
    }

    fetchUserAndSummaries()
  }, [])

  const connectGoogleCalendar = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly")
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
  }

  const generateSummary = async (event: any, index: number) => {
    try {
      setGeneratingIndex(index)

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${event.summary} (regen ${Date.now()})` }), // ⬅️ force change
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        console.error('Summary generation failed:', data.error || res.statusText)
        return
      }

      const newSummary = data.summary

      const updated = [...events]
      updated[index] = {
        ...event,
        aiSummary: newSummary,
      }
      setEvents(updated)

      await supabase.from('summaries').upsert([
        {
          user_id: user.id,
          event_id: event.id,
          summary: newSummary,
        },
      ])
    } catch (err) {
      console.error('Error generating or saving summary:', err)
    } finally {
      setGeneratingIndex(null)
    }
  }


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

      {loading ? (
        <p className="text-center text-[#B9B9B9]">Loading events...</p>
      ) : (
        <div className="grid gap-6">
          {events.length === 0 ? (
            <p className="text-[#B9B9B9]">No events yet. Connect your Google Calendar to get started.</p>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="bg-[#F1F4F9] text-black p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{event.summary}</h2>
                <p className="text-sm text-gray-600">{event.start}</p>
                <p className="mt-2">{event.aiSummary || 'No summary yet.'}</p>
                <button
                  onClick={() => generateSummary(event, index)}
                  className="mt-4 bg-[#4880FF] text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-60"
                  disabled={generatingIndex === index}
                >
                  {generatingIndex === index
                    ? 'Generating...'
                    : event.aiSummary
                      ? 'Regenerate Summary'
                      : 'Generate Summary'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
