import api from './api'
import type { DashboardData } from '../types'

export const dashboardService = {
  get: async () => {
    const res = await api.get('/dashboard')
    return res.data.data  // ← changed
  },
}