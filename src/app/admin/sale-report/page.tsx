'use client'
import React, { useState } from 'react'

type SaleType = {
  id: string
  treeName: string
  saleDate: string
  customer: string
  price: number
  profit: number
}

export default function SaleReportPage() {
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    dateFrom: '',
    dateTo: '',
    priceFrom: '',
    priceTo: ''
  })

  // ข้อมูลตัวอย่าง
  const sales: SaleType[] = [
    { id: 'T1234', treeName: 'ปาล์ม', saleDate: '2024-03-15', customer: 'นาย ก', price: 20000, profit: 10000 },
    { id: 'T1045', treeName: 'กระถิน', saleDate: '2024-03-16', customer: 'นาย ข', price: 15000, profit: 5000 },
    { id: 'T5214', treeName: 'พยอม', saleDate: '2024-03-17', customer: 'นาย ค', price: 55000, profit: 10000 },
    { id: 'T1022', treeName: 'ปาล์ม', saleDate: '2024-03-18', customer: 'นาย ง', price: 25000, profit: 15000 },
    { id: 'T8587', treeName: 'พยอม', saleDate: '2024-03-19', customer: 'นาย จ', price: 55000, profit: 5000 },
  ]

  // กรองข้อมูล
  const filteredSales = sales.filter(sale => {
    const matchesCode = filters.code ? sale.id.toLowerCase().includes(filters.code.toLowerCase()) : true
    const matchesName = filters.name ? sale.treeName === filters.name : true
    
    let matchesDateRange = true
    if (filters.dateFrom && filters.dateTo) {
      const saleDate = new Date(sale.saleDate)
      const fromDate = new Date(filters.dateFrom)
      const toDate = new Date(filters.dateTo)
      matchesDateRange = saleDate >= fromDate && saleDate <= toDate
    }
    
    let matchesPriceRange = true
    if (filters.priceFrom && filters.priceTo) {
      const priceFrom = Number(filters.priceFrom)
      const priceTo = Number(filters.priceTo)
      matchesPriceRange = sale.price >= priceFrom && sale.price <= priceTo
    }
    
    return matchesCode && matchesName && matchesDateRange && matchesPriceRange
  })

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">รายงานการขาย</h1>

      {/* ฟอร์มค้นหา */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ค้นหารายการขาย</h2>
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
                {Array.from(new Set(sales.map(sale => sale.treeName))).map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ช่วงวันที่</label>
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

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3 border-b">รหัส</th>
                <th className="px-4 py-3 border-b">ชื่อต้นไม้</th>
                <th className="px-4 py-3 border-b">วันที่ขาย</th>
                <th className="px-4 py-3 border-b">ลูกค้า</th>
                <th className="px-4 py-3 border-b">ราคาขาย</th>
                <th className="px-4 py-3 border-b">กำไร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sale.id}</td>
                  <td className="px-4 py-3 text-sm">{sale.treeName}</td>
                  <td className="px-4 py-3 text-sm">{new Date(sale.saleDate).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 text-sm">{sale.customer}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{sale.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{sale.profit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 