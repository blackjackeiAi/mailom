'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OurGarden {
  id: string
  name: string
  location: string
  description: string
  managerName: string
  _count: {
    products: number
    purchases: number
  }
}

export default function SelectGardenPage() {
  const router = useRouter()
  const [gardens, setGardens] = useState<OurGarden[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    fetchOurGardens()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchOurGardens = async () => {
    try {
      const response = await fetch('/api/our-gardens', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGardens(data.data)
      }
    } catch (error) {
      console.error('Error fetching our gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGarden = (gardenId: string) => {
    // Store selected garden in localStorage
    localStorage.setItem('selectedGardenId', gardenId)
    router.push('/admin/dashboard')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/admin/login')
    } catch (error) {
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-green-800">เลือกสวนที่ต้องการจัดการ</h1>
            <p className="text-gray-500 mt-2">
              ยินดีต้อนรับ {user?.name} ({user?.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูลสวน...</p>
          </div>
        ) : gardens.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 21V5a2 2 0 012-2h6a2 2 0 012 2v16M13 7h-2v4h2V7zm0 6h-2v2h2v-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">ไม่พบสวนที่คุณสามารถเข้าถึงได้</p>
            <p className="text-gray-400 text-sm mt-2">กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าถึง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === 'ADMIN' && (
              <div 
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-500 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">
                    ดูทุกสวน
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    ADMIN
                  </span>
                </div>
                <p className="text-blue-600 text-sm mb-4">
                  ดูข้อมูลรวมจากทุกสวน
                </p>
                <div className="flex items-center text-blue-600 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  ข้อมูลรวมทั้งหมด
                </div>
              </div>
            )}
            
            {gardens.map((garden) => (
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
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">ที่ตั้ง:</span> {garden.location || 'ไม่ระบุ'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">ผู้จัดการ:</span> {garden.managerName || 'ไม่ระบุ'}
                  </p>
                  {garden.description && (
                    <p className="text-gray-500 text-sm">{garden.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{garden._count.products}</div>
                    <div className="text-xs text-gray-500">ต้นไม้</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{garden._count.purchases}</div>
                    <div className="text-xs text-gray-500">การซื้อ</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSelectGarden(garden.id)}
                  className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                >
                  เลือก
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}