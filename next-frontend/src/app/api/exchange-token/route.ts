export async function POST(req: Request) {
  const body = await req.json()
  const { code } = body

  const tokenEndpoint = 'https://oauth2.googleapis.com/token'

  const params = new URLSearchParams()
  params.append('code', code)
  params.append('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!)
  params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!)
  params.append('redirect_uri', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!)
  params.append('grant_type', 'authorization_code')

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()

  if (data.error) {
    return Response.json({ error: data.error_description || 'Failed to get access token' }, { status: 400 })
  }

  return Response.json(data)
}
