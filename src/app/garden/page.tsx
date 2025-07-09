'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SelectGardenPage() {
  const router = useRouter()
  const [gardens, setGardens] = useState<Array<{id: string, name: string, location?: string}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchGardens()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (!response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchGardens = async () => {
    try {
      const response = await fetch('/api/gardens', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGardens(data.data)
      }
    } catch (error) {
      console.error('Error fetching gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGarden = (gardenId: string) => {
    router.push(`/admin/dashboard?gardenId=${gardenId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">เลือกสวน</h1>
          <p className="text-gray-500 mt-2">กรุณาเลือกสวนที่ต้องการจัดการ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลสวน...</p>
            </div>
          ) : gardens.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500">ไม่พบข้อมูลสวน</p>
            </div>
          ) : (
            gardens.map((garden) => (
              <div 
                key={garden.id}
                onClick={() => handleSelectGarden(garden.id)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-green-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                    {garden.name}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    สวน
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-medium">ที่ตั้ง:</span> {garden.location || 'ไม่ระบุ'}
                </p>
                <button
                  onClick={() => handleSelectGarden(garden.id)}
                  className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                >
                  เลือก
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/admin/login')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  )
} 