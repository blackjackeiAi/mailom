import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true,
        customer: true
      }
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const sale = await prisma.sale.create({
      data: {
        ...data,
        totalCost: data.price + (data.shipping || 0) + (data.installation || 0) + (data.otherCosts || 0)
      },
      include: {
        product: true,
        customer: true
      }
    })
    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
} 