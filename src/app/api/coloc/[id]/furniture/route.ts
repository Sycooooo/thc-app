import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non membre' }, { status: 403 })
  }

  const furniture = await prisma.placedFurniture.findMany({
    where: { colocId },
    include: {
      item: {
        select: {
          id: true, name: true, furnitureCategory: true, modelKey: true,
          widthCm: true, depthCm: true, heightCm: true, colorHex: true, rarity: true,
        },
      },
      placedBy: { select: { id: true, username: true } },
    },
  })

  return NextResponse.json(furniture)
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const { itemId, roomId, posX, posZ, rotation = 0 } = await request.json()

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non membre' }, { status: 403 })
  }

  // Check ownership (owned or free)
  const item = await prisma.shopItem.findUnique({ where: { id: itemId } })
  if (!item || item.type !== 'decoration') {
    return NextResponse.json({ error: 'Item invalide' }, { status: 400 })
  }

  if (!item.isFree) {
    const owned = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId } },
    })
    if (!owned) {
      return NextResponse.json({ error: 'Item non possédé' }, { status: 403 })
    }
  }

  // Check room constraint
  if (item.roomConstraint && item.roomConstraint !== roomId) {
    return NextResponse.json({ error: `Ce meuble ne peut être placé que dans: ${item.roomConstraint}` }, { status: 400 })
  }

  const placed = await prisma.placedFurniture.create({
    data: {
      posX, posZ, rotation,
      roomId,
      colocId,
      placedById: session.user.id,
      itemId,
    },
    include: {
      item: {
        select: {
          id: true, name: true, furnitureCategory: true, modelKey: true,
          widthCm: true, depthCm: true, heightCm: true, colorHex: true, rarity: true,
        },
      },
    },
  })

  return NextResponse.json(placed, { status: 201 })
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const { furnitureId, posX, posZ, rotation } = await request.json()

  const furniture = await prisma.placedFurniture.findUnique({ where: { id: furnitureId } })
  if (!furniture || furniture.colocId !== colocId) {
    return NextResponse.json({ error: 'Meuble introuvable' }, { status: 404 })
  }

  // Only the placer or an admin can move
  if (furniture.placedById !== session.user.id) {
    const membership = await prisma.userColoc.findUnique({
      where: { userId_colocId: { userId: session.user.id, colocId } },
    })
    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
  }

  const updated = await prisma.placedFurniture.update({
    where: { id: furnitureId },
    data: {
      ...(posX !== undefined && { posX }),
      ...(posZ !== undefined && { posZ }),
      ...(rotation !== undefined && { rotation }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const { furnitureId } = await request.json()

  const furniture = await prisma.placedFurniture.findUnique({ where: { id: furnitureId } })
  if (!furniture || furniture.colocId !== colocId) {
    return NextResponse.json({ error: 'Meuble introuvable' }, { status: 404 })
  }

  if (furniture.placedById !== session.user.id) {
    const membership = await prisma.userColoc.findUnique({
      where: { userId_colocId: { userId: session.user.id, colocId } },
    })
    if (membership?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
  }

  await prisma.placedFurniture.delete({ where: { id: furnitureId } })

  return NextResponse.json({ success: true })
}
