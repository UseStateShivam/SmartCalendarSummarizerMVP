'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs'
import { EventType } from '../types/event'

interface Summary {
  user_id: string
  event_id: string
  summary: string
}

export const useDashboardData = () => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<EventType[]>([])
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const res = await fetch('/api/events')
      const data: EventType[] = await res.json()

      if (!Array.isArray(data)) {
        console.error('Expected events array, got:', data)
        return
      }

      if (data.length > 0) setIsCalendarConnected(true)

      const { data: saved } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)

      const merged: EventType[] = data.map((event) => {
        const match = (saved as Summary[] | null)?.find((s) => s.event_id === event.id)
        return { ...event, aiSummary: match?.summary || null }
      })

      setEvents(merged)
    }

    fetchData()
  }, [router, supabase]) // ✅ Fix useEffect deps

  const generateSummary = async (event: EventType, index: number) => {
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
          user_id: user?.id || '',
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

  return {
    user,
    events,
    loadingIndex,
    isCalendarConnected,
    generateSummary,
    handleLogout
  }
}
