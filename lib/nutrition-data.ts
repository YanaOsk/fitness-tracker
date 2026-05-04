import { ExchangeType, FoodExchange, DailyTargets } from './types'

export const exchangeLists: Record<ExchangeType, FoodExchange[]> = {
  protein: [
    { name: 'עוף (ללא עור)', portion: '90 גרם מבושל', calories: 150, protein_g: 25, carbs_g: 0, fat_g: 5, type: 'protein' },
    { name: 'דג סלמון', portion: '90 גרם', calories: 180, protein_g: 23, carbs_g: 0, fat_g: 9, type: 'protein' },
    { name: 'טונה בשמרית (קופסה)', portion: '90 גרם', calories: 100, protein_g: 22, carbs_g: 0, fat_g: 1, type: 'protein' },
    { name: 'בשר בקר רזה', portion: '90 גרם מבושל', calories: 170, protein_g: 24, carbs_g: 0, fat_g: 7, type: 'protein' },
    { name: 'ביצה שלמה', portion: '2 ביצים', calories: 140, protein_g: 12, carbs_g: 1, fat_g: 10, type: 'protein' },
    { name: 'גבינה לבנה 5%', portion: '150 גרם', calories: 110, protein_g: 16, carbs_g: 4, fat_g: 3, type: 'protein' },
    { name: 'טופו', portion: '120 גרם', calories: 90, protein_g: 10, carbs_g: 2, fat_g: 5, type: 'protein' },
    { name: 'עדשים מבושלות', portion: '200 גרם', calories: 230, protein_g: 18, carbs_g: 40, fat_g: 1, type: 'protein' },
    { name: 'חזה הודו', portion: '90 גרם', calories: 130, protein_g: 27, carbs_g: 0, fat_g: 2, type: 'protein' },
    { name: 'סרדינים בשמן', portion: '60 גרם', calories: 130, protein_g: 15, carbs_g: 0, fat_g: 8, type: 'protein' },
    { name: 'חומוס מבושל', portion: '200 גרם', calories: 270, protein_g: 15, carbs_g: 45, fat_g: 4, type: 'protein' },
    { name: 'קוטג\' 5%', portion: '200 גרם', calories: 160, protein_g: 20, carbs_g: 5, fat_g: 7, type: 'protein' },
  ],
  carb: [
    { name: 'אורז חום מבושל', portion: '180 גרם', calories: 220, protein_g: 5, carbs_g: 45, fat_g: 2, type: 'carb' },
    { name: 'לחם מחיטה מלאה', portion: '2 פרוסות (60 גרם)', calories: 160, protein_g: 6, carbs_g: 32, fat_g: 2, type: 'carb' },
    { name: 'פסטה מחיטה מלאה מבושלת', portion: '180 גרם', calories: 200, protein_g: 7, carbs_g: 40, fat_g: 1, type: 'carb' },
    { name: 'קינואה מבושלת', portion: '180 גרם', calories: 220, protein_g: 8, carbs_g: 39, fat_g: 4, type: 'carb' },
    { name: 'תפוח אדמה מבושל', portion: '1 בינוני (150 גרם)', calories: 130, protein_g: 3, carbs_g: 30, fat_g: 0, type: 'carb' },
    { name: 'שיבולת שועל (גריסים)', portion: '60 גרם יבשה', calories: 230, protein_g: 8, carbs_g: 40, fat_g: 5, type: 'carb' },
    { name: 'תירס מבושל', portion: '180 גרם', calories: 180, protein_g: 5, carbs_g: 41, fat_g: 2, type: 'carb' },
    { name: 'פיתה מחיטה מלאה', portion: '1 קטנה (60 גרם)', calories: 160, protein_g: 6, carbs_g: 33, fat_g: 1, type: 'carb' },
    { name: 'לחם שיפון', portion: '2 פרוסות (60 גרם)', calories: 150, protein_g: 5, carbs_g: 31, fat_g: 1, type: 'carb' },
    { name: 'בטטה מבושלת', portion: '1 בינונית (150 גרם)', calories: 140, protein_g: 2, carbs_g: 33, fat_g: 0, type: 'carb' },
  ],
  fat: [
    { name: 'אבוקדו', portion: 'חצי (70 גרם)', calories: 115, protein_g: 1, carbs_g: 6, fat_g: 11, type: 'fat' },
    { name: 'שמן זית', portion: '1 כף (15 מ"ל)', calories: 120, protein_g: 0, carbs_g: 0, fat_g: 14, type: 'fat' },
    { name: 'אגוזי מלך', portion: '30 גרם (~7 חצאים)', calories: 185, protein_g: 4, carbs_g: 4, fat_g: 18, type: 'fat' },
    { name: 'שקדים', portion: '30 גרם (~23 שקדים)', calories: 170, protein_g: 6, carbs_g: 6, fat_g: 15, type: 'fat' },
    { name: 'חמאת בוטנים טבעית', portion: '2 כפות (32 גרם)', calories: 190, protein_g: 8, carbs_g: 6, fat_g: 16, type: 'fat' },
    { name: 'טחינה גולמית', portion: '2 כפות (30 גרם)', calories: 185, protein_g: 5, carbs_g: 6, fat_g: 17, type: 'fat' },
    { name: 'זיתים שחורים', portion: '10 זיתים (40 גרם)', calories: 70, protein_g: 0.5, carbs_g: 2, fat_g: 7, type: 'fat' },
    { name: 'זרעי פשתן', portion: '2 כפות (20 גרם)', calories: 110, protein_g: 4, carbs_g: 6, fat_g: 9, type: 'fat' },
    { name: 'שמן קוקוס', portion: '1 כף (14 גרם)', calories: 120, protein_g: 0, carbs_g: 0, fat_g: 14, type: 'fat' },
  ],
  vegetable: [
    { name: 'ברוקולי', portion: '180 גרם מאודה', calories: 55, protein_g: 4, carbs_g: 11, fat_g: 0.5, type: 'vegetable' },
    { name: 'תרד', portion: '180 גרם טרי', calories: 40, protein_g: 5, carbs_g: 7, fat_g: 0.5, type: 'vegetable' },
    { name: 'עגבנייה', portion: '2 בינוניות', calories: 45, protein_g: 2, carbs_g: 10, fat_g: 0.5, type: 'vegetable' },
    { name: 'מלפפון', portion: '2 גדולים', calories: 30, protein_g: 1, carbs_g: 7, fat_g: 0, type: 'vegetable' },
    { name: 'גמבה', portion: '1 גדולה', calories: 40, protein_g: 1.5, carbs_g: 9, fat_g: 0.5, type: 'vegetable' },
    { name: 'קישוא', portion: '2 בינוניים', calories: 35, protein_g: 3, carbs_g: 7, fat_g: 0.5, type: 'vegetable' },
    { name: 'כרובית', portion: '200 גרם', calories: 50, protein_g: 4, carbs_g: 10, fat_g: 0.5, type: 'vegetable' },
    { name: 'גזר', portion: '2 בינוניים', calories: 50, protein_g: 1, carbs_g: 12, fat_g: 0, type: 'vegetable' },
    { name: 'כרוב', portion: '200 גרם', calories: 45, protein_g: 2, carbs_g: 11, fat_g: 0, type: 'vegetable' },
    { name: 'פטריות', portion: '150 גרם', calories: 35, protein_g: 5, carbs_g: 5, fat_g: 0.5, type: 'vegetable' },
  ],
  fruit: [
    { name: 'תפוח', portion: '1 בינוני', calories: 80, protein_g: 0.4, carbs_g: 21, fat_g: 0.3, type: 'fruit' },
    { name: 'בננה קטנה', portion: '1 קטנה', calories: 90, protein_g: 1, carbs_g: 23, fat_g: 0.3, type: 'fruit' },
    { name: 'אשכולית', portion: '1 שלמה', calories: 60, protein_g: 1, carbs_g: 15, fat_g: 0.2, type: 'fruit' },
    { name: 'תות שדה', portion: '200 גרם', calories: 65, protein_g: 1.4, carbs_g: 16, fat_g: 0.6, type: 'fruit' },
    { name: 'מנגו', portion: 'חצי קטן (100 גרם)', calories: 65, protein_g: 0.9, carbs_g: 17, fat_g: 0.4, type: 'fruit' },
    { name: 'אבטיח', portion: '300 גרם', calories: 60, protein_g: 1.2, carbs_g: 15, fat_g: 0.3, type: 'fruit' },
    { name: 'ענבים', portion: '150 גרם', calories: 100, protein_g: 1, carbs_g: 27, fat_g: 0.2, type: 'fruit' },
    { name: 'אפרסק', portion: '1 גדול', calories: 60, protein_g: 1.4, carbs_g: 15, fat_g: 0.4, type: 'fruit' },
    { name: 'אגס', portion: '1 בינוני', calories: 85, protein_g: 0.5, carbs_g: 22, fat_g: 0.2, type: 'fruit' },
    { name: 'קלמנטינה', portion: '2 בינוניות', calories: 70, protein_g: 1, carbs_g: 18, fat_g: 0.3, type: 'fruit' },
  ],
  dairy: [
    { name: 'חלב 1% שומן', portion: 'כוס (240 מ"ל)', calories: 100, protein_g: 8, carbs_g: 12, fat_g: 2.5, type: 'dairy' },
    { name: 'יוגורט יווני 0%', portion: '200 גרם', calories: 110, protein_g: 18, carbs_g: 7, fat_g: 0, type: 'dairy' },
    { name: 'יוגורט פשוט 3%', portion: '200 גרם', calories: 130, protein_g: 7, carbs_g: 12, fat_g: 5, type: 'dairy' },
    { name: 'גבינה צהובה 9%', portion: '40 גרם', calories: 100, protein_g: 10, carbs_g: 0.5, fat_g: 6, type: 'dairy' },
    { name: 'פרמזן', portion: '30 גרם', calories: 120, protein_g: 11, carbs_g: 1, fat_g: 8, type: 'dairy' },
    { name: 'חלב שקדים (ללא סוכר)', portion: 'כוס (240 מ"ל)', calories: 30, protein_g: 1, carbs_g: 1, fat_g: 2.5, type: 'dairy' },
    { name: 'ריקוטה', portion: '100 גרם', calories: 140, protein_g: 11, carbs_g: 3, fat_g: 10, type: 'dairy' },
  ],
}

