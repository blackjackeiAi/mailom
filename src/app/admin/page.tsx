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

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg">
          <h3>ยอดขาย</h3>
          <p className="text-2xl font-bold">1,000,000</p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h3>เงินในระบบ</h3>
          <p className="text-2xl font-bold">1,000,000</p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h3>กำไรสุทธิ</h3>
          <p className="text-2xl font-bold">1,000,000</p>
          <p className="text-sm text-gray-500">บาท</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h3>สต็อกคงเหลือ</h3>
          <p className="text-2xl font-bold">135</p>
          <p className="text-sm text-gray-500">ต้น</p>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">ยอดขายต่อเดือน</h2>
          <select className="border rounded px-2 py-1">
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
        <div className="h-[400px]">
          <SalesChart />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">รายการซื้อล่าสุด</h2>
            <button className="text-blue-500">ทั้งหมด</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2">รหัส</th>
                <th>ชื่อ</th>
                <th>วันที่</th>
                <th>ชื่อลูกค้า</th>
                <th>ต้นทุน</th>
                <th>ราคาขาย</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">T1234</td>
                  <td>ปาล์ม</td>
                  <td>12/12/2024</td>
                  <td>นาย ก</td>
                  <td>10,000</td>
                  <td>20,000</td>
                  <td>
                    <button className="text-gray-400">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">รายการขายล่าสุด</h2>
            <button className="text-blue-500">ทั้งหมด</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2">รหัส</th>
                <th>ชื่อ</th>
                <th>วันที่</th>
                <th>ลูกค้า</th>
                <th>ต้นทุน</th>
                <th>ราคาขาย</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">S1234</td>
                  <td>ปาล์ม</td>
                  <td>12/12/2024</td>
                  <td>นาย ก</td>
                  <td>10,000</td>
                  <td>20,000</td>
                  <td>
                    <button className="text-gray-400">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 