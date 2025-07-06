import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // สร้าง admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mailom.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // สร้างข้อมูลสวนต้นไม้ตัวอย่าง
  const gardens = await prisma.garden.createMany({
    data: [
      {
        name: 'ตุ่น อุบล',
        location: 'อุบลราชธานี',
        ownerName: 'พี่ตุ่น',
        province: 'อุบลราชธานี',
        district: 'เมืองอุบลราชธานี',
      },
      {
        name: 'เพลงไทยไม้ล้อม',
        location: 'ร้อยเอ็ด',
        ownerName: 'พี่เพลง',
        province: 'ร้อยเอ็ด',
      },
      {
        name: 'สวนพี่ทิต',
        location: 'ขอนแก่น',
        ownerName: 'พี่ทิต',
        province: 'ขอนแก่น',
      },
      {
        name: 'อ.ชำนาญ',
        location: 'ชำนาญ',
        ownerName: 'พี่หมอก',
        province: 'บุรีรัมย์',
      },
      {
        name: 'รุ้งละดา',
        location: 'มหาสารคาม',
        ownerName: 'พี่รุ้ง',
        province: 'มหาสารคาม',
      },
    ],
  })

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

  // ดึงข้อมูลสวนและหมวดหมู่ค่าใช้จ่าย
  const gardenList = await prisma.garden.findMany()
  const categoryList = await prisma.costCategory.findMany()

  // สร้างข้อมูลการซื้อตัวอย่าง
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseCode: 'TB68-001',
      purchaseDate: new Date('2025-01-30'),
      gardenId: gardenList.find(g => g.name === 'รุ้งละดา')?.id || gardenList[0].id,
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
      gardenId: gardenList.find(g => g.name === 'เพลงไทยไม้ล้อม')?.id || gardenList[1].id,
      supplierRef: 'พี่กิจ',
      totalCost: 17491,
      status: 'COMPLETED',
    },
  })

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
      sunlight: 'PARTIAL',
      water: 'HIGH',
      description: 'พยอมขนาดกลาง หน้าไม้ 14 นิ้ว',
    },
  })

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
      gardenId: gardenList.find(g => g.name === 'รุ้งละดา')?.id,
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
    admin,
    gardens: gardenList.length,
    costCategories: categoryList.length,
    purchases: 2,
    products: 2,
    customer,
    sale,
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