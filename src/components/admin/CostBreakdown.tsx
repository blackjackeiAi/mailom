import React from 'react'

interface CostItem {
  category: string
  amount: number
  description?: string
  percentage?: number
}

interface CostBreakdownProps {
  costs: CostItem[]
  totalCost: number
  title?: string
  showPercentage?: boolean
  className?: string
}

export default function CostBreakdown({ 
  costs, 
  totalCost, 
  title = "รายละเอียดต้นทุน",
  showPercentage = true,
  className = ""
}: CostBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      {costs.length === 0 ? (
        <p className="text-gray-500 text-center py-4">ไม่มีข้อมูลต้นทุน</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {costs.map((cost, index) => {
              const percentage = totalCost > 0 ? (cost.amount / totalCost) * 100 : 0
              return (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{cost.category}</p>
                    {cost.description && (
                      <p className="text-sm text-gray-600">{cost.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">{formatCurrency(cost.amount)}</p>
                    {showPercentage && (
                      <p className="text-sm text-gray-600">{formatPercentage(percentage)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-900">รวมทั้งหมด</p>
              <p className="font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}