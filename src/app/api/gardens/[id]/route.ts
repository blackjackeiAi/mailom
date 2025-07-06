import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get garden by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const garden = await prisma.garden.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            productCosts: {
              include: {
                costCategory: true,
              },
            },
          },
          orderBy: {
            purchaseDate: 'desc',
          },
        },
        transactions: {
          orderBy: {
            date: 'desc',
          },
        },
        _count: {
          select: {
            purchases: true,
            transactions: true,
          },
        },
      },
    })

    if (!garden) {
      return NextResponse.json(
        { error: 'Garden not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(garden)
  } catch (error) {
    console.error('Error fetching garden:', error)
    return NextResponse.json(
      { error: 'Failed to fetch garden' },
      { status: 500 }
    )
  }
}

// PUT - Update garden
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const {
      name,
      location,
      ownerName,
      contactInfo,
      province,
      district,
      subDistrict,
      isActive,
    } = body

    // Check if garden exists
    const existingGarden = await prisma.garden.findUnique({
      where: { id },
    })

    if (!existingGarden) {
      return NextResponse.json(
        { error: 'Garden not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Garden name is required' },
        { status: 400 }
      )
    }

    const garden = await prisma.garden.update({
      where: { id },
      data: {
        name,
        location,
        ownerName,
        contactInfo,
        province,
        district,
        subDistrict,
        isActive,
      },
    })

    return NextResponse.json(garden)
  } catch (error) {
    console.error('Error updating garden:', error)
    return NextResponse.json(
      { error: 'Failed to update garden' },
      { status: 500 }
    )
  }
}

// DELETE - Delete garden
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if garden exists
    const existingGarden = await prisma.garden.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchases: true,
            transactions: true,
          },
        },
      },
    })

    if (!existingGarden) {
      return NextResponse.json(
        { error: 'Garden not found' },
        { status: 404 }
      )
    }

    // Check if garden has associated records
    if (existingGarden._count.purchases > 0 || existingGarden._count.transactions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete garden with associated purchases or transactions' },
        { status: 400 }
      )
    }

    await prisma.garden.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Garden deleted successfully' })
  } catch (error) {
    console.error('Error deleting garden:', error)
    return NextResponse.json(
      { error: 'Failed to delete garden' },
      { status: 500 }
    )
  }
}