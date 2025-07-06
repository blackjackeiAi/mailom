import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'

const prisma = new PrismaClient()

// POST - Import Excel data
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const importType = formData.get('type') as string // 'gardens', 'purchases', 'products'
    const dryRun = formData.get('dryRun') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!importType) {
      return NextResponse.json(
        { error: 'Import type is required' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[worksheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in Excel file' },
        { status: 400 }
      )
    }

    let result
    switch (importType) {
      case 'gardens':
        result = await importGardens(data, dryRun)
        break
      case 'purchases':
        result = await importPurchases(data, dryRun)
        break
      case 'products':
        result = await importProducts(data, dryRun)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid import type' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { error: 'Failed to import Excel data' },
      { status: 500 }
    )
  }
}

async function importGardens(data: any[], dryRun: boolean) {
  const results = {
    total: data.length,
    success: 0,
    errors: [] as string[],
    preview: [] as any[],
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    try {
      const gardenData = {
        name: row['ชื่อสวน'] || row['Garden Name'] || row['name'],
        location: row['ที่อยู่'] || row['Location'] || row['location'],
        ownerName: row['เจ้าของ'] || row['Owner'] || row['ownerName'],
        contactInfo: row['ติดต่อ'] || row['Contact'] || row['contactInfo'],
        province: row['จังหวัด'] || row['Province'] || row['province'],
        district: row['อำเภอ'] || row['District'] || row['district'],
        subDistrict: row['ตำบล'] || row['Subdistrict'] || row['subDistrict'],
      }

      if (!gardenData.name) {
        results.errors.push(`Row ${i + 1}: Garden name is required`)
        continue
      }

      if (!dryRun) {
        // Check if garden already exists
        const existingGarden = await prisma.garden.findFirst({
          where: { name: gardenData.name },
        })

        if (existingGarden) {
          results.errors.push(`Row ${i + 1}: Garden "${gardenData.name}" already exists`)
          continue
        }

        await prisma.garden.create({ data: gardenData })
      }

      results.success++
      results.preview.push(gardenData)
    } catch (error) {
      results.errors.push(`Row ${i + 1}: ${error}`)
    }
  }

  return results
}

async function importPurchases(data: any[], dryRun: boolean) {
  const results = {
    total: data.length,
    success: 0,
    errors: [] as string[],
    preview: [] as any[],
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    try {
      const purchaseData = {
        purchaseCode: row['รหัสการซื้อ'] || row['Purchase Code'] || row['purchaseCode'],
        purchaseDate: row['วันที่ซื้อ'] || row['Purchase Date'] || row['purchaseDate'],
        gardenName: row['ชื่อสวน'] || row['Garden Name'] || row['gardenName'],
        supplierRef: row['ผู้ขาย'] || row['Supplier'] || row['supplierRef'],
        totalCost: parseFloat(row['ยอดรวม'] || row['Total Cost'] || row['totalCost'] || '0'),
        note: row['หมายเหตุ'] || row['Note'] || row['note'],
      }

      if (!purchaseData.purchaseCode || !purchaseData.purchaseDate || !purchaseData.gardenName) {
        results.errors.push(`Row ${i + 1}: Purchase code, date, and garden name are required`)
        continue
      }

      if (!dryRun) {
        // Find garden by name
        const garden = await prisma.garden.findFirst({
          where: { name: purchaseData.gardenName },
        })

        if (!garden) {
          results.errors.push(`Row ${i + 1}: Garden "${purchaseData.gardenName}" not found`)
          continue
        }

        // Check if purchase code already exists
        const existingPurchase = await prisma.purchase.findUnique({
          where: { purchaseCode: purchaseData.purchaseCode },
        })

        if (existingPurchase) {
          results.errors.push(`Row ${i + 1}: Purchase code "${purchaseData.purchaseCode}" already exists`)
          continue
        }

        await prisma.purchase.create({
          data: {
            purchaseCode: purchaseData.purchaseCode,
            purchaseDate: new Date(purchaseData.purchaseDate),
            gardenId: garden.id,
            supplierRef: purchaseData.supplierRef,
            totalCost: purchaseData.totalCost,
            note: purchaseData.note,
          },
        })
      }

      results.success++
      results.preview.push(purchaseData)
    } catch (error) {
      results.errors.push(`Row ${i + 1}: ${error}`)
    }
  }

  return results
}

async function importProducts(data: any[], dryRun: boolean) {
  const results = {
    total: data.length,
    success: 0,
    errors: [] as string[],
    preview: [] as any[],
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    try {
      const productData = {
        code: row['รหัสสินค้า'] || row['Product Code'] || row['code'],
        name: row['ชื่อสินค้า'] || row['Product Name'] || row['name'],
        description: row['รายละเอียด'] || row['Description'] || row['description'],
        height: parseFloat(row['ความสูง'] || row['Height'] || row['height'] || '0'),
        width: parseFloat(row['หน้าไม้'] || row['Width'] || row['width'] || '0'),
        cost: parseFloat(row['ต้นทุน'] || row['Cost'] || row['cost'] || '0'),
        price: parseFloat(row['ราคาขาย'] || row['Price'] || row['price'] || '0'),
        purchaseCode: row['รหัสการซื้อ'] || row['Purchase Code'] || row['purchaseCode'],
        location: row['ที่อยู่'] || row['Location'] || row['location'],
      }

      if (!productData.code || !productData.name) {
        results.errors.push(`Row ${i + 1}: Product code and name are required`)
        continue
      }

      if (!dryRun) {
        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { code: productData.code },
        })

        if (existingProduct) {
          results.errors.push(`Row ${i + 1}: Product code "${productData.code}" already exists`)
          continue
        }

        // Find purchase by code if provided
        let purchaseId = null
        if (productData.purchaseCode) {
          const purchase = await prisma.purchase.findUnique({
            where: { purchaseCode: productData.purchaseCode },
          })
          
          if (purchase) {
            purchaseId = purchase.id
          } else {
            results.errors.push(`Row ${i + 1}: Purchase code "${productData.purchaseCode}" not found`)
            continue
          }
        }

        await prisma.product.create({
          data: {
            code: productData.code,
            name: productData.name,
            description: productData.description,
            height: productData.height,
            width: productData.width,
            cost: productData.cost,
            price: productData.price,
            purchaseId,
            location: productData.location,
          },
        })
      }

      results.success++
      results.preview.push(productData)
    } catch (error) {
      results.errors.push(`Row ${i + 1}: ${error}`)
    }
  }

  return results
}