'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SalesChart from '@/components/admin/SalesChart'

interface DashboardData {
  totalPurchases: number
  totalCost: number
  totalProducts: number
  totalSales: number
  totalRevenue: number
  grossProfit: number
  profitMargin: number
  avgCostPerProduct: number
}

interface RecentPurchase {
  id: string
  purchaseCode: string
  purchaseDate: string
  garden: { name: string }
  totalCost: number
  _count: { products: number }
}

export default function AdminDashboard() {
  const searchParams = useSearchParams()
  const gardenId = searchParams.get('gardenId') || ''
  
  const [gardens, setGardens] = useState<Array<{id: string, name: string, location?: string}>>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([])
  const [loading, setLoading] = useState(true)
  
  const currentGarden = gardens.find(g => g.id === gardenId) || gardens[0]

  useEffect(() => {
    fetchGardens()
    fetchDashboardData()
  }, [gardenId])

  const fetchGardens = async () => {
    try {
      const response = await fetch('/api/gardens')
      const data = await response.json()
      if (response.ok) {
        setGardens(data.data)
      }
    } catch (error) {
      console.error('Error fetching gardens:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'summary',
        ...(gardenId && { gardenId }),
      })

      const response = await fetch(`/api/cost-analysis?${params}`)
      const data = await response.json()

      if (response.ok) {
        setDashboardData(data.summary)
        setRecentPurchases(data.recentPurchases || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">สวัสดี, Admin</h1>
            <p className="text-gray-500 mt-1">
              {currentGarden ? `${currentGarden.name} - ${currentGarden.location || 'ไม่ระบุที่อยู่'}` : 'ทุกสวน'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={gardenId}
              onChange={(e) => {
                const url = new URL(window.location.href)
                if (e.target.value) {
                  url.searchParams.set('gardenId', e.target.value)
                } else {
                  url.searchParams.delete('gardenId')
                }
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกสวน</option>
              {gardens.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ยอดขาย */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-800 font-medium">ยอดขาย</h3>
            <span className="bg-green-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? 'กำลังโหลด...' : formatCurrency(dashboardData?.totalRevenue || 0)}
          </p>
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            {dashboardData?.totalSales || 0} ครั้ง
          </p>
        </div>

        {/* ต้นทุนรวม */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-800 font-medium">ต้นทุนรวม</h3>
            <span className="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? 'กำลังโหลด...' : formatCurrency(dashboardData?.totalCost || 0)}
          </p>
          <p className="text-blue-600 text-sm mt-2">{dashboardData?.totalPurchases || 0} ครั้งซื้อ</p>
        </div>

        {/* กำไรสุทธิ */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-purple-800 font-medium">กำไรสุทธิ</h3>
            <span className="bg-purple-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? 'กำลังโหลด...' : formatCurrency(dashboardData?.grossProfit || 0)}
          </p>
          <p className="text-purple-600 text-sm mt-2">
            {dashboardData?.profitMargin?.toFixed(1) || 0}% อัตรากำไร
          </p>
        </div>

        {/* สต็อกคงเหลือ */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl shadow-sm border border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-800 font-medium">สต็อกคงเหลือ</h3>
            <span className="bg-amber-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? 'กำลังโหลด...' : (dashboardData?.totalProducts || 0)}
          </p>
          <p className="text-amber-600 text-sm mt-2">
            {formatCurrency(dashboardData?.avgCostPerProduct || 0)}/ต้น
          </p>
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">ยอดขายต่อเดือน</h2>
            <p className="text-gray-500 text-sm">แสดงข้อมูลย้อนหลัง 12 เดือน</p>
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
        <div className="h-[400px]">
          <SalesChart />
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">รายการซื้อล่าสุด</h2>
              <p className="text-gray-500 text-sm">อัพเดทล่าสุดเมื่อ 3 นาทีที่แล้ว</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
              ดูทั้งหมด
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 border-b">รหัส</th>
                  <th className="px-4 py-3 border-b">ชื่อ</th>
                  <th className="px-4 py-3 border-b">วันที่</th>
                  <th className="px-4 py-3 border-b">ชื่อลูกค้า</th>
                  <th className="px-4 py-3 border-b">ต้นทุน</th>
                  <th className="px-4 py-3 border-b">ราคาขาย</th>
                  <th className="px-4 py-3 border-b">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : recentPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      ไม่พบข้อมูลการซื้อ
                    </td>
                  </tr>
                ) : (
                  recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{purchase.purchaseCode}</td>
                      <td className="px-4 py-3 text-sm">{purchase.garden.name}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(purchase.purchaseDate)}</td>
                      <td className="px-4 py-3 text-sm">-</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(purchase.totalCost)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{purchase._count.products} ต้น</td>
                      <td className="px-4 py-3 text-sm">
                        <a href={`/admin/purchases`} className="text-blue-600 hover:text-blue-800">
                          ดูรายละเอียด
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">รายการขายล่าสุด</h2>
              <p className="text-gray-500 text-sm">อัพเดทล่าสุดเมื่อ 5 นาทีที่แล้ว</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
              ดูทั้งหมด
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 border-b">รหัส</th>
                  <th className="px-4 py-3 border-b">ชื่อ</th>
                  <th className="px-4 py-3 border-b">วันที่</th>
                  <th className="px-4 py-3 border-b">ลูกค้า</th>
                  <th className="px-4 py-3 border-b">ต้นทุน</th>
                  <th className="px-4 py-3 border-b">ราคาขาย</th>
                  <th className="px-4 py-3 border-b">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">S1234</td>
                    <td className="px-4 py-3 text-sm">ปาล์ม</td>
                    <td className="px-4 py-3 text-sm">12/12/2024</td>
                    <td className="px-4 py-3 text-sm">นาย ก</td>
                    <td className="px-4 py-3 text-sm">฿10,000</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">฿20,000</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 