'use client'
import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement)

interface Garden {
  id: string
  name: string
  location?: string
  ownerName?: string
}

interface CostSummary {
  totalPurchases: number
  totalCost: number
  totalProducts: number
  totalSales: number
  totalRevenue: number
  grossProfit: number
  profitMargin: number
  avgCostPerProduct: number
}

interface CategoryData {
  category: string
  categoryEn?: string
  totalAmount: number
  transactionCount: number
  percentage: number
}

interface GardenData {
  garden: string
  location?: string
  ownerName?: string
  totalCost: number
  purchaseCount: number
  percentage: number
}

interface MonthlyData {
  month: string
  totalCost: number
  purchaseCount: number
  avgCostPerPurchase: number
}

interface ProfitProduct {
  productId: string
  productCode: string
  productName: string
  cost: number
  price: number
  totalRevenue: number
  profit: number
  profitMargin: number
  status: string
  garden: string
  salesCount: number
}

interface ProfitAnalysis {
  products: ProfitProduct[]
  summary: {
    totalCost: number
    totalRevenue: number
    totalProfit: number
    totalProfitMargin: number
    soldProducts: number
  }
}

export default function CostAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'byCategory' | 'byGarden' | 'byMonth' | 'profit'>('summary')
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGarden, setSelectedGarden] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  // Data states
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [gardenData, setGardenData] = useState<GardenData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis | null>(null)

  useEffect(() => {
    fetchGardens()
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab) {
      fetchData()
    }
  }, [activeTab, selectedGarden, startDate, endDate])

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

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: activeTab,
        ...(selectedGarden && { gardenId: selectedGarden }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(`/api/cost-analysis?${params}`)
      const data = await response.json()

      if (response.ok) {
        switch (activeTab) {
          case 'summary':
            setCostSummary(data.summary)
            break
          case 'byCategory':
            setCategoryData(data.categories)
            break
          case 'byGarden':
            setGardenData(data.gardens)
            break
          case 'byMonth':
            setMonthlyData(data.monthlyData)
            break
          case 'profit':
            setProfitAnalysis(data)
            break
        }
      }
    } catch (error) {
      console.error('Error fetching analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Chart data preparations
  const getCategoryChartData = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ]
    
    return {
      labels: categoryData.map(item => item.category),
      datasets: [{
        data: categoryData.map(item => item.totalAmount),
        backgroundColor: colors.slice(0, categoryData.length),
        borderWidth: 1,
      }]
    }
  }

  const getGardenChartData = () => {
    return {
      labels: gardenData.map(item => item.garden),
      datasets: [{
        label: 'ยอดรวม (บาท)',
        data: gardenData.map(item => item.totalCost),
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
      }]
    }
  }

  const getMonthlyChartData = () => {
    return {
      labels: monthlyData.map(item => item.month),
      datasets: [{
        label: 'ยอดรวม (บาท)',
        data: monthlyData.map(item => item.totalCost),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1,
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">วิเคราะห์ต้นทุน</h1>
          <p className="text-gray-600">วิเคราะห์ต้นทุนและกำไรจากการซื้อขายไม้</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              วันที่เริ่ม
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              อัพเดท
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'summary', label: 'สรุปรวม' },
              { id: 'byCategory', label: 'ตามหมวดหมู่' },
              { id: 'byGarden', label: 'ตามสวน' },
              { id: 'byMonth', label: 'รายเดือน' },
              { id: 'profit', label: 'วิเคราะห์กำไร' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              {/* Summary Tab */}
              {activeTab === 'summary' && costSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ยอดซื้อรวม</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(costSummary.totalCost)}</p>
                      </div>
                      <div className="text-blue-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{costSummary.totalPurchases} ครั้ง</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(costSummary.totalRevenue)}</p>
                      </div>
                      <div className="text-green-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{costSummary.totalSales} ครั้ง</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">กำไรรวม</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(costSummary.grossProfit)}</p>
                      </div>
                      <div className="text-purple-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{formatPercentage(costSummary.profitMargin)}</p>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ต้นทุนเฉลี่ย</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(costSummary.avgCostPerProduct)}</p>
                      </div>
                      <div className="text-amber-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{costSummary.totalProducts} ต้น</p>
                  </div>
                </div>
              )}

              {/* Category Tab */}
              {activeTab === 'byCategory' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ต้นทุนตามหมวดหมู่</h3>
                    <div className="h-64">
                      {categoryData.length > 0 && (
                        <Pie data={getCategoryChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">รายละเอียดตามหมวดหมู่</h3>
                    <div className="space-y-3">
                      {categoryData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.category}</p>
                            <p className="text-sm text-gray-600">{item.transactionCount} รายการ</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.totalAmount)}</p>
                            <p className="text-sm text-gray-600">{formatPercentage(item.percentage)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Garden Tab */}
              {activeTab === 'byGarden' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">ต้นทุนตามสวน</h3>
                    <div className="h-64">
                      {gardenData.length > 0 && (
                        <Bar data={getGardenChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">รายละเอียดตามสวน</h3>
                    <div className="space-y-3">
                      {gardenData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.garden}</p>
                            <p className="text-sm text-gray-600">{item.ownerName} - {item.purchaseCount} ครั้ง</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.totalCost)}</p>
                            <p className="text-sm text-gray-600">{formatPercentage(item.percentage)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly Tab */}
              {activeTab === 'byMonth' && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ต้นทุนรายเดือน</h3>
                  <div className="h-64 mb-6">
                    {monthlyData.length > 0 && (
                      <Line data={getMonthlyChartData()} options={chartOptions} />
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">เดือน</th>
                          <th className="px-4 py-2 text-right">ยอดรวม</th>
                          <th className="px-4 py-2 text-right">จำนวนครั้ง</th>
                          <th className="px-4 py-2 text-right">เฉลี่ย/ครั้ง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthlyData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">{item.month}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.totalCost)}</td>
                            <td className="px-4 py-2 text-right">{item.purchaseCount}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.avgCostPerPurchase)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Profit Tab */}
              {activeTab === 'profit' && profitAnalysis && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">ต้นทุนรวม</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(profitAnalysis.summary.totalCost)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">รายได้รวม</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(profitAnalysis.summary.totalRevenue)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">กำไรรวม</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(profitAnalysis.summary.totalProfit)}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">อัตรากำไร</p>
                      <p className="text-xl font-bold text-gray-900">{formatPercentage(profitAnalysis.summary.totalProfitMargin)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">รายละเอียดกำไรรายต้น</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">รหัสไม้</th>
                            <th className="px-4 py-2 text-left">ชื่อไม้</th>
                            <th className="px-4 py-2 text-left">สวน</th>
                            <th className="px-4 py-2 text-right">ต้นทุน</th>
                            <th className="px-4 py-2 text-right">ราคาตั้ง</th>
                            <th className="px-4 py-2 text-right">รายได้</th>
                            <th className="px-4 py-2 text-right">กำไร</th>
                            <th className="px-4 py-2 text-right">อัตรากำไร</th>
                            <th className="px-4 py-2 text-center">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {profitAnalysis.products.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{product.productCode}</td>
                              <td className="px-4 py-2">{product.productName}</td>
                              <td className="px-4 py-2">{product.garden}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(product.cost)}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(product.price)}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(product.totalRevenue)}</td>
                              <td className={`px-4 py-2 text-right font-medium ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(product.profit)}
                              </td>
                              <td className={`px-4 py-2 text-right font-medium ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(product.profitMargin)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.status === 'SOLD' ? 'bg-green-100 text-green-800' :
                                  product.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}