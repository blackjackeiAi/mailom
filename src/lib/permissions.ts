import { User } from './auth'

export type Permission = 
  // ข้อมูลพื้นฐาน
  | 'view_dashboard'
  | 'view_products'
  | 'view_gardens'
  | 'view_customers'
  
  // การจัดการสต็อก
  | 'manage_stock'
  | 'create_product'
  | 'edit_product'
  | 'delete_product'
  
  // การขาย
  | 'view_sales'
  | 'create_sale'
  | 'edit_sale'
  | 'delete_sale'
  | 'manage_sales'
  
  // การซื้อ
  | 'view_purchases'
  | 'create_purchase'
  | 'edit_purchase'
  | 'delete_purchase'
  | 'manage_purchases'
  
  // รายงานและการเงิน
  | 'view_reports'
  | 'view_financial_reports'
  | 'view_cost_analysis'
  | 'export_reports'
  
  // การจัดการสวน
  | 'manage_gardens'
  | 'create_garden'
  | 'edit_garden'
  | 'delete_garden'
  
  // การจัดการผู้ใช้
  | 'manage_users'
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'view_users'
  
  // การนำเข้าข้อมูล
  | 'import_data'
  | 'export_data'
  
  // การตั้งค่าระบบ
  | 'manage_system'
  | 'view_system_logs'

// กำหนดสิทธิ์สำหรับแต่ละ Role
export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  // ผู้ใช้งานทั่วไป - ดูข้อมูลได้อย่างจำกัด
  USER: [
    'view_products',
    'view_gardens',
  ],
  
  // พนักงาน - จัดการสต็อก และการขาย
  EMPLOYEE: [
    'view_dashboard',
    'view_products',
    'view_gardens', 
    'view_customers',
    'manage_stock',
    'create_product',
    'edit_product',
    'view_sales',
    'create_sale',
    'edit_sale',
    'manage_sales',
  ],
  
  // ผู้จัดการ - จัดการการซื้อ, รายงาน, การเงิน + สิทธิ์ของ Employee
  MANAGER: [
    'view_dashboard',
    'view_products',
    'view_gardens',
    'view_customers',
    'manage_stock',
    'create_product',
    'edit_product',
    'delete_product',
    'view_sales',
    'create_sale',
    'edit_sale',
    'delete_sale',
    'manage_sales',
    'view_purchases',
    'create_purchase',
    'edit_purchase',
    'delete_purchase',
    'manage_purchases',
    'view_reports',
    'view_financial_reports',
    'view_cost_analysis',
    'export_reports',
    'manage_gardens',
    'create_garden',
    'edit_garden',
    'import_data',
    'export_data',
  ],
  
  // ผู้ดูแลระบบ - เข้าถึงได้ทุกอย่าง
  ADMIN: [
    'view_dashboard',
    'view_products',
    'view_gardens',
    'view_customers',
    'manage_stock',
    'create_product',
    'edit_product',
    'delete_product',
    'view_sales',
    'create_sale',
    'edit_sale',
    'delete_sale',
    'manage_sales',
    'view_purchases',
    'create_purchase',
    'edit_purchase',
    'delete_purchase',
    'manage_purchases',
    'view_reports',
    'view_financial_reports',
    'view_cost_analysis',
    'export_reports',
    'manage_gardens',
    'create_garden',
    'edit_garden',
    'delete_garden',
    'manage_users',
    'create_user',
    'edit_user',
    'delete_user',
    'view_users',
    'import_data',
    'export_data',
    'manage_system',
    'view_system_logs',
  ],
}

// ตรวจสอบสิทธิ์
export function hasPermission(user: User, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions.includes(permission)
}

// ตรวจสอบสิทธิ์หลายๆ อัน
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

// ตรวจสอบสิทธิ์ทั้งหมด
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

// ดึงสิทธิ์ทั้งหมดของผู้ใช้
export function getUserPermissions(user: User): Permission[] {
  return ROLE_PERMISSIONS[user.role]
}

// ตรวจสอบระดับการเข้าถึง
export function canAccessAdminPanel(user: User): boolean {
  return user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'EMPLOYEE'
}

export function canManageUsers(user: User): boolean {
  return user.role === 'ADMIN'
}

export function canManageFinance(user: User): boolean {
  return user.role === 'ADMIN' || user.role === 'MANAGER'
}

export function canManageStock(user: User): boolean {
  return user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'EMPLOYEE'
}

// Helper functions สำหรับ UI
export function getRoleDisplayName(role: User['role']): string {
  const roleNames = {
    USER: 'ผู้ใช้งาน',
    EMPLOYEE: 'พนักงาน',
    MANAGER: 'ผู้จัดการ',
    ADMIN: 'ผู้ดูแลระบบ'
  }
  return roleNames[role]
}

export function getRoleColor(role: User['role']): string {
  const roleColors = {
    USER: 'bg-gray-100 text-gray-800',
    EMPLOYEE: 'bg-blue-100 text-blue-800',
    MANAGER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800'
  }
  return roleColors[role]
}