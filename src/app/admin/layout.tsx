'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // หน้า login ไม่ต้องใช้ admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-[200px] h-screen bg-[#00B4DB]">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <Image 
              src="/trees.svg" 
              alt="Tree Logo" 
              width={24} 
              height={24}
              className="brightness-0 invert"
            />
          </div>
          <span className="text-white font-semibold">สวนไม้ล้อม</span>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <Link href="/admin/dashboard" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            DASHBOARD
          </Link>
          <Link href="/admin/stock" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            STOCK
          </Link>
          <Link href="/admin/sale" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            SALE
          </Link>
          <Link href="/admin/sale-report" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            SALE REPORT
          </Link>
          
          {/* Cost Management Section */}
          <div className="mt-6 px-6 py-2">
            <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium">
              Cost Management
            </h3>
          </div>
          <Link href="/admin/gardens" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            GARDENS
          </Link>
          <Link href="/admin/purchases" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            PURCHASES
          </Link>
          <Link href="/admin/cost-analysis" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            COST ANALYSIS
          </Link>
          <Link href="/admin/import" 
            className="flex items-center px-6 py-3 text-white hover:bg-white/10">
            IMPORT DATA
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-[200px]">
        {/* Header */}
        <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span>Hello, Admin</span>
            <span className="text-gray-400">Today is Work Day</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <span>Admin</span>
              <button 
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = '/admin/login')
                }}
                className="ml-2 text-red-600 hover:text-red-800 text-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 