import api from './api'
import type { Profile } from '../types'

export interface ProfileSetupPayload {
  height: number
  weight: number
  sleepHours: number
  activityLevel: 'Low' | 'Moderate' | 'High'
  goals: string[]
}

export interface ProfileSetupResponse {
  profile: Profile
  bmi: number
  riskScore: number
  suggestions?: string[]
}

export const profileService = {
  getMe: async () => {
    const res = await api.get('/profile/me')
    return res.data.data  // ← changed
  },

  setup: async (data: ProfileSetupPayload) => {
    const res = await api.post('/profile/setup', data)
    return res.data.data  // ← changed
  },
}