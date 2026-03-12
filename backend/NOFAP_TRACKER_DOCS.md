# NoFap/Self-Control Tracker 🔥

## Overview

The NoFap/Self-Control Tracker is a specialized feature within the **Adult Mode** of the Male Parikshan application. It helps users build discipline and self-control through daily tracking and milestone-based rewards.

---

## 🎯 Features

### 1. **Initial Setup (One-time)**

When users first access the NoFap Tracker, they must set their commitment target:

**Options:**
- **7 days** - Quick challenge
- **30 days** - Standard goal
- **90 days** - Extended commitment  
- **Custom** - User-defined target (1-365 days)

**What gets stored:**
- `targetDays` - User's chosen goal
- `currentStreak` - Starts at 0
- `longestStreak` - Starts at 0

---

### 2. **Main Tracker Screen**

Displays comprehensive streak information:

```
┌─────────────────────────────┐
│    Current Streak: 12 days  │  ← Large, prominent display
│                             │
│  Longest: 45 | Target: 90   │  ← Supporting stats
│                             │
│  Progress: ████████░░ 54%   │  ← Visual progress bar
│  38 days remaining          │
└─────────────────────────────┘
```

**UI Components:**
- **Current Streak** - Bold, large number (emoji: 🔥)
- **Longest Streak** - Best personal record
- **Progress Bar** - Visual representation of goal progress
- **Days Remaining** - Math: targetDays - currentStreak
- **Color Scheme**
  - Accent color for current streak
  - Gold for milestones
  - Gradient backgrounds for premium feel

---

### 3. **Daily Check-In System**

Users can check in **once per day** with three options:

#### **Button 1: ✅ Stayed Consistent**
- **Effect:** `currentStreak++`
- **Color:** Teal/Green
- **Message:** Productive day without urges
- **Reward:** Emotional reinforcement

#### **Button 2: 🛡️ Resisted Urges**
- **Effect:** `currentStreak++`
- **Color:** Gold/Yellow
- **Message:** Faced temptation but resisted
- **Reward:** Highlights willpower victory

#### **Button 3: ↩️ Relapsed**
- **Effect:** `currentStreak = 0`
- **Color:** Red/Orange
- **Message:** Honest reset
- **Reward:** Compassionate messaging, not judgmental

#### **Check-in Logic**

```typescript
if (option === 'relapsed') {
  currentStreak = 0;
} else {
  currentStreak++;
}

// Update longest streak if new record
if (currentStreak > longestStreak) {
  longestStreak = currentStreak;
}

// Prevent multiple check-ins same day
if (lastCheckDate is today) {
  return error: 'Already checked in today';
}

// Record check-in with timestamp
createStreakCheckin(option, timestamp);
```

---

### 4. **Milestone Badges** 🏆

Dynamic badges are **computed from streak data**, not stored separately.

| Days | Badge | Icon | Description |
|------|-------|------|-------------|
| 3 | Bronze Badge | 🥉 | First Steps |
| 7 | Silver Badge | 🥈 | One Week Strong |
| 30 | Gold Badge | 🏆 | One Month Discipline |
| 90 | Diamond Badge | 💎 | Three Month Mastery |

**Badge Calculation:**
```typescript
earned = badges.filter(b => 
  currentStreak >= b.days || longestStreak >= b.days
)

next = badges.find(b => 
  currentStreak < b.days && longestStreak < b.days
)
```

**Display Logic:**
- **Earned badges** are highlighted and displayed in a dedicated section
- **Next badge** shows countdown and motivation
- All badges use emoji for universal appeal

---

## 📊 Data Model

### Database Schema

```prisma
model Streak {
  id            String    @id @default(uuid())
  userId        String    @unique
  currentStreak Int       @default(0)      // Active streak counter
  longestStreak Int       @default(0)      // Personal best
  targetDays    Int       @default(30)     // User's goal
  lastCheckDate DateTime?                  // Prevent double check-in
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  checkins StreakCheckin[]
  user     User            @relation(...)
}

model StreakCheckin {
  id       String        @id @default(uuid())
  streakId String
  option   CheckinOption              // stayed_consistent | resisted_urges | relapsed
  date     DateTime      @default(now())
  
  streak Streak @relation(...)
}

enum CheckinOption {
  stayed_consistent
  resisted_urges
  relapsed
}
```

---

## 🔌 API Endpoints

### Setup Streak
```
POST /api/streak/setup
Body: { targetDays: number }
Response: { id, userId, currentStreak: 0, longestStreak: 0, targetDays }
```

### Daily Check-in
```
POST /api/streak/checkin
Body: { option: 'stayed_consistent' | 'resisted_urges' | 'relapsed' }
Response: { id, currentStreak, longestStreak, ... }
Error: 400 if already checked in today
```

### Get Streak
```
GET /api/streak
Response: { currentStreak, longestStreak, targetDays, lastCheckDate, checkins[] }
```

### Get Streak Stats (with computed badges)
```
GET /api/streak/stats
Response: {
  currentStreak,
  longestStreak,
  targetDays,
  badges: {
    earned: Badge[],
    next: Badge | null,
    total: 4
  },
  progress: {
    percentage: number,
    daysRemaining: number
  }
}
```

---

## 🎨 UI/UX Features

