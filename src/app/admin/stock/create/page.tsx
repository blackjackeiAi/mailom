'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Garden {
  id: string
  name: string
  location: string
  ownerName: string
}

interface CostCategory {
  id: string
  name: string
}

export default function CreateStock() {
  const router = useRouter()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [costCategories, setCostCategories] = useState<CostCategory[]>([])
  const [treeNames, setTreeNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // ข้อมูลสินค้า
  const [productData, setProductData] = useState({
    code: '',
    name: '',
    description: '',
    height: '',
    width: '',
    trunkSize: '',
    potHeight: '',
    potWidth: '',
    location: '',
    sunlight: 'FULL',
    water: 'MEDIUM',
    price: ''
  })

  // ข้อมูลการซื้อ
  const [purchaseData, setPurchaseData] = useState({
    purchaseCode: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplierGardenId: '',
    supplierRef: '',
    note: ''
  })

  // รายละเอียดต้นทุน
  const [costs, setCosts] = useState<{categoryId: string, amount: string, description: string}[]>([
    { categoryId: '', amount: '', description: '' }
  ])

  useEffect(() => {
    fetchGardens()
    fetchCostCategories()
    fetchTreeNames()
    generateCodes()
  }, [])

  // Auto-generate codes
  const generateCodes = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const purchaseCode = `PU${year}${month}-${random}`
    const productCode = `PR${year}${month}-${random}`
    
    setPurchaseData(prev => ({ ...prev, purchaseCode }))
    setProductData(prev => ({ ...prev, code: productCode }))
  }

  const fetchGardens = async () => {
    try {
      const response = await fetch('/api/supplier-gardens', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGardens(data.data)
      }
    } catch (error) {
      console.error('Error fetching gardens:', error)
    }
  }

  const fetchCostCategories = async () => {
    try {
      const response = await fetch('/api/cost-categories', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCostCategories(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching cost categories:', error)
    }
  }

  const fetchTreeNames = async () => {
    try {
      const response = await fetch('/api/tree-names', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTreeNames(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tree names:', error)
      // Default tree names if API fails
      setTreeNames(['ปาล์ม', 'กระถิน', 'พยอม', 'ไผ่ตง', 'มะขาม', 'ยางพารา'])
    }
  }

  const addCostRow = () => {
    setCosts([...costs, { categoryId: '', amount: '', description: '' }])
  }

  const removeCostRow = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index))
  }

  const updateCost = (index: number, field: string, value: string) => {
    const newCosts = [...costs]
    newCosts[index] = { ...newCosts[index], [field]: value }
    setCosts(newCosts)
  }

  const handleAddCostCategory = async (costIndex: number) => {
    const categoryName = prompt('กรุณาใส่ชื่อหมวดหมู่ค่าใช้จ่ายใหม่:')
    
    if (categoryName && categoryName.trim()) {
      try {
        const response = await fetch('/api/cost-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName.trim(),
            description: `หมวดหมู่ ${categoryName.trim()}`
          }),
          credentials: 'include'
        })

        if (response.ok) {
          const newCategory = await response.json()
          
          // เพิ่มหมวดหมู่ใหม่ใน state
          setCostCategories([...costCategories, newCategory])
          
          // เลือกหมวดหมู่ใหม่ในช่องนั้น
          updateCost(costIndex, 'categoryId', newCategory.id)
          
          alert('เพิ่มหมวดหมู่สำเร็จ!')
        } else {
          const errorData = await response.json()
          alert(`เกิดข้อผิดพลาด: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Error adding cost category:', error)
        alert('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่')
      }
    }
  }

  const calculateTotalCost = () => {
    return costs.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // สร้าง purchase ก่อน
      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...purchaseData,
          totalCost: calculateTotalCost(),
          productCosts: costs.filter(cost => cost.categoryId && cost.amount).map(cost => ({
            costCategoryId: cost.categoryId,
            amount: parseFloat(cost.amount),
            description: cost.description
          }))
        })
      })

      if (!purchaseResponse.ok) {
        throw new Error('Failed to create purchase')
      }

      const purchase = await purchaseResponse.json()

      // สร้าง product
      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...productData,
          height: parseFloat(productData.height) || undefined,
          width: parseFloat(productData.width) || undefined,
          trunkSize: parseFloat(productData.trunkSize) || undefined,
          potHeight: parseFloat(productData.potHeight) || undefined,
          potWidth: parseFloat(productData.potWidth) || undefined,
          cost: calculateTotalCost(),
          price: parseFloat(productData.price) || 0,
          status: 'AVAILABLE',
          purchaseId: purchase.id
        })
      })

      if (!productResponse.ok) {
        throw new Error('Failed to create product')
      }

      alert('เพิ่มข้อมูลสินค้าสำเร็จ!')
      router.push('/admin/stock')
    } catch (error) {
      console.error('Error creating stock:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มข้อมูลสต็อกต้นไม้</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ข้อมูลการซื้อ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลการซื้อ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">รหัสการซื้อ *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={purchaseData.purchaseCode}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  placeholder="สร้างอัตโนมัติ"
                />
                <button
                  type="button"
                  onClick={generateCodes}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  สร้างใหม่
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">วันที่ซื้อ *</label>
              <input
                type="date"
                value={purchaseData.purchaseDate}
                onChange={(e) => setPurchaseData({...purchaseData, purchaseDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">สวน *</label>
              <div className="flex gap-2">
                <select
                  value={purchaseData.supplierGardenId}
                  onChange={(e) => setPurchaseData({...purchaseData, supplierGardenId: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">เลือกสวน</option>
                  {gardens.map(garden => (
                    <option key={garden.id} value={garden.id}>
                      {garden.name} - {garden.ownerName}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: เปิด modal สำหรับเพิ่มสวนใหม่
                    alert('ฟีเจอร์เพิ่มสวนใหม่จะเพิ่มใน Contact Management')
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ผู้จำหน่าย</label>
              <input
                type="text"
                value={purchaseData.supplierRef}
                onChange={(e) => setPurchaseData({...purchaseData, supplierRef: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="ชื่อผู้จำหน่าย"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">หมายเหตุการซื้อ</label>
              <textarea
                value={purchaseData.note}
                onChange={(e) => setPurchaseData({...purchaseData, note: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับการซื้อ"
              />
            </div>
          </div>
        </div>

        {/* ข้อมูลสินค้า */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลสินค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">รหัสสินค้า *</label>
              <input
                type="text"
                value={productData.code}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="สร้างอัตโนมัติ"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ชื่อต้นไม้ *</label>
              <div className="flex gap-2">
                <select
                  value={productData.name}
                  onChange={(e) => setProductData({...productData, name: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">เลือกหรือพิมพ์ชื่อต้นไม้</option>
                  {treeNames.map((name, index) => (
                    <option key={index} value={name}>{name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const newName = prompt('กรุณาใส่ชื่อต้นไม้ใหม่:')
                    if (newName && newName.trim()) {
                      const trimmedName = newName.trim()
                      if (!treeNames.includes(trimmedName)) {
                        setTreeNames([...treeNames, trimmedName])
                      }
                      setProductData({...productData, name: trimmedName})
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">รายละเอียด</label>
              <textarea
                value={productData.description}
                onChange={(e) => setProductData({...productData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="รายละเอียดของต้นไม้"
              />
            </div>
          </div>
        </div>

        {/* ขนาดและคุณสมบัติ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ขนาดและคุณสมบัติ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ความสูง (เมตร)</label>
              <input
                type="number"
                step="0.1"
                value={productData.height}
                onChange={(e) => setProductData({...productData, height: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="4.5"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">หน้าไม้ (นิ้ว)</label>
              <input
                type="number"
                step="0.1"
                value={productData.width}
                onChange={(e) => setProductData({...productData, width: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">เส้นผ่านศูนย์กลางลำต้น (นิ้ว)</label>
              <input
                type="number"
                step="0.1"
                value={productData.trunkSize}
                onChange={(e) => setProductData({...productData, trunkSize: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ความสูงกระถาง (ซม.)</label>
              <input
                type="number"
                step="0.1"
                value={productData.potHeight}
                onChange={(e) => setProductData({...productData, potHeight: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">เส้นผ่านศูนย์กลางกระถาง (เมตร)</label>
              <input
                type="number"
                step="0.1"
                value={productData.potWidth}
                onChange={(e) => setProductData({...productData, potWidth: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="2.8"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ที่อยู่ในร้าน</label>
              <input
                type="text"
                value={productData.location}
                onChange={(e) => setProductData({...productData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="โซน A"
              />
            </div>
          </div>
        </div>

        {/* คุณสมบัติและราคา */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">คุณสมบัติและราคา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ความต้องการแสงแดด</label>
              <select
                value={productData.sunlight}
                onChange={(e) => setProductData({...productData, sunlight: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="FULL">ต้องการแสงแดดเต็มที่</option>
                <option value="PARTIAL">ต้องการแสงแดดบางส่วน</option>
                <option value="SHADE">ชอบร่มเงา</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ความต้องการน้ำ</label>
              <select
                value={productData.water}
                onChange={(e) => setProductData({...productData, water: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="HIGH">ต้องการน้ำมาก</option>
                <option value="MEDIUM">ต้องการน้ำปานกลาง</option>
                <option value="LOW">ต้องการน้ำน้อย</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">ราคาขาย (บาท) *</label>
              <input
                type="number"
                value={productData.price}
                onChange={(e) => setProductData({...productData, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="80000"
                required
              />
            </div>
          </div>
        </div>

        {/* รายละเอียดต้นทุน */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">รายละเอียดต้นทุน</h2>
            <button
              type="button"
              onClick={addCostRow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มรายการ
            </button>
          </div>
          <div className="space-y-4">
            {costs.map((cost, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">หมวดหมู่ค่าใช้จ่าย *</label>
                  <select
                    value={cost.categoryId}
                    onChange={(e) => updateCost(index, 'categoryId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {costCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">จำนวนเงิน (บาท) *</label>
                  <input
                    type="number"
                    value={cost.amount}
                    onChange={(e) => updateCost(index, 'amount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">รายละเอียด</label>
                  <input
                    type="text"
                    value={cost.description}
                    onChange={(e) => updateCost(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCostRow(index)}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    disabled={costs.length === 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">รวมต้นทุนทั้งหมด:</span>
                <span className="text-xl font-bold text-green-600">{calculateTotalCost().toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>


        {/* ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มข้อมูลสินค้า
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 