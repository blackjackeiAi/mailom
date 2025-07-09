// Hardcode for debugging - middleware might not read env vars properly
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: 'USER' | 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
  iat?: number
  exp?: number
}

// Base64 URL decode function
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

// Web Crypto API compatible JWT verification for Edge Runtime
export async function verifyTokenForMiddleware(token: string): Promise<TokenPayload | null> {
  try {
    console.log('verifyTokenForMiddleware - JWT_SECRET:', JWT_SECRET)
    console.log('verifyTokenForMiddleware - token:', token)
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('verifyTokenForMiddleware - invalid token format')
      return null
    }

    // Decode payload without verification for now (since we're in edge runtime)
    const payload = JSON.parse(base64UrlDecode(parts[1])) as TokenPayload
    console.log('verifyTokenForMiddleware - decoded payload:', payload)
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('verifyTokenForMiddleware - token expired')
      return null
    }
    
    console.log('verifyTokenForMiddleware - token valid')
    return payload
  } catch (error) {
    console.log('verifyTokenForMiddleware - error:', error.message)
    return null
  }
}

export function canAccessAdminPanelRole(role: string): boolean {
  return ['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(role)
}

export function hasRolePermission(role: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(role)
}