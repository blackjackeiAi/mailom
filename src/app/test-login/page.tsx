'use client'
import React, { useState } from 'react'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@mailom.com')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState('')

  const testLogin = async () => {
    setResult('กำลังทดสอบ...')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Login สำเร็จ: ${JSON.stringify(data, null, 2)}`)
        
        // Test accessing protected endpoint
        const meResponse = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        const meData = await meResponse.json()
        
        setResult(prev => prev + `\n\n✅ /api/auth/me: ${JSON.stringify(meData, null, 2)}`)
      } else {
        setResult(`❌ Login ล้มเหลว: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    }
  }

  const testLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      setResult(`🚪 Logout: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ Logout Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ทดสอบระบบ Login</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลการเข้าสู่ระบบ</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ทดสอบ Login
              </button>
              
              <button
                onClick={testLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ทดสอบ Logout
              </button>
            </div>
          </div>
        </div>
        
        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}
        
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">ข้อมูลทดสอบ:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li><strong>ADMIN:</strong> admin@mailom.com / admin123</li>
            <li><strong>MANAGER:</strong> manager@mailom.com / manager123</li>
            <li><strong>EMPLOYEE:</strong> employee@mailom.com / employee123</li>
            <li><strong>USER:</strong> user@mailom.com / user123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}