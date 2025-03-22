import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { language, theme, notifications } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        language,
        theme,
        notifications,
      },
      create: {
        userId: session.user.id,
        language,
        theme,
        notifications,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 