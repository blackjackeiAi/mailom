import React from 'react'

interface StatusBadgeProps {
  status: string
  type?: 'purchase' | 'product' | 'sale'
  className?: string
}

export default function StatusBadge({ 
  status, 
  type = 'product',
  className = ""
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (type) {
      case 'purchase':
        switch (status) {
          case 'PENDING':
            return { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' }
          case 'COMPLETED':
            return { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' }
          case 'CANCELLED':
            return { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' }
          default:
            return { label: status, color: 'bg-gray-100 text-gray-800' }
        }
      
      case 'product':
        switch (status) {
          case 'AVAILABLE':
            return { label: 'พร้อมขาย', color: 'bg-green-100 text-green-800' }
          case 'SOLD':
            return { label: 'ขายแล้ว', color: 'bg-blue-100 text-blue-800' }
          case 'RESERVED':
            return { label: 'จองแล้ว', color: 'bg-yellow-100 text-yellow-800' }
          case 'DEAD':
            return { label: 'ไม้ตาย', color: 'bg-red-100 text-red-800' }
          default:
            return { label: status, color: 'bg-gray-100 text-gray-800' }
        }
      
      case 'sale':
        switch (status) {
          case 'PENDING':
            return { label: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' }
          case 'COMPLETED':
            return { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' }
          case 'CANCELLED':
            return { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' }
          default:
            return { label: status, color: 'bg-gray-100 text-gray-800' }
        }
      
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' }
    }
  }

  const config = getStatusConfig()

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color} ${className}`}>
      {config.label}
    </span>
  )
}