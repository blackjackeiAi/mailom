import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, nameEn, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if another category with the same name exists
    const existingCategory = await prisma.costCategory.findFirst({
      where: { 
        name,
        id: { not: params.id }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.costCategory.update({
      where: { id: params.id },
      data: {
        name,
        nameEn,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating cost category:', error)
    return NextResponse.json(
      { error: 'Failed to update cost category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if category is being used
    const productCosts = await prisma.productCost.findFirst({
      where: { costCategoryId: params.id }
    })

    if (productCosts) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used' },
        { status: 400 }
      )
    }

    await prisma.costCategory.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Category deactivated successfully' })
  } catch (error) {
    console.error('Error deleting cost category:', error)
    return NextResponse.json(
      { error: 'Failed to delete cost category' },
      { status: 500 }
    )
  }
}