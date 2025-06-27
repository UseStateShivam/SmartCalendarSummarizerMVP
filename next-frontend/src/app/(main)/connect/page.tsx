// app/(main)/connect/page.tsx

'use client'

import { Suspense } from 'react'
import ConnectClient from './connect-client'

export default function ConnectPage() {
  return (
    <Suspense fallback={<p className="p-6 text-white">Connecting to Google Calendar...</p>}>
      <ConnectClient />
    </Suspense>
  )
}
