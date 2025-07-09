import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d'

export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
  isActive: boolean
}

export interface AuthPayload {
  user: User
  token: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      name: true,
      role: true,
      isActive: true,
    }
  })

  if (!user) {
    throw new Error('ไม่พบผู้ใช้งาน')
  }

  if (!user.isActive) {
    throw new Error('บัญชีผู้ใช้ถูกระงับ')
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new Error('รหัสผ่านไม่ถูกต้อง')
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  const userWithoutPassword = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN',
    isActive: user.isActive
  }

  const token = generateToken(userWithoutPassword)

  return {
    user: userWithoutPassword,
    token
  }
}

// Register user (สำหรับ admin สร้างผู้ใช้ใหม่)
export async function registerUser(
  email: string, 
  password: string, 
  name?: string, 
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'USER'
): Promise<User> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('อีเมลนี้ถูกใช้งานแล้ว')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN',
    isActive: user.isActive
  }
}

// Get user by token from request
export async function getUserFromToken(request: Request): Promise<User | null> {
  try {
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader)
    if (!cookieHeader) {
      console.log('No cookie header found')
      return null
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = decodeURIComponent(value)
      }
      return acc
    }, {} as Record<string, string>)

    const token = cookies.token
    console.log('Parsed cookies:', cookies)
    console.log('Token:', token)
    if (!token) {
      console.log('No token found in cookies')
      return null
    }

    const decoded = verifyToken(token)
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    console.log('User found:', user)
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role as 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN',
      isActive: user.isActive
    }
  } catch (error) {
    console.log('Error in getUserFromToken:', error)
    return null
  }
}

// Check if user is admin
export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN'
}

// Change password
export async function changePassword(
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true }
  })

  if (!user) {
    throw new Error('ไม่พบผู้ใช้งาน')
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
  if (!isCurrentPasswordValid) {
    throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง')
  }

  const hashedNewPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  })
}