import api from './api'
import type { MoodType, MoodReport } from '../types'

export const moodService = {
  log: async (mood: MoodType, note?: string) => {
    const res = await api.post('/mood', { mood, note })
    return res.data.data
  },

  getReport: async (): Promise<MoodReport> => {
    const res = await api.get('/mood/report')
    const raw = res.data.data

    // ✅ Handle empty/null case safely
    const summary = raw?.summary ?? {}
    const logs = raw?.logs ?? []

    return {
      distribution: summary as Record<MoodType, number>,
      weeklyTrend: logs.map((l: { logDate: string; mood: MoodType }) => ({
        date: l.logDate,
        mood: l.mood,
      })),
      // ✅ Safe dominant mood calculation
      dominantMood: Object.keys(summary).length > 0
        ? (Object.entries(summary as Record<string, number>)
            .sort(([, a], [, b]) => b - a)[0]?.[0] as MoodType)
        : 'neutral',
    }
  },
}