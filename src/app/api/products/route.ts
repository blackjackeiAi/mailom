import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const gardenId = searchParams.get('gardenId')
    
    const skip = (page - 1) * limit

    // Build where clause
    let where: any = {}
    
    // Filter by garden access based on user role
    if (user.role !== 'ADMIN') {
      const userGardens = await prisma.userGarden.findMany({
        where: { userId: user.id },
        select: { ourGardenId: true }
      })
      const gardenIds = userGardens.map(ug => ug.ourGardenId)
      where.ourGardenId = { in: gardenIds }
    }

    // Filter by specific garden if provided
    if (gardenId) {
      where.ourGardenId = gardenId
    }
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where })
    
    // Get products with pagination and includes
    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        ourGarden: {
          select: { name: true, location: true }
        },
        purchase: {
          select: { 
            purchaseCode: true,
            supplierGarden: {
              select: { name: true }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const product = await prisma.product.create({
      data: {
        ...data,
        images: data.images ? {
          create: data.images
        } : undefined
      }
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 