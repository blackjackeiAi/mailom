'use client'
import React, { useState } from 'react'

interface ImportResult {
  total: number
  success: number
  errors: string[]
  preview: any[]
}

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'gardens' | 'purchases' | 'products'>('gardens')
  const [dryRun, setDryRun] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      alert('กรุณาเลือกไฟล์')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', importType)
      formData.append('dryRun', dryRun.toString())

      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setShowPreview(true)
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`)
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', importType)
      formData.append('dryRun', 'false')

      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        alert(`นำเข้าข้อมูลสำเร็จ: ${data.success} รายการ`)
        setSelectedFile(null)
        setShowPreview(false)
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`)
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getImportTypeLabel = (type: string) => {
    switch (type) {
      case 'gardens': return 'สวน'
      case 'purchases': return 'การซื้อ'
      case 'products': return 'สินค้า'
      default: return type
    }
  }

  const getColumnRequirements = () => {
    switch (importType) {
      case 'gardens':
        return [
          'ชื่อสวน (ชื่อสวน/Garden Name/name) *',
          'ที่อยู่ (ที่อยู่/Location/location)',
          'เจ้าของ (เจ้าของ/Owner/ownerName)',
          'ติดต่อ (ติดต่อ/Contact/contactInfo)',
          'จังหวัด (จังหวัด/Province/province)',
          'อำเภอ (อำเภอ/District/district)',
          'ตำบล (ตำบล/Subdistrict/subDistrict)',
        ]
      case 'purchases':
        return [
          'รหัสการซื้อ (รหัสการซื้อ/Purchase Code/purchaseCode) *',
          'วันที่ซื้อ (วันที่ซื้อ/Purchase Date/purchaseDate) *',
          'ชื่อสวน (ชื่อสวน/Garden Name/gardenName) *',
          'ผู้ขาย (ผู้ขาย/Supplier/supplierRef)',
          'ยอดรวม (ยอดรวม/Total Cost/totalCost)',
          'หมายเหตุ (หมายเหตุ/Note/note)',
        ]
      case 'products':
        return [
          'รหัสสินค้า (รหัสสินค้า/Product Code/code) *',
          'ชื่อสินค้า (ชื่อสินค้า/Product Name/name) *',
          'รายละเอียด (รายละเอียด/Description/description)',
          'ความสูง (ความสูง/Height/height)',
          'หน้าไม้ (หน้าไม้/Width/width)',
          'ต้นทุน (ต้นทุน/Cost/cost)',
          'ราคาขาย (ราคาขาย/Price/price)',
          'รหัสการซื้อ (รหัสการซื้อ/Purchase Code/purchaseCode)',
          'ที่อยู่ (ที่อยู่/Location/location)',
        ]
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">นำเข้าข้อมูลจาก Excel</h1>
          <p className="text-gray-600">นำเข้าข้อมูลสวน การซื้อ และสินค้าจากไฟล์ Excel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">อัพโหลดไฟล์</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทข้อมูล
                </label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gardens">สวน</option>
                  <option value="purchases">การซื้อ</option>
                  <option value="products">สินค้า</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ไฟล์ Excel
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวาง
                      </p>
                      <p className="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    ไฟล์ที่เลือก: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">ทดสอบการนำเข้า (ไม่บันทึกข้อมูลจริง)</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังประมวลผล...' : dryRun ? 'ทดสอบการนำเข้า' : 'นำเข้าข้อมูล'}
                </button>
                {result && dryRun && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={loading || result.errors.length > 0}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ยืนยันการนำเข้า
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">ผลการนำเข้า</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.total}</p>
                  <p className="text-sm text-gray-600">รายการทั้งหมด</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-sm text-gray-600">สำเร็จ</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                  <p className="text-sm text-gray-600">ผิดพลาด</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-red-700 mb-2">ข้อผิดพลาด:</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 mb-1">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {result.preview.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-2">ตัวอย่างข้อมูล:</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-64 overflow-auto">
                    <pre className="text-xs text-gray-600">
                      {JSON.stringify(result.preview.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">รูปแบบไฟล์ Excel</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  {getImportTypeLabel(importType)}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  คอลัมน์ที่ต้องมี (* = จำเป็น):
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {getColumnRequirements().map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">คำแนะนำ</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• ตรวจสอบรูปแบบข้อมูลให้ถูกต้องก่อนอัพโหลด</p>
              <p>• ใช้การทดสอบการนำเข้าก่อนนำเข้าข้อมูลจริง</p>
              <p>• รองรับไฟล์ Excel (.xlsx, .xls) เท่านั้น</p>
              <p>• ข้อมูลในแถวแรกจะถูกใช้เป็นหัวตาราง</p>
              <p>• วันที่ควรอยู่ในรูปแบบ YYYY-MM-DD</p>
              <p>• ตัวเลขไม่ควรมีเครื่องหมายจุลภาค (,)</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">ข้อควรระวัง</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  การนำเข้าข้อมูลจะเพิ่มข้อมูลใหม่เท่านั้น ไม่สามารถแก้ไขข้อมูลเดิมที่มีอยู่แล้วได้
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}