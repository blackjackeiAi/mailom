import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unique tree names from existing products
    const uniqueNames = await prisma.product.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' }
    })

    const treeNames = uniqueNames.map(item => item.name)

    return NextResponse.json({
      data: treeNames
    })
  } catch (error) {
    console.error('Error fetching tree names:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tree names' },
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

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Tree name is required' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existing = await prisma.product.findFirst({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tree name already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Tree name can be used',
      name
    })
  } catch (error) {
    console.error('Error validating tree name:', error)
    return NextResponse.json(
      { error: 'Failed to validate tree name' },
      { status: 500 }
    )
  }
}