export const exchangeTypeLabels: Record<ExchangeType, string> = {
  protein: 'חלבון',
  carb: 'פחמימה',
  fat: 'שומן',
  vegetable: 'ירק',
  fruit: 'פרי',
  dairy: 'מוצר חלב',
}

export const exchangeTypeColors: Record<ExchangeType, string> = {
  protein: 'bg-red-100 text-red-700 border-red-200',
  carb: 'bg-amber-100 text-amber-700 border-amber-200',
  fat: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  vegetable: 'bg-green-100 text-green-700 border-green-200',
  fruit: 'bg-orange-100 text-orange-700 border-orange-200',
  dairy: 'bg-blue-100 text-blue-700 border-blue-200',
}

export const mealTypeLabels: Record<string, string> = {
  breakfast: 'ארוחת בוקר',
  lunch: 'ארוחת צהריים',
  dinner: 'ארוחת ערב',
  snack: 'חטיף',
}

export function validateGDMeal(items: { exchange_type: string | null }[]): string[] {
  const warnings: string[] = []
  const hasCarbOrFruit = items.some(
    (f) => f.exchange_type === 'carb' || f.exchange_type === 'fruit'
  )
  const hasProteinOrDairy = items.some(
    (f) => f.exchange_type === 'protein' || f.exchange_type === 'dairy'
  )
  const hasFat = items.some((f) => f.exchange_type === 'fat')

  if (hasCarbOrFruit && !hasProteinOrDairy && !hasFat) {
    warnings.push('סוכרת הריון: פחמימות חייבות להיאכל עם חלבון או שומן כדי למנוע עלייה חדה ברמת הסוכר!')
  }
  return warnings
}

export function calculateDailyTargets(
  gender: string | null,
  isPregnant: boolean,
  activityLevel: string | null
): DailyTargets {
  let baseCalories = gender === 'male' ? 2200 : 1800
  if (isPregnant) baseCalories += 300

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  const calories = Math.round(baseCalories * (multipliers[activityLevel ?? 'moderate'] ?? 1.55))

  return {
    calories,
    protein: Math.round((calories * 0.25) / 4),
    carbs: Math.round((calories * 0.45) / 4),
    fat: Math.round((calories * 0.30) / 9),
    water_ml: isPregnant ? 3000 : gender === 'male' ? 3500 : 2700,
  }
}
