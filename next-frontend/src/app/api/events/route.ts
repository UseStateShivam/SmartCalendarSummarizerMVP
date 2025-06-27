import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies() 
  const accessToken = cookieStore.get('google_access_token')?.value

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Not authenticated with Google' }), { status: 401 })
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()

  const events = (data.items || []).map((event: any) => ({
    id: event.id,
    summary: event.summary,
    start: event.start.dateTime || event.start.date,
  }))

  return new Response(JSON.stringify(events), { status: 200 })
}
