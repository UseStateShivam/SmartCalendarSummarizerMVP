'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const DashboardPage = () => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false)

  useEffect(() => {
    const fetchUserAndSummaries = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const res = await fetch('/api/events')
      const data = await res.json()
      if (!Array.isArray(data)) return console.error('Expected events array, got:', data)

      if (data.length > 0) setIsCalendarConnected(true)

      const { data: saved } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)

      const merged = data.map((event: any) => {
        const match = saved?.find((s) => s.event_id === event.id)
        return { ...event, aiSummary: match?.summary || null }
      })

      setEvents(merged)
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
      setLoadingIndex(index)
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: event.summary }),
      })

      const data = await res.json()
      const newSummary = data.summary
      const updated = [...events]
      updated[index].aiSummary = newSummary
      setEvents(updated)

      const { error } = await supabase.from('summaries').upsert(
        [{
          user_id: user.id,
          event_id: event.id,
          summary: newSummary,
        }],
        { onConflict: 'user_id,event_id' }
      )

      if (error) console.error('Supabase upsert error:', error)
    } catch (err) {
      console.error('Error generating or saving summary:', err)
    } finally {
      setLoadingIndex(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F1F] to-[#2D2D2D] text-white px-4 md:px-10 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome, {user?.email?.split('@')[0]}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-full font-medium hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="mb-10 text-center">
        <button
          onClick={connectGoogleCalendar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg font-semibold transition"
        >
          {isCalendarConnected ? 'Connect Another Calendar' : 'Connect Google Calendar'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 text-lg">
            No events yet. Connect your Google Calendar to get started.
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className="bg-white text-black rounded-2xl shadow-lg p-6 hover:scale-[1.01] transition-transform"
            >
              <h2 className="text-xl font-semibold text-blue-800">{event.summary}</h2>
              <p className="text-sm text-gray-600 mt-1">{new Date(event.start).toLocaleString()}</p>
              <p className="mt-3 text-gray-800 text-sm min-h-[80px]">
                {event.aiSummary || 'No summary yet.'}
              </p>
              <button
                onClick={() => generateSummary(event, index)}
                disabled={loadingIndex === index}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loadingIndex === index
                  ? 'Generating...'
                  : event.aiSummary
                  ? 'Regenerate Summary'
                  : 'Generate Summary'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DashboardPage
