import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')
  
  // ลบข้อมูลเก่าก่อน (ลำดับสำคัญเพื่อหลีกเลี่ยง foreign key constraints)
  await prisma.transaction.deleteMany({})
  await prisma.sale.deleteMany({})
  await prisma.productCost.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.purchase.deleteMany({})
  await prisma.customer.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.costCategory.deleteMany({})
  await prisma.supplierGarden.deleteMany({})
  await prisma.userGarden.deleteMany({})
  await prisma.ourGarden.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('Old data deleted')

  // สร้าง users ตัวอย่าง
  const adminPassword = await bcrypt.hash('admin123', 12)
  const managerPassword = await bcrypt.hash('manager123', 12)
  const employeePassword = await bcrypt.hash('employee123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mailom.com',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@mailom.com',
      password: managerPassword,
      name: 'ผู้จัดการ สมชาย',
      role: 'MANAGER',
    },
  })

  const employee = await prisma.user.create({
    data: {
      email: 'employee@mailom.com',
      password: employeePassword,
      name: 'พนักงาน สมหญิง',
      role: 'EMPLOYEE',
    },
  })

  const user = await prisma.user.create({
    data: {
      email: 'user@mailom.com',
      password: userPassword,
      name: 'ผู้ใช้งาน สมศักดิ์',
      role: 'USER',
    },
  })

  console.log('Users created')

  // สร้างสวนของเรา (Our Gardens)
  const ourGarden1 = await prisma.ourGarden.create({
    data: {
      name: 'สวนพี่ทิต',
      location: 'ขอนแก่น',
      managerName: 'พี่ทิต',
      contactInfo: '081-234-5678',
      description: 'สวนหลักที่ขอนแก่น',
    },
  })

  const ourGarden2 = await prisma.ourGarden.create({
    data: {
      name: 'สวนพี่หมอก',
      location: 'อุบลราชธานี',
      managerName: 'พี่หมอก',
      contactInfo: '089-123-4567',
      description: 'สวนที่อุบลราชธานี',
    },
  })

  const ourGarden3 = await prisma.ourGarden.create({
    data: {
      name: 'สวนไม้ล้อม',
      location: 'ร้อยเอ็ด',
      managerName: 'พี่เพลง',
      contactInfo: '087-654-3210',
      description: 'สวนที่ร้อยเอ็ด',
    },
  })

  const ourGarden4 = await prisma.ourGarden.create({
    data: {
      name: 'สวนมีสุข',
      location: 'มหาสารคาม',
      managerName: 'พี่สุข',
      contactInfo: '086-789-0123',
      description: 'สวนที่มหาสารคาม',
    },
  })

  console.log('Our Gardens created')

  // สร้างสวนซัพพลายเออร์ (Supplier Gardens)
  const supplierGarden1 = await prisma.supplierGarden.create({
    data: {
      name: 'ตุ่น อุบล',
      location: 'อุบลราชธานี',
      ownerName: 'พี่ตุ่น',
      province: 'อุบลราชธานี',
      district: 'เมืองอุบลราชธานี',
      contactInfo: '081-111-2222',
    },
  })

  const supplierGarden2 = await prisma.supplierGarden.create({
    data: {
      name: 'เพลงไทยไม้ล้อม',
      location: 'ร้อยเอ็ด',
      ownerName: 'พี่เพลง',
      province: 'ร้อยเอ็ด',
      district: 'เมืองร้อยเอ็ด',
      contactInfo: '089-333-4444',
    },
  })

  const supplierGarden3 = await prisma.supplierGarden.create({
    data: {
      name: 'รุ้งละดา',
      location: 'ขอนแก่น',
      ownerName: 'พี่รุ้ง',
      province: 'ขอนแก่น',
      district: 'เมืองขอนแก่น',
      contactInfo: '087-555-6666',
    },
  })

  console.log('Supplier Gardens created')

  // สร้าง User-Garden relationships
  await prisma.userGarden.create({
    data: {
      userId: admin.id,
      ourGardenId: ourGarden1.id,
      role: 'ADMIN',
    },
  })

  await prisma.userGarden.create({
    data: {
      userId: manager.id,
      ourGardenId: ourGarden1.id,
      role: 'MANAGER',
    },
  })

  await prisma.userGarden.create({
    data: {
      userId: employee.id,
      ourGardenId: ourGarden1.id,
      role: 'VIEWER',
    },
  })

  console.log('User-Garden relationships created')

  // สร้าง Cost Categories
  const costCategory1 = await prisma.costCategory.create({
    data: {
      name: 'ค่าซื้อต้นไม้',
      nameEn: 'Tree Purchase Cost',
      description: 'ค่าใช้จ่ายในการซื้อต้นไม้',
    },
  })

  const costCategory2 = await prisma.costCategory.create({
    data: {
      name: 'ค่าขนส่ง',
      nameEn: 'Transportation Cost',
      description: 'ค่าใช้จ่ายในการขนส่ง',
    },
  })

  const costCategory3 = await prisma.costCategory.create({
    data: {
      name: 'ค่าแรงงาน',
      nameEn: 'Labor Cost',
      description: 'ค่าแรงงานต่างๆ',
    },
  })

  console.log('Cost Categories created')

  // สร้าง Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      address: '123 ถนนมิตรภาพ',
      province: 'ขอนแก่น',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'คุณสมหญิง รักสวน',
      phone: '089-876-5432',
      address: '456 ถนนศิลา',
      province: 'อุบลราชธานี',
    },
  })

  console.log('Customers created')

  // สร้าง Contacts
  const contact1 = await prisma.contact.create({
    data: {
      name: 'บริษัท สวนไผ่ไทย จำกัด',
      type: 'SUPPLIER',
      phone: '081-234-5678',
      email: 'bamboo@garden.co.th',
      address: '123 ถนนไผ่งาม',
      province: 'อุบลราชธานี',
      district: 'เมืองอุบลราชธานี',
      contactInfo: 'ติดต่อ คุณสมชาย',
      note: 'ผู้จำหน่ายไผ่คุณภาพดี'
    }
  })

  const contact2 = await prisma.contact.create({
    data: {
      name: 'ร้านขายต้นไม้ใหญ่ปทุม',
      type: 'CUSTOMER',
      phone: '089-876-5432',
      email: 'pathumtree@gmail.com',
      address: '456 ถนนวิภาวดี',
      province: 'ปทุมธานี',
      district: 'เมืองปทุมธานี',
      note: 'ลูกค้าประจำ สั่งซื้อเป็นประจำ'
    }
  })

  const contact3 = await prisma.contact.create({
    data: {
      name: 'คุณวิทยา นักสวน',
      type: 'VENDOR',
      phone: '087-111-2233',
      email: 'wittaya.garden@hotmail.com',
      address: '789 หมู่ 5',
      province: 'ขอนแก่น',
      district: 'บ้านไผ่',
      note: 'ผู้ซื้อปลีก รายใหญ่'
    }
  })

  console.log('Contacts created')

  // สร้าง Purchase และ Product ตัวอย่าง
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseCode: 'TB68-001',
      purchaseDate: new Date('2024-01-15'),
      supplierGardenId: supplierGarden1.id,
      ourGardenId: ourGarden1.id,
      supplierRef: 'พี่ตุ่น',
      totalCost: 15000,
      status: 'COMPLETED',
      note: 'ซื้อไผ่ตงโตนดลูก 5 ต้น',
    },
  })

  // สร้าง Product Cost สำหรับการซื้อ
  await prisma.productCost.create({
    data: {
      purchaseId: purchase1.id,
      costCategoryId: costCategory1.id,
      amount: 12000,
      description: 'ไผ่ตงโตนดลูก 5 ต้น @ 2,400 บาท/ต้น',
    },
  })

  await prisma.productCost.create({
    data: {
      purchaseId: purchase1.id,
      costCategoryId: costCategory2.id,
      amount: 2000,
      description: 'ค่าขนส่งจากอุบลฯ',
    },
  })

  await prisma.productCost.create({
    data: {
      purchaseId: purchase1.id,
      costCategoryId: costCategory3.id,
      amount: 1000,
      description: 'ค่าแรงขนลง',
    },
  })

  // สร้าง Products
  const product1 = await prisma.product.create({
    data: {
      code: 'TB68-001-01',
      name: 'ไผ่ตงโตนดลูก',
      description: 'ไผ่ตงโตนดลูก ขนาดใหญ่',
      height: 3.5,
      width: 8.0,
      trunkSize: 12.0,
      potHeight: 40.0,
      potWidth: 0.8,
      location: 'โซน A1',
      sunlight: 'FULL',
      water: 'MEDIUM',
      cost: 3000, // 15000 / 5 = 3000 บาท/ต้น
      price: 4500,
      status: 'AVAILABLE',
      purchaseId: purchase1.id,
      ourGardenId: ourGarden1.id,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      code: 'TB68-001-02',
      name: 'ไผ่ตงโตนดลูก',
      description: 'ไผ่ตงโตนดลูก ขนาดใหญ่',
      height: 3.2,
      width: 7.5,
      trunkSize: 11.0,
      potHeight: 40.0,
      potWidth: 0.8,
      location: 'โซน A2',
      sunlight: 'FULL',
      water: 'MEDIUM',
      cost: 3000,
      price: 4500,
      status: 'AVAILABLE',
      purchaseId: purchase1.id,
      ourGardenId: ourGarden1.id,
    },
  })

  console.log('Products created')

  // สร้าง Sale
  const sale1 = await prisma.sale.create({
    data: {
      productId: product1.id,
      customerId: customer1.id,
      price: 4500,
      shipping: 500,
      installation: 1000,
      totalCost: 6000,
      status: 'COMPLETED',
    },
  })

  // อัปเดตสถานะสินค้าที่ขายแล้ว
  await prisma.product.update({
    where: { id: product1.id },
    data: { status: 'SOLD' },
  })

  console.log('Sales created')

  // สร้าง Transactions
  await prisma.transaction.create({
    data: {
      date: new Date('2024-01-15'),
      description: 'ซื้อไผ่ตงโตนดลูก 5 ต้น จากตุ่น อุบล',
      type: 'EXPENSE',
      amount: 15000,
      referenceId: purchase1.id,
      referenceType: 'PURCHASE',
      supplierGardenId: supplierGarden1.id,
    },
  })

  await prisma.transaction.create({
    data: {
      date: new Date('2024-01-20'),
      description: 'ขายไผ่ตงโตนดลูก รหัส TB68-001-01',
      type: 'INCOME',
      amount: 6000,
      referenceId: sale1.id,
      referenceType: 'SALE',
    },
  })

  console.log('Transactions created')
  console.log('Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })