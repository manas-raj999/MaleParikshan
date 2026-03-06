import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { calculateBMI, calculateRiskScore } from '../utils/bmi';

const profileSchema = z.object({
  height: z.number().min(50).max(300),
  weight: z.number().min(10).max(500),
  sleepHours: z.number().min(0).max(24),
  activityLevel: z.enum(['Low', 'Moderate', 'High']),
  goals: z.array(z.string()).min(1),
});

export const setupProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const data = profileSchema.parse(req.body);

    const bmi = calculateBMI(data.weight, data.height);
    const riskScore = calculateRiskScore(bmi, data.sleepHours, data.activityLevel);

    const profile = await prisma.healthProfile.upsert({
      where: { userId },
      create: { userId, ...data, bmi, riskScore },
      update: { ...data, bmi, riskScore },
    });

    sendSuccess(res, profile, 'Profile saved successfully');
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, age: true, language: true,
        adultModeEnabled: true, isGuest: true, createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};
