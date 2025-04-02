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

  // สร้างข้อมูลต้นไม้ตัวอย่าง
  const palm = await prisma.product.create({
    data: {
      code: 'T1234',
      name: 'ปาล์ม',
      height: 2.5,
      width: 1.5,
      trunkSize: 0.3,
      potHeight: 0.5,
      potWidth: 0.5,
      location: 'โซน A',
      cost: 10000,
      price: 20000,
    },
  })

  // สร้างข้อมูลลูกค้าตัวอย่าง
  const customer = await prisma.customer.create({
    data: {
      name: 'นาย ก',
      phone: '0812345678',
      address: '123 ถ.สุขุมวิท',
      province: 'กรุงเทพฯ',
    },
  })

  console.log({ admin, palm, customer })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 