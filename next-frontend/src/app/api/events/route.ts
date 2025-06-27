import { cookies } from 'next/headers'

type GoogleCalendarEvent = {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Not authenticated with Google' }), {
      status: 401,
    })
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()

  const events = (data.items || []).map((event: GoogleCalendarEvent) => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
  }))

  return new Response(JSON.stringify(events), { status: 200 })
}
