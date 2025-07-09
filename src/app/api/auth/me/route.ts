import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user from token using the Request object
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบหรือ Token หมดอายุ' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  }
}