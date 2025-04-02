'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type TreeType = {
  id: string
  name: string
  date: string
  customer: string
  cost: number
  price: number
}

export default function StockPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    code: '',
    name: '',
    dateFrom: '',
    dateTo: '',
    priceFrom: '',
    priceTo: ''
  })
  
  // ข้อมูลตัวอย่าง
  const trees: TreeType[] = [
    { id: 'T1234', name: 'ปาล์ม', date: '12/12/2024', customer: 'นาย ก', cost: 10000, price: 20000 },
    { id: 'T1045', name: 'กระถิน', date: '16/03/2024', customer: 'นาย ก', cost: 10000, price: 20000 },
    { id: 'T5214', name: 'พยอม', date: '9/12/2032', customer: 'นาย จ', cost: 45000, price: 55000 },
    { id: 'T1022', name: 'ปาล์ม', date: '23/02/2024', customer: 'นาย จ', cost: 10000, price: 25000 },
    { id: 'T8587', name: 'พยอม', date: '14/08/2022', customer: 'นาย จ', cost: 50000, price: 55000 },
  ]

  // สรุปจำนวนต้นไม้แต่ละชนิด
  const treeSummary = trees.reduce((acc, tree) => {
    acc[tree.name] = (acc[tree.name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Filter trees based on search
  const filteredTrees = trees.filter(tree => {
    const matchesCode = filters.code ? tree.id.toLowerCase().includes(filters.code.toLowerCase()) : true
    const matchesName = filters.name ? tree.name === filters.name : true
    
    // ตรวจสอบช่วงวันที่
    let matchesDateRange = true
    if (filters.dateFrom && filters.dateTo) {
      const treeDate = new Date(tree.date.split('/').reverse().join('-'))
      const fromDate = new Date(filters.dateFrom)
      const toDate = new Date(filters.dateTo)
      matchesDateRange = treeDate >= fromDate && treeDate <= toDate
    }
    
    // ตรวจสอบช่วงราคา
    let matchesPriceRange = true
    if (filters.priceFrom && filters.priceTo) {
      const priceFrom = Number(filters.priceFrom)
      const priceTo = Number(filters.priceTo)
      matchesPriceRange = tree.price >= priceFrom && tree.price <= priceTo
    }
    
    return matchesCode && matchesName && matchesDateRange && matchesPriceRange
  })

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredTrees.length / itemsPerPage)
  const currentItems = filteredTrees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
      dateFrom: '',
      dateTo: '',
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

      {/* สรุปจำนวนต้นไม้ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">จำนวนต้นไม้ทั้งหมด</h3>
          <p className="text-2xl font-bold text-gray-800">{trees.length} ต้น</p>
        </div>
        
        {Object.entries(treeSummary).map(([name, count], index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-2">{name}</h3>
            <p className="text-2xl font-bold text-gray-800">{count} ต้น</p>
          </div>
        ))}
      </div>

      {/* ฟอร์มค้นหา */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ค้นหาต้นไม้</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {Array.from(new Set(trees.map(tree => tree.name))).map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-1">
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
            
            <div className="flex items-end gap-2">
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
                <th className="px-4 py-3 border-b">ชื่อ</th>
                <th className="px-4 py-3 border-b">วันที่</th>
                <th className="px-4 py-3 border-b">ซื้อจาก</th>
                <th className="px-4 py-3 border-b">ต้นทุน</th>
                <th className="px-4 py-3 border-b">ราคาขาย</th>
                <th className="px-4 py-3 border-b">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((tree, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{tree.id}</td>
                  <td className="px-4 py-3 text-sm">{tree.name}</td>
                  <td className="px-4 py-3 text-sm">{tree.date}</td>
                  <td className="px-4 py-3 text-sm">{tree.customer}</td>
                  <td className="px-4 py-3 text-sm">{tree.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">{tree.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-center border-t">
            <nav className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
} 