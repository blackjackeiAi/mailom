'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateStock() {
  const router = useRouter()
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [subImages, setSubImages] = useState<string[]>([])

  // ข้อมูลพื้นฐาน
  const [basicInfo, setBasicInfo] = useState({
    code: '',
    name: '',
    date: '',
  })

  // รายละเอียดที่มา
  const [sourceDetails, setSourceDetails] = useState({
    customer: '',
    location: '',
    area: '',
    phone: '',
    note: ''
  })

  // รายละเอียดต้นทุน
  const [costDetails, setCostDetails] = useState([
    { label: 'ราคาต้นไม้', value: '' },
    { label: 'ค่าแรง', value: '' },
    { label: 'ค่าขนส่ง', value: '' },
    { label: 'ค่าขายหน้าร้าน', value: '' }
  ])

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setMainImage(URL.createObjectURL(file))
    }
  }

  const handleSubImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file))
      setSubImages(prev => [...prev, ...newImages].slice(0, 3))
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-600">
          ← ย้อนกลับ
        </button>
        <h1 className="text-2xl font-bold">STOCK</h1>
      </div>

      <form className="space-y-6">
        {/* รูปภาพ */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square bg-gray-200">
              {mainImage ? (
                <img src={mainImage} alt="Main" className="w-full h-full object-cover" />
              ) : (
                <label className="flex items-center justify-center w-full h-full cursor-pointer">
                  <span className="text-4xl text-gray-400">+</span>
                  <input type="file" className="hidden" />
                </label>
              )}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200">
                <label className="flex items-center justify-center w-full h-full cursor-pointer">
                  <span className="text-4xl text-gray-400">+</span>
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ข้อมูลพื้นฐาน */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-1">รหัส</label>
            <input type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">ชื่อ ▼</label>
            <input type="text" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">วันที่ +</label>
            <input type="text" className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* รายละเอียดเพิ่มเติม */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1">ลำต้น กว้าง</label>
              <div className="flex gap-2">
                <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="เมตร" />
                <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="เมตร" />
              </div>
            </div>
            <div>
              <label className="block mb-1">สูง</label>
              <div className="flex gap-2">
                <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="เมตร" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">ตุ้ม</label>
              <div className="flex gap-2">
                <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="เมตร" />
                <input type="text" className="flex-1 border rounded px-3 py-2" placeholder="เมตร" />
              </div>
            </div>
            <div>
              <label className="block mb-1">ที่อยู่</label>
              <input type="text" className="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        {/* เงื่อนไข */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-1">เบอร์โทร</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="sunlight" className="mr-2" />
                ชอบแดด
              </label>
              <label className="flex items-center">
                <input type="radio" name="sunlight" className="mr-2" />
                ไม่ชอบแดด
              </label>
            </div>
          </div>
          <div>
            <label className="block mb-1">หมายเหตุ</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="water" className="mr-2" />
                ชอบน้ำ
              </label>
              <label className="flex items-center">
                <input type="radio" name="water" className="mr-2" />
                ไม่ชอบน้ำ
              </label>
            </div>
          </div>
        </div>

        {/* รายละเอียดต้นทุน */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">รายละเอียดต้นทุน +</h3>
          </div>
          <div className="space-y-4">
            {costDetails.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.label}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  readOnly
                />
                <input
                  type="number"
                  value={item.value}
                  onChange={e => {
                    const newCostDetails = [...costDetails]
                    newCostDetails[index].value = e.target.value
                    setCostDetails(newCostDetails)
                  }}
                  className="w-full border rounded px-3 py-2"
                />
                <button type="button" className="text-gray-400">✖️</button>
              </div>
            ))}
            <div className="text-right">
              <span>รวมทั้งหมด: </span>
              <span>{costDetails.reduce((sum, item) => sum + (Number(item.value) || 0), 0)} บาท</span>
            </div>
          </div>
        </div>

        {/* รายการขาย */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">รายการขาย</h3>
            <button className="text-blue-600">เลือกจากรายชื่อ ▼</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">ชื่อลูกค้า</label>
              <input type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">ที่อยู่</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">ด้านข้าง</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">จังหวัด</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block mb-1">เบอร์โทร</label>
              <input type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <div>
                <label className="block mb-1">ราคาขาย</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">ต้นทุนรวม</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">ค่าขนส่ง</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="text-right">
              <span>รวมทั้งหมด: </span>
              <span>0 บาท</span>
            </div>
          </div>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 bg-green-600 text-white rounded">
            เพิ่มข้อมูล
          </button>
          <button className="px-6 py-2 border border-red-600 text-red-600 rounded">
            ยกเลิก
          </button>
          <button className="px-6 py-2 bg-gray-200 rounded">
            ล้างข้อมูล ⟳
          </button>
        </div>
      </form>
    </div>
  )
} 