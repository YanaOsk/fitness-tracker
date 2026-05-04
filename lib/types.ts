export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ExchangeType = 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy'
export type WorkoutType = 'yoga' | 'pilates' | 'strength' | 'cardio' | 'stretching' | 'walking'
export type Goal = 'weight_loss' | 'muscle_gain' | 'healthy_pregnancy' | 'general_health' | 'endurance'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  gender: Gender | null
  is_pregnant: boolean
  pregnancy_week: number | null
  pregnancy_week_updated_at: string | null
  has_gestational_diabetes: boolean
  goals: Goal[]
  activity_level: ActivityLevel | null
  birth_year: number | null
  height_cm: number | null
  weight_kg: number | null
  target_weight_kg: number | null
  medical_notes: string | null
  setup_complete: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_type: WorkoutType
  workout_name: string
  duration_minutes: number
  completed_at: string
  notes: string | null
  intensity: string | null
}

export interface FoodLog {
  id: string
  user_id: string
  meal_type: MealType
  food_name: string
  exchange_type: ExchangeType | null
  portions: number
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  logged_at: string
  date: string
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
  date: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface WorkoutExercise {
  name: string
  sets?: number
  reps?: string
  duration?: string
  rest?: string
  notes?: string
  pregnancySafe?: boolean
}

export interface WorkoutPlan {
  id: string
  name: string
  type: WorkoutType
  duration: number
  intensity: 'low' | 'medium' | 'high'
  targetGender: 'all' | 'female' | 'male'
  pregnancySafe: boolean
  trimesters?: (1 | 2 | 3)[]
  calories: number
  exercises: WorkoutExercise[]
  safetyWarnings?: string[]
  description: string
}

export interface FoodExchange {
  name: string
  portion: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  type: ExchangeType
}

export interface DailyTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  water_ml: number
}
