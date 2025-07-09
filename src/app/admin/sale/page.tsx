'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

type Product = {
  id: string
  code: string
  name: string
  description?: string
  price: number
  cost: number
  status: string
  height?: number
  width?: number
  location?: string
  ourGarden?: {
    name: string
  }
  images?: {
    url: string
    isMain: boolean
  }[]
}

export default function SalePage() {
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    dateFrom: '',
    dateTo: '',
    priceFrom: '',
    priceTo: ''
  })

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?status=AVAILABLE', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search logic
  }

  const resetFilters = () => {
    setFilters({
      code: '',
      name: '',
      dateFrom: '',
      dateTo: '',
      priceFrom: '',
      priceTo: ''
    })
  }

  const setCurrentYear = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
    setFilters(prev => ({
      ...prev,
      dateFrom: startOfYear,
      dateTo: endOfYear
    }))
  }

  const setLastYear = () => {
    const now = new Date()
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0]
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0]
    setFilters(prev => ({
      ...prev,
      dateFrom: startOfLastYear,
      dateTo: endOfLastYear
    }))
  }

  // สถานะสำหรับตะกร้าสินค้า
  const [cart, setCart] = useState<{
    items: { product: Product; quantity: number }[];
    shipping: number;
    total: number;
  }>({
    items: [],
    shipping: 5000,
    total: 0
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ขายต้นไม้</h1>

      {/* ฟอร์มค้นหา */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ค้นหาต้นไม้</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">รหัสต้นไม้</label>
              <input
                type="text"
                name="code"
                value={filters.code}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="ค้นหาจากรหัส"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ชื่อต้นไม้</label>
              <select
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">ทั้งหมด</option>
                {Array.from(new Set(products.map(product => product.name))).map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ช่วงวันที่</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={setCurrentYear}
                    className="px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    ปีนี้
                  </button>
                  <button
                    type="button"
                    onClick={setLastYear}
                    className="px-4 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ปีที่แล้ว
                  </button>
                </div>
              </div>
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
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              รีเซ็ต
            </button>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {loading ? (
          <div className="col-span-4 text-center py-8">กำลังโหลด...</div>
        ) : products.length === 0 ? (
          <div className="col-span-4 text-center py-8 text-gray-500">ไม่พบสินค้า</div>
        ) : (
          products.map((product, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            {/* รูปหลัก */}
            <div className="aspect-square bg-gray-100 mb-2 relative rounded-lg overflow-hidden">
              <Image
                src={product.images?.[0]?.url || '/placeholder-tree.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 4}
                unoptimized
              />
            </div>
            {/* ข้อมูลสินค้า */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>รหัส</span>
                <span>{product.code}</span>
              </div>
              <div className="flex justify-between">
                <span>ชื่อ</span>
                <span>{product.name}</span>
              </div>
              <div className="text-center text-red-600 font-bold text-xl">
                {product.price.toLocaleString()}
              </div>
              <button className="w-full py-1 bg-green-600 text-white rounded flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                เลือก
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Cart Icon */}
      <div className="fixed right-6 top-20">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cart.items.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart Popup */}
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Cart Modal */}
          <div className="fixed right-6 top-32 w-96 bg-white rounded-lg shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">รายการที่เลือก</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  ยังไม่มีรายการที่เลือก
                </div>
              ) : (
                cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500">รหัส: {item.product.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        ฿{item.product.price.toLocaleString()}
                      </div>
                      <button className="text-red-500 text-sm hover:text-red-700">
                        ลบ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>ค่าขนส่ง</span>
                <span>฿{cart.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>ค่าติดตั้ง</span>
                <span>฿{cart.shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-red-600 mt-2 pt-2 border-t">
                <span>รวมทั้งหมด</span>
                <span>฿{(500000).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => {
                  // TODO: Implement checkout logic
                  setIsCartOpen(false)
                }}
              >
                ดำเนินการต่อ
              </button>
              <button 
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  // TODO: Implement clear cart logic
                  setIsCartOpen(false)
                }}
              >
                ยกเลิกทั้งหมด
              </button>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button className="px-3 py-1 border rounded">&lt;</button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded ${
              page === 1 ? 'bg-blue-500 text-white' : 'border'
            }`}
          >
            {page}
          </button>
        ))}
        <button className="px-3 py-1 border rounded">&gt;</button>
      </div>
    </div>
  )
} 