'use client'
import React, { useState, useEffect } from 'react'

interface Garden {
  id: string
  name: string
  location?: string
  ownerName?: string
}

interface CostCategory {
  id: string
  name: string
  nameEn?: string
}

interface ProductCost {
  id: string
  amount: number
  description?: string
  costCategory: CostCategory
}

interface Purchase {
  id: string
  purchaseCode: string
  purchaseDate: string
  supplierRef?: string
  totalCost: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  note?: string
  garden: Garden
  productCosts: ProductCost[]
  products: Array<{
    id: string
    code: string
    name: string
    status: string
  }>
  metrics: {
    totalCostFromBreakdown: number
    costByCategory: Record<string, number>
    productCount: number
    costPerProduct: number
  }
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [gardens, setGardens] = useState<Garden[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGarden, setSelectedGarden] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchGardens()
    fetchPurchases()
  }, [currentPage, searchTerm, selectedGarden, selectedStatus])

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

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGarden && { gardenId: selectedGarden }),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const response = await fetch(`/api/purchases?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPurchases(data.data)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Error fetching purchases:', data.error)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (purchase: Purchase) => {
    try {
      const response = await fetch(`/api/purchases/${purchase.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedPurchase(data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'รอดำเนินการ'
      case 'COMPLETED':
        return 'เสร็จสิ้น'
      case 'CANCELLED':
        return 'ยกเลิก'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายการซื้อไม้</h1>
          <p className="text-gray-600">ดูข้อมูลการซื้อไม้พร้อมการแยกต้นทุน</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ค้นหา
            </label>
            <input
              type="text"
              placeholder="รหัสการซื้อ, ผู้ขาย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สวน
            </label>
            <select
              value={selectedGarden}
              onChange={(e) => setSelectedGarden(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {gardens.map((garden) => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setCurrentPage(1)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสการซื้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สวน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ขาย
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนไม้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    ไม่พบข้อมูลการซื้อ
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.purchaseCode}
                      </div>
                      {purchase.note && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {purchase.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.garden.name}</div>
                      <div className="text-sm text-gray-500">
                        {purchase.garden.ownerName || purchase.garden.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.supplierRef || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(purchase.totalCost)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(purchase.metrics.costPerProduct)}/ต้น
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.metrics.productCount} ต้น
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                        {getStatusText(purchase.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(purchase)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดงหน้า <span className="font-medium">{currentPage}</span> จาก{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  รายละเอียดการซื้อ: {selectedPurchase.purchaseCode}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Purchase Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">ข้อมูลการซื้อ</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">รหัส:</span> {selectedPurchase.purchaseCode}</div>
                    <div><span className="font-medium">วันที่:</span> {formatDate(selectedPurchase.purchaseDate)}</div>
                    <div><span className="font-medium">สวน:</span> {selectedPurchase.garden.name}</div>
                    <div><span className="font-medium">ผู้ขาย:</span> {selectedPurchase.supplierRef || '-'}</div>
                    <div><span className="font-medium">ยอดรวม:</span> {formatCurrency(selectedPurchase.totalCost)}</div>
                    <div><span className="font-medium">สถานะ:</span> {getStatusText(selectedPurchase.status)}</div>
                    {selectedPurchase.note && (
                      <div><span className="font-medium">หมายเหตุ:</span> {selectedPurchase.note}</div>
                    )}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">สรุปต้นทุน</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">จำนวนไม้:</span> {selectedPurchase.metrics.productCount} ต้น</div>
                    <div><span className="font-medium">ต้นทุนเฉลี่ย:</span> {formatCurrency(selectedPurchase.metrics.costPerProduct)}/ต้น</div>
                    <div><span className="font-medium">ต้นทุนจากรายละเอียด:</span> {formatCurrency(selectedPurchase.metrics.totalCostFromBreakdown)}</div>
                    <div><span className="font-medium">ส่วนต่าง:</span> {formatCurrency(selectedPurchase.totalCost - selectedPurchase.metrics.totalCostFromBreakdown)}</div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">รายละเอียดต้นทุน</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">หมวดหมู่</th>
                        <th className="px-4 py-2 text-right">จำนวน</th>
                        <th className="px-4 py-2 text-left">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPurchase.productCosts.map((cost) => (
                        <tr key={cost.id}>
                          <td className="px-4 py-2">{cost.costCategory.name}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(cost.amount)}</td>
                          <td className="px-4 py-2">{cost.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">ไม้ที่ได้รับ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPurchase.products.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium">{product.code}</div>
                      <div className="text-sm text-gray-600">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}