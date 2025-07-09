'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/auth/me', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          router.push('/select-garden')
        } else {
          router.push('/admin/login')
        }
      })
      .catch(() => {
        router.push('/admin/login')
      })
  }, [router])

  return null
} 