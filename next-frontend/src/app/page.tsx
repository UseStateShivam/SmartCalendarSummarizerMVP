'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function Page() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return null
}

export default Page