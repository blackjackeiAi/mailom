import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET - Get all cost categories
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const categories = await prisma.costCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            productCosts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching cost categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost categories' },
      { status: 500 }
    )
  }
}

// POST - Create a new cost category
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      name,
      nameEn,
      description,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await prisma.costCategory.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.costCategory.create({
      data: {
        name,
        nameEn,
        description,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating cost category:', error)
    return NextResponse.json(
      { error: 'Failed to create cost category' },
      { status: 500 }
    )
  }
}