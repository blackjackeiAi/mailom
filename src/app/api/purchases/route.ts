import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all purchases with cost breakdown
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const gardenId = searchParams.get('gardenId')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    let where: any = {}

    if (search) {
      where.OR = [
        { purchaseCode: { contains: search } },
        { supplierRef: { contains: search } },
        { note: { contains: search } },
        { supplierGarden: { name: { contains: search } } },
      ]
    }

    if (gardenId) {
      where.supplierGardenId = gardenId
    }

    if (status) {
      where.status = status
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplierGarden: {
            select: {
              id: true,
              name: true,
              location: true,
              ownerName: true,
            },
          },
          productCosts: {
            include: {
              costCategory: true,
            },
          },
          products: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              products: true,
              productCosts: true,
            },
          },
        },
        orderBy: {
          purchaseDate: 'desc',
        },
      }),
      prisma.purchase.count({ where }),
    ])

    // Calculate additional metrics for each purchase
    const purchasesWithMetrics = purchases.map(purchase => {
      const totalCostFromBreakdown = purchase.productCosts.reduce(
        (sum, cost) => sum + cost.amount,
        0
      )
      
      const costByCategory = purchase.productCosts.reduce((acc, cost) => {
        const categoryName = cost.costCategory.name
        acc[categoryName] = (acc[categoryName] || 0) + cost.amount
        return acc
      }, {} as Record<string, number>)

      return {
        ...purchase,
        metrics: {
          totalCostFromBreakdown,
          costByCategory,
          productCount: purchase._count.products,
          costPerProduct: purchase._count.products > 0 
            ? purchase.totalCost / purchase._count.products 
            : 0,
        },
      }
    })

    return NextResponse.json({
      data: purchasesWithMetrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

// POST - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      purchaseCode,
      purchaseDate,
      supplierGardenId,
      ourGardenId,
      supplierRef,
      totalCost,
      status = 'PENDING',
      note,
      productCosts = [],
    } = body

    // Validate required fields
    if (!purchaseCode || !purchaseDate || !supplierGardenId || !totalCost) {
      return NextResponse.json(
        { error: 'Purchase code, date, supplier garden, and total cost are required' },
        { status: 400 }
      )
    }

    // Check if purchase code already exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: { purchaseCode },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Purchase code already exists' },
        { status: 400 }
      )
    }

    // Check if supplier garden exists
    const supplierGarden = await prisma.supplierGarden.findUnique({
      where: { id: supplierGardenId },
    })

    if (!supplierGarden) {
      return NextResponse.json(
        { error: 'Supplier garden not found' },
        { status: 404 }
      )
    }

    // Create purchase with cost breakdown
    const purchase = await prisma.purchase.create({
      data: {
        purchaseCode,
        purchaseDate: new Date(purchaseDate),
        supplierGardenId,
        ourGardenId,
        supplierRef,
        totalCost,
        status,
        note,
        productCosts: {
          create: productCosts.map((cost: any) => ({
            costCategoryId: cost.costCategoryId,
            amount: cost.amount,
            description: cost.description,
          })),
        },
      },
      include: {
        supplierGarden: true,
        ourGarden: true,
        productCosts: {
          include: {
            costCategory: true,
          },
        },
      },
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
}