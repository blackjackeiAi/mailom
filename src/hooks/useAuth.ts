'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
  isActive: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
        })
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      })

      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      })
      router.push('/admin/login')
    }
  }

  const refreshAuth = () => {
    checkAuthStatus()
  }

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    isAdmin: authState.user?.role === 'ADMIN',
    isManager: authState.user?.role === 'MANAGER',
    isEmployee: authState.user?.role === 'EMPLOYEE',
    canAccessAdmin: authState.user ? ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(authState.user.role) : false,
  }
}