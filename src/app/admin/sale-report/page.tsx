'use client'
import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import StatusBadge from '@/components/admin/StatusBadge'
import ProfitIndicator from '@/components/admin/ProfitIndicator'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface Sale {
  id: string
  price: number
  totalCost: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  product: {
    id: string
    code: string
    name: string
    cost: number
    price: number
  }
  customer: {
    id: string
    name: string
    phone?: string
  }
}

interface SalesData {
  sales: Sale[]
  summary: {
    totalSales: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
    averageProfit: number
    profitMargin: number
  }
}

export default function SaleReportPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month') // month, quarter, year
  const [selectedStatus, setSelectedStatus] = useState('COMPLETED')
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    search: '',
    status: 'COMPLETED'
  })

  useEffect(() => {
    fetchSalesData()
  }, [filters, selectedPeriod])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.dateFrom && { startDate: filters.dateFrom }),
        ...(filters.dateTo && { endDate: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      })

      const response = await fetch(`/api/sales?${params}`)
      const data = await response.json()

      if (response.ok) {
        // Calculate summary data
        const completedSales = data.filter((sale: Sale) => sale.status === 'COMPLETED')
        const summary = {
          totalSales: completedSales.length,
          totalRevenue: completedSales.reduce((sum: number, sale: Sale) => sum + sale.totalCost, 0),
          totalCost: completedSales.reduce((sum: number, sale: Sale) => sum + sale.product.cost, 0),
          totalProfit: completedSales.reduce((sum: number, sale: Sale) => sum + (sale.totalCost - sale.product.cost), 0),
          averageProfit: 0,
          profitMargin: 0
        }
        summary.averageProfit = summary.totalSales > 0 ? summary.totalProfit / summary.totalSales : 0
        summary.profitMargin = summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0

        setSalesData({
          sales: data,
          summary
        })
      } else {
        console.error('Error fetching sales data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      // Set fallback data for development
      setSalesData({
        sales: [],
        summary: {
          totalSales: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          averageProfit: 0,
          profitMargin: 0
        }
      })
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

  // Chart data for profit analysis
  const getProfitChartData = () => {
    if (!salesData) return { labels: [], datasets: [] }

    const monthlyData = salesData.sales
      .filter(sale => sale.status === 'COMPLETED')
      .reduce((acc, sale) => {
        const month = new Date(sale.createdAt).toISOString().slice(0, 7)
        if (!acc[month]) {
          acc[month] = { revenue: 0, cost: 0, profit: 0 }
        }
        acc[month].revenue += sale.totalCost
        acc[month].cost += sale.product.cost
        acc[month].profit += (sale.totalCost - sale.product.cost)
        return acc
      }, {} as Record<string, { revenue: number; cost: number; profit: number }>)

    const labels = Object.keys(monthlyData).sort()
    
    return {
      labels: labels.map(label => new Date(label + '-01').toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })),
      datasets: [
        {
          label: 'รายได้',
          data: labels.map(label => monthlyData[label].revenue),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'ต้นทุน',
          data: labels.map(label => monthlyData[label].cost),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
        {
          label: 'กำไร',
          data: labels.map(label => monthlyData[label].profit),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }
      ]
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      search: '',
      status: 'COMPLETED'
    })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'วิเคราะห์กำไรรายเดือน',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายงานการขาย & วิเคราะห์กำไร</h1>
          <p className="text-gray-600">วิเคราะห์ผลการขายและกำไรจากการดำเนินงาน</p>
        </div>
      </div>

      {/* Summary Cards */}
      {salesData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-800 font-medium">ยอดขายรวม</h3>
              <span className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.summary.totalRevenue)}</p>
            <p className="text-green-600 text-sm mt-2">{salesData.summary.totalSales} รายการ</p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-800 font-medium">ต้นทุนรวม</h3>
              <span className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.summary.totalCost)}</p>
            <p className="text-red-600 text-sm mt-2">ต้นทุนทั้งหมด</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-800 font-medium">กำไรรวม</h3>
              <span className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.summary.totalProfit)}</p>
            <p className="text-blue-600 text-sm mt-2">{salesData.summary.profitMargin.toFixed(1)}% อัตรากำไร</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-800 font-medium">กำไรเฉลี่ย</h3>
              <span className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(salesData.summary.averageProfit)}</p>
            <p className="text-purple-600 text-sm mt-2">ต่อรายการ</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ตัวกรองข้อมูล</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">ค้นหา</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="รหัสสินค้า, ชื่อลูกค้า..."
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
              <option value="COMPLETED">เสร็จสิ้น</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">วันที่เริ่ม</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">วันที่สิ้นสุด</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* Chart */}
      {salesData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">วิเคราะห์กำไรรายเดือน</h2>
          <div className="h-96">
            <Bar data={getProfitChartData()} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">รายการขาย</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-3 border-b">รหัสสินค้า</th>
                <th className="px-6 py-3 border-b">ชื่อสินค้า</th>
                <th className="px-6 py-3 border-b">ลูกค้า</th>
                <th className="px-6 py-3 border-b">วันที่ขาย</th>
                <th className="px-6 py-3 border-b">ต้นทุน</th>
                <th className="px-6 py-3 border-b">ราคาขาย</th>
                <th className="px-6 py-3 border-b">กำไร</th>
                <th className="px-6 py-3 border-b">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : !salesData || salesData.sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลการขาย
                  </td>
                </tr>
              ) : (
                salesData.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{sale.product.code}</td>
                    <td className="px-6 py-4 text-sm">{sale.product.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{sale.customer.name}</div>
                        {sale.customer.phone && (
                          <div className="text-gray-500 text-xs">{sale.customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">{formatCurrency(sale.product.cost)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(sale.totalCost)}</td>
                    <td className="px-6 py-4 text-sm">
                      <ProfitIndicator 
                        cost={sale.product.cost} 
                        revenue={sale.totalCost} 
                        size="sm" 
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={sale.status} type="sale" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 