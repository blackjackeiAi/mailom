'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import ProfitIndicator from '@/components/admin/ProfitIndicator'
import CostBreakdown from '@/components/admin/CostBreakdown'

interface Product {
  id: string
  code: string
  name: string
  description?: string
  height?: number
  width?: number
  cost: number
  price: number
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEAD'
  location?: string
  createdAt: string
  purchase?: {
    id: string
    purchaseCode: string
    garden: {
      name: string
      ownerName?: string
    }
    productCosts: Array<{
      amount: number
      description?: string
      costCategory: {
        name: string
      }
    }>
  }
}

export default function StockPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    status: '',
    priceFrom: '',
    priceTo: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [currentPage, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.code && { search: filters.code }),
        ...(filters.status && { status: filters.status }),
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        console.error('Error fetching products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // สรุปข้อมูลสินค้า
  const productSummary = {
    total: products.length,
    available: products.filter(p => p.status === 'AVAILABLE').length,
    sold: products.filter(p => p.status === 'SOLD').length,
    reserved: products.filter(p => p.status === 'RESERVED').length,
    dead: products.filter(p => p.status === 'DEAD').length,
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

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product)
    setShowDetailModal(true)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const resetFilters = () => {
    setFilters({
      code: '',
      name: '',
      status: '',
      priceFrom: '',
      priceTo: ''
    })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">สต็อกต้นไม้</h1>
        <button 
          onClick={() => router.push('/admin/stock/create')}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          เพิ่มข้อมูล
        </button>
      </div>

      {/* สรุปข้อมูลสินค้า */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-blue-800 text-sm font-medium mb-2">ทั้งหมด</h3>
          <p className="text-2xl font-bold text-gray-800">{productSummary.total} ต้น</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100">
          <h3 className="text-green-800 text-sm font-medium mb-2">พร้อมขาย</h3>
          <p className="text-2xl font-bold text-gray-800">{productSummary.available} ต้น</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-blue-800 text-sm font-medium mb-2">ขายแล้ว</h3>
          <p className="text-2xl font-bold text-gray-800">{productSummary.sold} ต้น</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl shadow-sm border border-yellow-100">
          <h3 className="text-yellow-800 text-sm font-medium mb-2">จองแล้ว</h3>
          <p className="text-2xl font-bold text-gray-800">{productSummary.reserved} ต้น</p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl shadow-sm border border-red-100">
          <h3 className="text-red-800 text-sm font-medium mb-2">ไม้ตาย</h3>
          <p className="text-2xl font-bold text-gray-800">{productSummary.dead} ต้น</p>
        </div>
      </div>

      {/* ฟอร์มค้นหา */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ค้นหาต้นไม้</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">รหัสสินค้า</label>
            <input
              type="text"
              name="code"
              value={filters.code}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ค้นหาจากรหัสหรือชื่อ"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">สถานะ</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="AVAILABLE">พร้อมขาย</option>
              <option value="SOLD">ขายแล้ว</option>
              <option value="RESERVED">จองแล้ว</option>
              <option value="DEAD">ไม้ตาย</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">ช่วงราคา</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="priceFrom"
                value={filters.priceFrom}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="จาก"
              />
              <input
                type="number"
                name="priceTo"
                value={filters.priceTo}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="ถึง"
              />
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ค้นหา
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3 border-b">รหัส</th>
                <th className="px-4 py-3 border-b">ชื่อ</th>
                <th className="px-4 py-3 border-b">สวน</th>
                <th className="px-4 py-3 border-b">ต้นทุน</th>
                <th className="px-4 py-3 border-b">ราคาขาย</th>
                <th className="px-4 py-3 border-b">กำไร</th>
                <th className="px-4 py-3 border-b">สถานะ</th>
                <th className="px-4 py-3 border-b">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{product.code}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.purchase ? (
                        <div>
                          <div className="text-gray-900">{product.purchase.garden.name}</div>
                          <div className="text-gray-500 text-xs">{product.purchase.garden.ownerName}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(product.cost)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 text-sm">
                      <ProfitIndicator cost={product.cost} revenue={product.price} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={product.status} type="product" />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetail(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div>
              <p className="text-sm text-gray-700">
                หน้า <span className="font-medium">{currentPage}</span> จาก{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <nav className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page ? 'bg-green-500 text-white' : 'border hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                ถัดไป
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  รายละเอียดสินค้า: {selectedProduct.code}
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
                {/* Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">ข้อมูลสินค้า</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">รหัส:</span> {selectedProduct.code}</div>
                    <div><span className="font-medium">ชื่อ:</span> {selectedProduct.name}</div>
                    {selectedProduct.description && (
                      <div><span className="font-medium">รายละเอียด:</span> {selectedProduct.description}</div>
                    )}
                    {selectedProduct.height && (
                      <div><span className="font-medium">ความสูง:</span> {selectedProduct.height} เมตร</div>
                    )}
                    {selectedProduct.width && (
                      <div><span className="font-medium">หน้าไม้:</span> {selectedProduct.width} นิ้ว</div>
                    )}
                    {selectedProduct.location && (
                      <div><span className="font-medium">ที่อยู่:</span> {selectedProduct.location}</div>
                    )}
                    <div><span className="font-medium">วันที่เพิ่ม:</span> {formatDate(selectedProduct.createdAt)}</div>
                  </div>
                </div>

                {/* Cost & Pricing */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">ราคาและต้นทุน</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ต้นทุน:</span> {formatCurrency(selectedProduct.cost)}</div>
                    <div><span className="font-medium">ราคาขาย:</span> {formatCurrency(selectedProduct.price)}</div>
                    <div><span className="font-medium">กำไรคาดการณ์:</span> {formatCurrency(selectedProduct.price - selectedProduct.cost)}</div>
                    <div><span className="font-medium">อัตรากำไร:</span> {((selectedProduct.price - selectedProduct.cost) / selectedProduct.price * 100).toFixed(1)}%</div>
                    <div><span className="font-medium">สถานะ:</span> <StatusBadge status={selectedProduct.status} type="product" /></div>
                  </div>
                </div>
              </div>

              {/* Purchase Info & Cost Breakdown */}
              {selectedProduct.purchase && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">ข้อมูลการซื้อ</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">รหัสการซื้อ:</span> {selectedProduct.purchase.purchaseCode}</div>
                      <div><span className="font-medium">สวน:</span> {selectedProduct.purchase.garden.name}</div>
                      {selectedProduct.purchase.garden.ownerName && (
                        <div><span className="font-medium">เจ้าของสวน:</span> {selectedProduct.purchase.garden.ownerName}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <CostBreakdown 
                      costs={selectedProduct.purchase.productCosts.map(cost => ({
                        category: cost.costCategory.name,
                        amount: cost.amount,
                        description: cost.description
                      }))}
                      totalCost={selectedProduct.purchase.productCosts.reduce((sum, cost) => sum + cost.amount, 0)}
                      title="รายละเอียดต้นทุน"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 