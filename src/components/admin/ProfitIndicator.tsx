import React from 'react'

interface ProfitIndicatorProps {
  cost: number
  revenue: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ProfitIndicator({ 
  cost, 
  revenue, 
  className = "",
  size = 'md'
}: ProfitIndicatorProps) {
  const profit = revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  const isProfit = profit >= 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const getIndicatorColor = () => {
    if (margin >= 30) return 'text-green-600 bg-green-50'
    if (margin >= 10) return 'text-yellow-600 bg-yellow-50'
    if (margin >= 0) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getIcon = () => {
    if (isProfit) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${getIndicatorColor()} ${sizeClasses[size]} ${className}`}>
      {getIcon()}
      <span className="font-medium">
        {formatCurrency(Math.abs(profit))}
      </span>
      <span className="text-xs">
        ({margin.toFixed(1)}%)
      </span>
    </div>
  )
}