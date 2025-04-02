'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function SelectGardenPage() {
  const router = useRouter()

  const gardens = [
    { id: 1, name: 'สวนไม้ล้อม' },
    { id: 2, name: 'สวนนาย ก' },
    { id: 3, name: 'สวนนาย ข' },
    { id: 4, name: 'สวนนาย ค' },
  ]

  const handleSelectGarden = (gardenId: number) => {
    // ในอนาคตสามารถใช้ gardenId เพื่อโหลดข้อมูลเฉพาะของสวนนั้นๆ
    router.push(`/admin/dashboard?gardenId=${gardenId}`)
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 className="text-2xl font-bold mb-6 text-center">เลือกสวน</h1>
      <div className="space-y-4">
        {gardens.map((garden) => (
          <button
            key={garden.id}
            onClick={() => handleSelectGarden(garden.id)}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            {garden.name}
          </button>
        ))}
      </div>
    </div>
  )
} 