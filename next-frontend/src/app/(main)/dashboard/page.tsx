'use client'

import EventCard from '@/components/eventCard'
import { useDashboardData } from '@/lib/hooks/useDashboardData'

const DashboardPage = () => {
  const {
    user,
    events,
    loadingIndex,
    isCalendarConnected,
    generateSummary,
    handleLogout
  } = useDashboardData()

  const connectGoogleCalendar = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    const scope = encodeURIComponent("https://www.googleapis.com/auth/calendar.readonly")
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
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
            <EventCard
              key={event.id}
              event={event}
              index={index}
              loadingIndex={loadingIndex}
              generateSummary={generateSummary}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default DashboardPage
