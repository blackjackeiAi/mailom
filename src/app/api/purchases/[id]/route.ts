import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get purchase by ID with full cost breakdown
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        garden: true,
        productCosts: {
          include: {
            costCategory: true,
          },
        },
        products: {
          include: {
            images: true,
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Calculate additional metrics
    const totalCostFromBreakdown = purchase.productCosts.reduce(
      (sum, cost) => sum + cost.amount,
      0
    )
    
    const costByCategory = purchase.productCosts.reduce((acc, cost) => {
      const categoryName = cost.costCategory.name
      acc[categoryName] = (acc[categoryName] || 0) + cost.amount
      return acc
    }, {} as Record<string, number>)

    const metrics = {
      totalCostFromBreakdown,
      costByCategory,
      productCount: purchase.products.length,
      costPerProduct: purchase.products.length > 0 
        ? purchase.totalCost / purchase.products.length 
        : 0,
      variance: purchase.totalCost - totalCostFromBreakdown,
    }

    return NextResponse.json({
      ...purchase,
      metrics,
    })
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    )
  }
}

// PUT - Update purchase
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const {
      purchaseCode,
      purchaseDate,
      gardenId,
      supplierRef,
      totalCost,
      status,
      note,
      productCosts = [],
    } = body

    // Check if purchase exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
    })

    if (!existingPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Check if purchase code conflicts with another purchase
    if (purchaseCode && purchaseCode !== existingPurchase.purchaseCode) {
      const conflictingPurchase = await prisma.purchase.findUnique({
        where: { purchaseCode },
      })

      if (conflictingPurchase) {
        return NextResponse.json(
          { error: 'Purchase code already exists' },
          { status: 400 }
        )
      }
    }

    // Update purchase with cost breakdown
    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        purchaseCode,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        gardenId,
        supplierRef,
        totalCost,
        status,
        note,
        productCosts: {
          deleteMany: {},
          create: productCosts.map((cost: any) => ({
            costCategoryId: cost.costCategoryId,
            amount: cost.amount,
            description: cost.description,
          })),
        },
      },
      include: {
        garden: true,
        productCosts: {
          include: {
            costCategory: true,
          },
        },
      },
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    )
  }
}

// DELETE - Delete purchase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if purchase exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!existingPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Check if purchase has associated products
    if (existingPurchase._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete purchase with associated products' },
        { status: 400 }
      )
    }

    await prisma.purchase.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Purchase deleted successfully' })
  } catch (error) {
    console.error('Error deleting purchase:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    )
  }
}