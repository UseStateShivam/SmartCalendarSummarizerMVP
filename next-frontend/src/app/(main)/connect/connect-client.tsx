'use client'

import { useGoogleCalendarConnect } from '@/lib/hooks/useGoogleCalendarConnect'

export default function ConnectClient() {
  const { loading, error } = useGoogleCalendarConnect()

  if (loading) return <p className="p-6 text-white">Connecting to Google Calendar...</p>
  if (error) return <p className="p-6 text-red-400">{error}</p>

  return null
}
