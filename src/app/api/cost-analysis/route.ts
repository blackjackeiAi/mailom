import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const gardenId = searchParams.get('gardenId')

    if (type === 'summary') {
      // Build where clause based on user role and selected garden
      let whereClause: any = {}
      
      // If user is not admin, filter by accessible gardens
      if (user.role !== 'ADMIN') {
        const userGardens = await prisma.userGarden.findMany({
          where: { userId: user.id },
          select: { ourGardenId: true }
        })
        const gardenIds = userGardens.map(ug => ug.ourGardenId)
        whereClause.ourGardenId = { in: gardenIds }
      }

      // If specific garden is selected
      if (gardenId) {
        whereClause.ourGardenId = gardenId
      }

      // Get purchase summary
      const purchaseStats = await prisma.purchase.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { totalCost: true }
      })

      // Get product stats
      const productStats = await prisma.product.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { cost: true, price: true }
      })

      // Get sales stats
      const salesStats = await prisma.sale.aggregate({
        where: {
          product: whereClause
        },
        _count: { id: true },
        _sum: { totalCost: true }
      })

      // Calculate metrics
      const totalCost = purchaseStats._sum.totalCost || 0
      const totalRevenue = salesStats._sum.totalCost || 0
      const grossProfit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const avgCostPerProduct = productStats._count.id > 0 ? (productStats._sum.cost || 0) / productStats._count.id : 0

      // Get recent purchases
      const recentPurchases = await prisma.purchase.findMany({
        where: whereClause,
        include: {
          supplierGarden: {
            select: { name: true }
          },
          _count: {
            select: { products: true }
          }
        },
        orderBy: { purchaseDate: 'desc' },
        take: 5
      })

      return NextResponse.json({
        summary: {
          totalPurchases: purchaseStats._count.id,
          totalCost,
          totalProducts: productStats._count.id,
          totalSales: salesStats._count.id,
          totalRevenue,
          grossProfit,
          profitMargin,
          avgCostPerProduct
        },
        recentPurchases: recentPurchases.map(purchase => ({
          ...purchase,
          garden: { name: purchase.supplierGarden.name }
        }))
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Error in cost analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}