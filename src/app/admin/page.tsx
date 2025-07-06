'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import React from 'react'
import SalesChart from '@/components/admin/SalesChart'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/admin/dashboard')
  }, [router])

  return null
} 