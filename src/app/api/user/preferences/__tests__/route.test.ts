import { NextRequest } from 'next/server';
import { GET, PUT } from '../route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    userPreferences: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

describe('User Preferences API', () => {
  let mockRequest: NextRequest;
  const mockUserId = 'test-user-id';
  const mockPreferences = {
    theme: 'dark',
    language: 'en',
    notifications: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/user/preferences', {
      method: 'GET',
    });
  });

  describe('GET /api/user/preferences', () => {
    it('returns user preferences when authenticated', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      // Mock prisma response
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        ...mockPreferences,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        userId: mockUserId,
        ...mockPreferences,
      });
    });

    it('returns 401 when not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 when database error occurs', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      // Mock database error
      (prisma.userPreferences.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await GET();

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });

  describe('PUT /api/user/preferences', () => {
    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockPreferences),
      });
    });

    it('updates user preferences when authenticated', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      // Mock prisma response
      (prisma.userPreferences.upsert as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        ...mockPreferences,
      });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        userId: mockUserId,
        ...mockPreferences,
      });
      expect(prisma.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        update: mockPreferences,
        create: {
          userId: mockUserId,
          ...mockPreferences,
        },
      });
    });

    it('returns 401 when not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await PUT(mockRequest);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 when request body is invalid', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      // Create request with invalid body
      const invalidRequest = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await PUT(invalidRequest);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Invalid request body' });
    });

    it('returns 500 when database error occurs', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      // Mock database error
      (prisma.userPreferences.upsert as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await PUT(mockRequest);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Internal server error' });
    });
  });
}); 