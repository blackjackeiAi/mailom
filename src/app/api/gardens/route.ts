import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all gardens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { location: { contains: search } },
            { ownerName: { contains: search } },
            { province: { contains: search } },
          ],
        }
      : {}

    const [gardens, total] = await Promise.all([
      prisma.garden.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              purchases: true,
              transactions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.garden.count({ where }),
    ])

    return NextResponse.json({
      data: gardens,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching gardens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gardens' },
      { status: 500 }
    )
  }
}

// POST - Create a new garden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      location,
      ownerName,
      contactInfo,
      province,
      district,
      subDistrict,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Garden name is required' },
        { status: 400 }
      )
    }

    const garden = await prisma.garden.create({
      data: {
        name,
        location,
        ownerName,
        contactInfo,
        province,
        district,
        subDistrict,
      },
    })

    return NextResponse.json(garden, { status: 201 })
  } catch (error) {
    console.error('Error creating garden:', error)
    return NextResponse.json(
      { error: 'Failed to create garden' },
      { status: 500 }
    )
  }
}