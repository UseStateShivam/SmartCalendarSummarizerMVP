// app/api/set-cookie/route.ts
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json()
  const cookieStore = await cookies() // ✅ no await

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing accessToken' }), { status: 400 })
  }

  cookieStore.set('google_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return new Response(JSON.stringify({ message: 'Token set in cookie' }), { status: 200 })
}