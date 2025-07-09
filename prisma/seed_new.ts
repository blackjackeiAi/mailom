import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up existing data...')
  // ลบข้อมูลเก่าก่อน (ลำดับสำคัญเพื่อหลีกเลี่ยง foreign key constraints)
  await prisma.transaction.deleteMany({})
  await prisma.sale.deleteMany({})
  await prisma.productCost.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.purchase.deleteMany({})
  await prisma.customer.deleteMany({})
  await prisma.userGarden.deleteMany({})
  await prisma.ourGarden.deleteMany({})
  await prisma.supplierGarden.deleteMany({})
  await prisma.costCategory.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('👥 Creating users...')
  // สร้าง users ตัวอย่างสำหรับทุก role
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

  console.log('✅ Users created:', [admin, manager, employee, user].length)

  console.log('🌱 Creating our gardens...')
  // สร้างสวนของเรา
  const ourGardens = await Promise.all([
    prisma.ourGarden.create({
      data: {
        name: 'สวนพี่ทิต',
        location: 'ขอนแก่น',
        managerName: 'พี่ทิต',
        description: 'สวนหลักของเรา ดูแลโดยพี่ทิต',
      },
    }),
    prisma.ourGarden.create({
      data: {
        name: 'สวนพี่หมอก',
        location: 'บุรีรัมย์',
        managerName: 'พี่หมอก',
        description: 'สวนสาขา ดูแลโดยพี่หมอก',
      },
    }),
    prisma.ourGarden.create({
      data: {
        name: 'สวนไม้ล้อม',
        location: 'มหาสารคาม',
        managerName: 'พี่ไม้ล้อม',
        description: 'สวนไม้ล้อม เก็บไม้ใหญ่',
      },
    }),
    prisma.ourGarden.create({
      data: {
        name: 'สวนมีสุข',
        location: 'ร้อยเอ็ด',
        managerName: 'พี่มีสุข',
        description: 'สวนมีสุข สำหรับไม้สวยงาม',
      },
    }),
  ])
  console.log('✅ Our gardens created:', ourGardens.length)

  console.log('🏪 Creating supplier gardens...')
  // สร้างสวนที่ซื้อมา
  const supplierGardens = await Promise.all([
    prisma.supplierGarden.create({
      data: {
        name: 'ตุ่น อุบล',
        location: 'อุบลราชธานี',
        ownerName: 'พี่ตุ่น',
        province: 'อุบลราชธานี',
        district: 'เมืองอุบลราชธานี',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'เพลงไทยไม้ล้อม',
        location: 'ร้อยเอ็ด',
        ownerName: 'พี่เพลง',
        province: 'ร้อยเอ็ด',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'รุ้งละดา',
        location: 'มหาสารคาม',
        ownerName: 'พี่รุ้ง',
        province: 'มหาสารคาม',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'อ.เขียว',
        location: 'เลย',
        ownerName: 'อาจารย์เขียว',
        province: 'เลย',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'อ.ชำนาญ',
        location: 'ชำนาญ',
        ownerName: 'อาจารย์ชำนาญ',
        province: 'บุรีรัมย์',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'สวนจิ๊บ',
        location: 'อุดรธานี',
        ownerName: 'พี่จิ๊บ',
        province: 'อุดรธานี',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'ครูไทยไม้ล้อม',
        location: 'กาฬสินธุ์',
        ownerName: 'ครูไทย',
        province: 'กาฬสินธุ์',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'สวนพี่นาจ',
        location: 'หนองคาย',
        ownerName: 'พี่นาจ',
        province: 'หนองคาย',
      },
    }),
    prisma.supplierGarden.create({
      data: {
        name: 'อัยรินทร์',
        location: 'สกลนคร',
        ownerName: 'พี่อัยรินทร์',
        province: 'สกลนคร',
      },
    }),
  ])
  console.log('✅ Supplier gardens created:', supplierGardens.length)

  console.log('🔗 Creating user-garden mappings...')
  // สร้างการเชื่อมโยงผู้ใช้กับสวน
  await Promise.all([
    // Admin เข้าถึงได้ทุกสวน
    ...ourGardens.map(garden => 
      prisma.userGarden.create({
        data: {
          userId: admin.id,
          ourGardenId: garden.id,
          role: 'ADMIN',
        },
      })
    ),
    // Manager เข้าถึงได้บางสวน
    prisma.userGarden.create({
      data: {
        userId: manager.id,
        ourGardenId: ourGardens[0].id, // สวนพี่ทิต
        role: 'MANAGER',
      },
    }),
    prisma.userGarden.create({
      data: {
        userId: manager.id,
        ourGardenId: ourGardens[2].id, // สวนไม้ล้อม
        role: 'MANAGER',
      },
    }),
    // Employee เข้าถึงได้สวนเดียว
    prisma.userGarden.create({
      data: {
        userId: employee.id,
        ourGardenId: ourGardens[1].id, // สวนพี่หมอก
        role: 'VIEWER',
      },
    }),
    // User เข้าถึงได้สวนเดียว
    prisma.userGarden.create({
      data: {
        userId: user.id,
        ourGardenId: ourGardens[3].id, // สวนมีสุข
        role: 'VIEWER',
      },
    }),
  ])
  console.log('✅ User-garden mappings created')

  console.log('💰 Creating cost categories...')
  // สร้างหมวดหมู่ค่าใช้จ่าย
  const costCategories = await prisma.costCategory.createMany({
    data: [
      { name: 'ราคาต้นไม้', nameEn: 'Tree Price', description: 'ราคาซื้อต้นไม้จากสวน' },
      { name: 'ค่าขนส่ง', nameEn: 'Transport', description: 'ค่าขนส่งต้นไม้' },
      { name: 'ค่าเครน', nameEn: 'Crane', description: 'ค่าเครนยกต้นไม้' },
      { name: 'เครน/หน้างาน', nameEn: 'Crane/Labor', description: 'ค่าเครนและหน้างาน' },
      { name: 'ค่าไม้ค้ำ', nameEn: 'Support Wood', description: 'ค่าไม้ค้ำต้นไม้' },
      { name: 'ค่าแพค', nameEn: 'Packing', description: 'ค่าแพคต้นไม้' },
      { name: 'ค่ารถเฮียบ', nameEn: 'Truck', description: 'ค่ารถเฮียบขนส่ง' },
      { name: 'ค่ารถทอย', nameEn: 'Trailer', description: 'ค่ารถทอยขนส่ง' },
      { name: 'ค่าแรง', nameEn: 'Labor', description: 'ค่าแรงงาน' },
      { name: 'ค่าอุปกรณ์', nameEn: 'Equipment', description: 'ค่าอุปกรณ์' },
      { name: 'อื่นๆ', nameEn: 'Others', description: 'ค่าใช้จ่ายอื่นๆ' },
      { name: 'เพิ่มทุนไม้ตาย', nameEn: 'Dead Tree Fund', description: 'เพิ่มทุนสำหรับไม้ตาย' },
    ],
  })
  console.log('✅ Cost categories created')

  // ดึงข้อมูลหมวดหมู่ค่าใช้จ่าย
  const categoryList = await prisma.costCategory.findMany()

  console.log('🛒 Creating sample purchases...')
  // สร้างข้อมูลการซื้อตัวอย่าง
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseCode: 'TB68-001',
      purchaseDate: new Date('2025-01-30'),
      supplierGardenId: supplierGardens.find(g => g.name === 'รุ้งละดา')?.id || supplierGardens[2].id,
      ourGardenId: ourGardens[2].id, // สวนไม้ล้อม
      supplierRef: 'ตะแบก',
      totalCost: 42713,
      status: 'COMPLETED',
      note: 'ต้นไม้ใหญ่ สภาพดี',
    },
  })

  const purchase2 = await prisma.purchase.create({
    data: {
      purchaseCode: 'MP68-001',
      purchaseDate: new Date('2025-02-15'),
      supplierGardenId: supplierGardens.find(g => g.name === 'เพลงไทยไม้ล้อม')?.id || supplierGardens[1].id,
      ourGardenId: ourGardens[3].id, // สวนมีสุข
      supplierRef: 'พี่กิจ',
      totalCost: 17491,
      status: 'COMPLETED',
    },
  })

  console.log('✅ Sample purchases created:', 2)

  console.log('💸 Creating cost breakdowns...')
  // สร้างข้อมูลค่าใช้จ่าย
  const treePriceCategory = categoryList.find(c => c.name === 'ราคาต้นไม้')
  const transportCategory = categoryList.find(c => c.name === 'ค่าขนส่ง')
  const craneCategory = categoryList.find(c => c.name === 'ค่าเครน')
  const supportWoodCategory = categoryList.find(c => c.name === 'ค่าไม้ค้ำ')
  const packingCategory = categoryList.find(c => c.name === 'ค่าแพค')

  if (treePriceCategory && transportCategory && craneCategory && supportWoodCategory && packingCategory) {
    await prisma.productCost.createMany({
      data: [
        // ต้นไม้ TB68-001
        { purchaseId: purchase1.id, costCategoryId: treePriceCategory.id, amount: 30000 },
        { purchaseId: purchase1.id, costCategoryId: transportCategory.id, amount: 9000 },
        { purchaseId: purchase1.id, costCategoryId: supportWoodCategory.id, amount: 271 },
        { purchaseId: purchase1.id, costCategoryId: packingCategory.id, amount: 800 },
        { purchaseId: purchase1.id, costCategoryId: craneCategory.id, amount: 2500 },
        // ต้นไม้ MP68-001
        { purchaseId: purchase2.id, costCategoryId: treePriceCategory.id, amount: 8000 },
        { purchaseId: purchase2.id, costCategoryId: transportCategory.id, amount: 6500 },
        { purchaseId: purchase2.id, costCategoryId: supportWoodCategory.id, amount: 440 },
        { purchaseId: purchase2.id, costCategoryId: packingCategory.id, amount: 300 },
        { purchaseId: purchase2.id, costCategoryId: craneCategory.id, amount: 1000 },
      ],
    })
  }
  console.log('✅ Cost breakdowns created')

  console.log('🌳 Creating sample products...')
  // สร้างข้อมูลต้นไม้ตัวอย่าง
  const product1 = await prisma.product.create({
    data: {
      code: 'TB68-001',
      name: 'ตะแบก',
      height: 4.5,
      width: 60,
      trunkSize: 60,
      potHeight: 80,
      potWidth: 2.8,
      location: 'โซน A',
      cost: 42713,
      price: 80000,
      purchaseId: purchase1.id,
      ourGardenId: ourGardens[2].id, // สวนไม้ล้อม
      sunlight: 'FULL',
      water: 'LOW',
      description: 'ตะแบกขนาดใหญ่ สภาพดี หน้าไม้ 60 นิ้ว',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      code: 'MP68-001',
      name: 'พยอม',
      height: 6.0,
      width: 14,
      trunkSize: 14,
      potHeight: 60,
      potWidth: 1.2,
      location: 'โซน B',
      cost: 17491,
      price: 35000,
      purchaseId: purchase2.id,
      ourGardenId: ourGardens[3].id, // สวนมีสุข
      sunlight: 'PARTIAL',
      water: 'HIGH',
      description: 'พยอมขนาดกลาง หน้าไม้ 14 นิ้ว',
    },
  })

  console.log('✅ Sample products created:', 2)

  console.log('👤 Creating sample customer...')
  // สร้างข้อมูลลูกค้าตัวอย่าง
  const customer = await prisma.customer.create({
    data: {
      name: 'นาย สมชาย ใจดี',
      phone: '0812345678',
      address: '123 ถ.สุขุมวิท แขวงคลองตัน',
      province: 'กรุงเทพมหานคร',
      note: 'ลูกค้าประจำ',
    },
  })

  console.log('💰 Creating sample sale...')
  // สร้างข้อมูลการขายตัวอย่าง
  const sale = await prisma.sale.create({
    data: {
      productId: product2.id,
      customerId: customer.id,
      price: 35000,
      shipping: 5000,
      installation: 3000,
      otherCosts: 1000,
      totalCost: 44000,
      status: 'COMPLETED',
    },
  })

  // อัปเดตสถานะสินค้าที่ขายแล้ว
  await prisma.product.update({
    where: { id: product2.id },
    data: { status: 'SOLD' },
  })

  console.log('📊 Creating sample transactions...')
  // สร้างข้อมูลธุรกรรมการเงิน
  const transaction1 = await prisma.transaction.create({
    data: {
      date: new Date('2025-01-30'),
      description: 'ซื้อต้นไม้ตะแบก TB68-001',
      type: 'EXPENSE',
      amount: 42713,
      balance: -42713,
      referenceId: purchase1.id,
      referenceType: 'PURCHASE',
      supplierGardenId: supplierGardens.find(g => g.name === 'รุ้งละดา')?.id,
    },
  })

  const transaction2 = await prisma.transaction.create({
    data: {
      date: new Date('2025-02-20'),
      description: 'ขายต้นไม้พยอม MP68-001',
      type: 'INCOME',
      amount: 44000,
      balance: 1287,
      referenceId: sale.id,
      referenceType: 'SALE',
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log({
    users: 4,
    ourGardens: ourGardens.length,
    supplierGardens: supplierGardens.length,
    userGardenMappings: 8,
    costCategories: categoryList.length,
    purchases: 2,
    products: 2,
    customer: 1,
    sale: 1,
    transactions: 2,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })