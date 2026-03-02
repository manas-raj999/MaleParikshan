export interface User {
  id: string
  email?: string
  age?: number
  language: 'English' | 'Hindi'
  adultModeEnabled: boolean
  isGuest?: boolean
  createdAt?: string
}

export interface Profile {
  id: string
  userId: string
  height: number
  weight: number
  bmi: number
  sleepHours: number
  activityLevel: 'Low' | 'Moderate' | 'High'
  goals: string[]
  riskScore: number
}

export interface Streak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  targetDays: number
  lastCheckDate?: string   // ← fixed: was lastCheckinDate
  createdAt: string
  updatedAt: string
}

// ✅ Fixed: matches backend exactly
export type MoodType = 'calm' | 'angry' | 'low' | 'confident' | 'neutral'

export interface MoodEntry {
  id: string
  mood: MoodType
  createdAt: string
}

export interface MoodReport {
  distribution: Record<MoodType, number>
  weeklyTrend: { date: string; mood: MoodType }[]
  dominantMood: MoodType
}

export interface Module {
  id: string
  title: string
  description: string
  content?: string
  completed: boolean
  category: string
  isAdultOnly: boolean
  order: number
  progress?: { completed: boolean; completedAt?: string }[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface DashboardData {
  healthScore: number
  streak: {
    current: number
    longest: number
    target: number
  } | null
  todayMood?: MoodType
  modulesCompleted: number
  user: {
    id: string
    email?: string
    age?: number
    language: string
    adultModeEnabled: boolean
    isGuest: boolean
    profile?: {
      bmi: number
      riskScore: number
      activityLevel: string
      goals: string[]
    } | null
  }
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  statusCode?: number
}