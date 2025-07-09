import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      )
    }

    // Login user
    const authPayload = await loginUser(email, password)

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: authPayload.user
    })

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: authPayload.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      },
      { status: 401 }
    )
  }
}