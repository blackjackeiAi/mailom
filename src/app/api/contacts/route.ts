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
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const skip = (page - 1) * limit

    let where: any = { isActive: true }
    
    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const totalCount = await prisma.contact.count({ where })
    
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      data: contacts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
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

    const body = await request.json()
    const { 
      name, 
      type,
      phone, 
      email,
      address, 
      province, 
      district, 
      subDistrict,
      contactInfo,
      note 
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        type,
        phone,
        email,
        address,
        province,
        district,
        subDistrict,
        contactInfo,
        note
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id,
      name, 
      type,
      phone, 
      email,
      address, 
      province, 
      district, 
      subDistrict,
      contactInfo,
      note 
    } = body

    if (!id || !name || !type) {
      return NextResponse.json(
        { error: 'ID, name and type are required' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        type,
        phone,
        email,
        address,
        province,
        district,
        subDistrict,
        contactInfo,
        note
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}