### Typography & Layout
- **Font:** Display font for headlines, Body font for content
- **Color Palette:** Obsidian background with accent/gold highlights
- **Spacing:** Consistent card-based layout with 8px grid

### Interactive Elements
- **Check-in Buttons:** Hover effects, scale animations on click
- **Progress Bar:** Smooth transitions, gradient overlay
- **Badge Display:** Hover tooltips with descriptions
- **Streak Calendar:** 30-day visualization grid

### Responsive Design
- **Desktop:** Full sidebar + content layout
- **Mobile:** Bottom navigation, stacked cards
- **Accessibility:** High contrast, clear CTAs

---

## 💡 Motivational Features

### Dynamic Motivational Messages
After check-in, users see random positive messages:

**For "Stayed Consistent":**
- 🔥 Perfect execution. That's what greatness looks like.
- ⚡ Day by day. You're building an unbreakable foundation.
- 💪 Discipline equals freedom. You've earned today.

**For "Resisted Urges":**
- 🛡️ You faced the urge and chose strength. That's real power.
- 🎯 Resistance built. Willpower strengthened.
- 🔥 Urges are tests. You passed.

**For "Relapsed":**
- 💚 Everyone stumbles. Champions get back up immediately.
- 🔄 Reset. Learn. Come back stronger.
- 🎯 This doesn't define your journey. Your next move does.

### Educational Reminders
Card with key facts:
- "Every day you don't relapse strengthens your neural pathways of self-control."
- "Urges are temporary. Discipline is permanent."
- "If you relapse, it's not failure—it's data. Learn and restart immediately."

---

## 🔒 Access & Permissions

1. **Adult Mode Required** - Feature only visible after confirming 18+ age
2. **Authentication Required** - Must be logged in
3. **One Streak Per User** - Database enforces `userId` uniqueness on Streak model
4. **Privacy** - Streak data is personal, not shared on public profiles

---

## 📱 Frontend Implementation

### Components
- **StreakPage.tsx** - Main NoFap tracker interface
- **badges.ts** - Utility functions for badge calculations
- **streakService.ts** - API service layer

### State Management
```typescript
const [streak, setStreak] = useState<Streak | null>(null)
const [loading, setLoading] = useState(false)
const [setupMode, setSetupMode] = useState(false)
const [checkinLoading, setCheckinLoading] = useState(false)
const [successMsg, setSuccessMsg] = useState('')
const [error, setError] = useState('')
```

### Conditional Rendering
- If no streak exists → Show setup screen
- If streak exists → Show main tracker
- If checked in today → Disable check-in buttons, show confirmation message

---

## 🧪 Testing Checklist

- [ ] Setup with 7, 30, 90, and custom days
- [ ] Daily check-in with all three options
- [ ] Cannot check in twice same day
- [ ] Streak increments correctly
- [ ] Relapse resets streak to 0
- [ ] Longest streak updates on new record
- [ ] Badges appear at correct days (3, 7, 30, 90)
- [ ] Next badge shows correct countdown
- [ ] Progress bar scales to 100% at target
- [ ] Calendar visualization shows last 30 days
- [ ] Motivational messages display randomly
- [ ] Works in both English and Hindi
- [ ] Responsive on mobile and desktop
- [ ] Adult mode gate appears on first access
- [ ] Backend prevents double check-in

---

## 🚀 Usage Flow

### Day 1
1. User navigates to /streak via left sidebar
2. Adult mode gate appears (confirm 18+)
3. Setup screen shows target day options
4. User selects 30 days
5. Tracker initializes with streak = 0

### Day 1 (Evening)
1. User returns to /streak
2. Sees main tracker (0/30)
3. Clicks "Stayed Consistent"
4. Backend updates: currentStreak = 1
5. Success message: "Perfect execution..."

### Day 2-7
1. User checks in daily with one of three options
2. Streak increments each day
3. At Day 7, Silver Badge unlocks
4. Progress bar shows 7/30 (23%)

### Day 8 (Relapse)
1. User clicks "Relapsed"
2. Backend resets: currentStreak = 0
3. Compassionate message: "Champions get back up..."
4. User can immediately restart

### Day 30
1. Streak reaches target days
2. Gold Badge unlocks
3. Celebration message
4. User can set new target or continue

---

## 🔄 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Already checked in today | Show message, disable buttons |
| Refresh page after check-in | Show updated streak immediately |
| No streak setup yet | Show setup screen |
| Logout and login | Preserve streak data |
| Delete account | Cascade delete streak records |
| Target reset to lower number | Update doesn't affect current streak |

---

## 📈 Future Features

- **Streak Predictions** - AI predicts relapse risk based on patterns
- **Social Features** - Share streaks with accountability partners (optional)
- **Triggers Journal** - Log what triggers urges for pattern analysis
- **Habit Stacking** - Link NoFap to other healthy habits
- **Notifications** - Daily reminder to check in (with opt-out)
- **Export Data** - Download streak history as CSV

---

## 🎓 Educational Integration

The NoFap Tracker complements the Adult Mode educational content:
- Links to consent clarity modules
- References impulse control theory
- Validates emotional accountability
- Promotes healthy self-awareness

---

**Version:** 1.0  
**Last Updated:** 2026-03-03  
**Status:** Production Ready ✅
