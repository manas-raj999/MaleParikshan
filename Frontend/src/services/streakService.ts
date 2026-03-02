import api from './api'
import type { Streak } from '../types'

export const streakService = {
  setup: async (targetDays: number) => {
    const res = await api.post('/streak/setup', { targetDays })
    return res.data.data  // ← changed
  },

  checkin: async (option: 'stayed_consistent' | 'resisted_urges' | 'relapsed') => {
    const res = await api.post('/streak/checkin', { option })  // ← status → option
    return res.data.data  // ← changed
  },

  get: async () => {
    const res = await api.get('/streak')
    return res.data.data  // ← changed
  },
}