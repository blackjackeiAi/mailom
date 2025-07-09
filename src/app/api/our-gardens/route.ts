import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    console.log('Our gardens API called')
    const user = await getUserFromToken(request)
    console.log('User from token:', user)
    if (!user) {
      console.log('No user found, unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = { isActive: true }

    // Role-based filtering
    if (user.role !== 'ADMIN') {
      // Non-admin users can only see gardens they have access to
      const userGardens = await prisma.userGarden.findMany({
        where: { userId: user.id },
        select: { ourGardenId: true }
      })
      
      const gardenIds = userGardens.map(ug => ug.ourGardenId)
      where.id = { in: gardenIds }
    }

    const gardens = await prisma.ourGarden.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
            purchases: true,
            userGardens: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      data: gardens,
      pagination: {
        page: 1,
        limit: gardens.length,
        total: gardens.length,
        pages: 1
      }
    })
  } catch (error) {
    console.error('Error fetching our gardens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch our gardens' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, description, managerName, contactInfo } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Garden name is required' },
        { status: 400 }
      )
    }

    const garden = await prisma.ourGarden.create({
      data: {
        name,
        location,
        description,
        managerName,
        contactInfo
      }
    })

    return NextResponse.json(garden, { status: 201 })
  } catch (error) {
    console.error('Error creating our garden:', error)
    return NextResponse.json(
      { error: 'Failed to create our garden' },
      { status: 500 }
    )
  }
}