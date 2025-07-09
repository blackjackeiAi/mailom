import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    let where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } }
      ]
    }

    const totalCount = await prisma.supplierGarden.count({ where })
    
    const gardens = await prisma.supplierGarden.findMany({
      where,
      include: {
        _count: {
          select: {
            purchases: true,
            transactions: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      data: gardens,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching supplier gardens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier gardens' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      location, 
      ownerName, 
      contactInfo, 
      province, 
      district, 
      subDistrict 
    } = body

    if (!name || !ownerName) {
      return NextResponse.json(
        { error: 'Garden name and owner name are required' },
        { status: 400 }
      )
    }

    const garden = await prisma.supplierGarden.create({
      data: {
        name,
        location,
        ownerName,
        contactInfo,
        province,
        district,
        subDistrict
      }
    })

    return NextResponse.json(garden, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier garden:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier garden' },
      { status: 500 }
    )
  }
}