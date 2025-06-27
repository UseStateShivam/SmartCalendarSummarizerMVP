import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || text.length < 5) {
      return new Response(JSON.stringify({ error: 'Invalid or short input text' }), { status: 400 })
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({ inputs: text }),
      }
    )

    const data = await response.json()

    if (data.error) {
      console.error('HuggingFace response error:', data)
      return new Response(JSON.stringify({ error: data.error }), { status: 500 })
    }

    const summary = data?.[0]?.summary_text || 'No summary generated'
    return new Response(JSON.stringify({ summary }))
  } catch (error) {
    console.error('Summarize route error:', error)
    return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 })
  }
}
