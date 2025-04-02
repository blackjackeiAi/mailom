'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function SelectGardenPage() {
  const router = useRouter()

  const gardens = [
    { id: 1, name: 'สวนไม้ล้อม', trees: 120, location: 'นครปฐม' },
    { id: 2, name: 'สวนนาย ก', trees: 85, location: 'ราชบุรี' },
    { id: 3, name: 'สวนนาย ข', trees: 64, location: 'สุพรรณบุรี' },
    { id: 4, name: 'สวนนาย ค', trees: 92, location: 'กาญจนบุรี' },
  ]

  const handleSelectGarden = (gardenId: number) => {
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
                  {garden.trees} ต้น
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                <span className="font-medium">ที่ตั้ง:</span> {garden.location}
              </p>
              <button
                onClick={() => handleSelectGarden(garden.id)}
                className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200"
              >
                เลือก
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  )
} 