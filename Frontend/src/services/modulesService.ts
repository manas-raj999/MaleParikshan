import api from './api'
import type { Module } from '../types'

export const modulesService = {
  getAll: async () => {
    const res = await api.get('/modules')
    return res.data.data  // ← changed
  },

  markComplete: async (moduleId: string) => {
    const res = await api.post('/modules/progress', { moduleId, completed: true })
    return res.data.data  // ← changed
  },
}