import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get cost analysis data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const gardenId = searchParams.get('gardenId')
    const type = searchParams.get('type') || 'summary' // summary, byCategory, byGarden, byMonth

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    }

    let gardenFilter = {}
    if (gardenId) {
      gardenFilter = { gardenId }
    }

    const baseFilter = { ...dateFilter, ...gardenFilter }

    switch (type) {
      case 'summary':
        return await getCostSummary(baseFilter)
      case 'byCategory':
        return await getCostByCategory(baseFilter)
      case 'byGarden':
        return await getCostByGarden(baseFilter)
      case 'byMonth':
        return await getCostByMonth(baseFilter)
      case 'profitAnalysis':
        return await getProfitAnalysis(baseFilter)
      default:
        return await getCostSummary(baseFilter)
    }
  } catch (error) {
    console.error('Error fetching cost analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost analysis' },
      { status: 500 }
    )
  }
}

async function getCostSummary(filter: any) {
  const [
    totalPurchases,
    totalCost,
    totalProducts,
    totalSales,
    totalRevenue,
    avgCostPerProduct,
    recentPurchases,
  ] = await Promise.all([
    prisma.purchase.count({ where: filter }),
    prisma.purchase.aggregate({
      where: filter,
      _sum: { totalCost: true },
    }),
    prisma.product.count({
      where: filter.gardenId ? { purchase: { gardenId: filter.gardenId } } : {},
    }),
    prisma.sale.count(),
    prisma.sale.aggregate({
      _sum: { totalCost: true },
    }),
    prisma.product.aggregate({
      _avg: { cost: true },
    }),
    prisma.purchase.findMany({
      where: filter,
      take: 5,
      orderBy: { purchaseDate: 'desc' },
      include: {
        garden: { select: { name: true } },
        _count: { select: { products: true } },
      },
    }),
  ])

  const totalCostValue = totalCost._sum.totalCost || 0
  const totalRevenueValue = totalRevenue._sum.totalCost || 0
  const grossProfit = totalRevenueValue - totalCostValue
  const profitMargin = totalRevenueValue > 0 ? (grossProfit / totalRevenueValue) * 100 : 0

  return NextResponse.json({
    summary: {
      totalPurchases,
      totalCost: totalCostValue,
      totalProducts,
      totalSales,
      totalRevenue: totalRevenueValue,
      grossProfit,
      profitMargin,
      avgCostPerProduct: avgCostPerProduct._avg.cost || 0,
    },
    recentPurchases,
  })
}

async function getCostByCategory(filter: any) {
  const costsByCategory = await prisma.productCost.groupBy({
    by: ['costCategoryId'],
    where: {
      purchase: filter,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  })

  const categoriesWithNames = await Promise.all(
    costsByCategory.map(async (cost) => {
      const category = await prisma.costCategory.findUnique({
        where: { id: cost.costCategoryId },
        select: { name: true, nameEn: true },
      })
      return {
        category: category?.name || 'Unknown',
        categoryEn: category?.nameEn || 'Unknown',
        totalAmount: cost._sum.amount || 0,
        transactionCount: cost._count.id,
      }
    })
  )

  const totalAmount = categoriesWithNames.reduce((sum, cat) => sum + cat.totalAmount, 0)
  
  const categoriesWithPercentage = categoriesWithNames.map(cat => ({
    ...cat,
    percentage: totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0,
  }))

  return NextResponse.json({
    categories: categoriesWithPercentage,
    totalAmount,
  })
}

async function getCostByGarden(filter: any) {
  const costsByGarden = await prisma.purchase.groupBy({
    by: ['gardenId'],
    where: filter,
    _sum: {
      totalCost: true,
    },
    _count: {
      id: true,
    },
  })

  const gardensWithCosts = await Promise.all(
    costsByGarden.map(async (cost) => {
      const garden = await prisma.garden.findUnique({
        where: { id: cost.gardenId },
        select: { name: true, location: true, ownerName: true },
      })
      return {
        garden: garden?.name || 'Unknown',
        location: garden?.location || 'Unknown',
        ownerName: garden?.ownerName || 'Unknown',
        totalCost: cost._sum.totalCost || 0,
        purchaseCount: cost._count.id,
      }
    })
  )

  const totalCost = gardensWithCosts.reduce((sum, garden) => sum + garden.totalCost, 0)
  
  const gardensWithPercentage = gardensWithCosts.map(garden => ({
    ...garden,
    percentage: totalCost > 0 ? (garden.totalCost / totalCost) * 100 : 0,
  }))

  return NextResponse.json({
    gardens: gardensWithPercentage,
    totalCost,
  })
}

async function getCostByMonth(filter: any) {
  const purchases = await prisma.purchase.findMany({
    where: filter,
    select: {
      purchaseDate: true,
      totalCost: true,
    },
    orderBy: {
      purchaseDate: 'asc',
    },
  })

  const monthlyData = purchases.reduce((acc, purchase) => {
    const month = purchase.purchaseDate.toISOString().slice(0, 7) // YYYY-MM format
    if (!acc[month]) {
      acc[month] = { totalCost: 0, purchaseCount: 0 }
    }
    acc[month].totalCost += purchase.totalCost
    acc[month].purchaseCount += 1
    return acc
  }, {} as Record<string, { totalCost: number; purchaseCount: number }>)

  const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    totalCost: data.totalCost,
    purchaseCount: data.purchaseCount,
    avgCostPerPurchase: data.purchaseCount > 0 ? data.totalCost / data.purchaseCount : 0,
  }))

  return NextResponse.json({
    monthlyData: monthlyArray,
  })
}

async function getProfitAnalysis(filter: any) {
  const products = await prisma.product.findMany({
    where: filter.gardenId ? { purchase: { gardenId: filter.gardenId } } : {},
    include: {
      sales: {
        select: {
          totalCost: true,
          status: true,
        },
      },
      purchase: {
        select: {
          garden: {
            select: { name: true },
          },
        },
      },
    },
  })

  const analysis = products.map(product => {
    const soldSales = product.sales.filter(sale => sale.status === 'COMPLETED')
    const totalRevenue = soldSales.reduce((sum, sale) => sum + sale.totalCost, 0)
    const profit = totalRevenue - product.cost
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    return {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      cost: product.cost,
      price: product.price,
      totalRevenue,
      profit,
      profitMargin,
      status: product.status,
      garden: product.purchase?.garden?.name || 'Unknown',
      salesCount: soldSales.length,
    }
  })

  const summary = analysis.reduce(
    (acc, item) => {
      acc.totalCost += item.cost
      acc.totalRevenue += item.totalRevenue
      acc.totalProfit += item.profit
      acc.soldProducts += item.salesCount
      return acc
    },
    { totalCost: 0, totalRevenue: 0, totalProfit: 0, soldProducts: 0, totalProfitMargin: 0 }
  )

  summary.totalProfitMargin = summary.totalRevenue > 0 
    ? (summary.totalProfit / summary.totalRevenue) * 100 
    : 0

  return NextResponse.json({
    products: analysis,
    summary,
  })
}