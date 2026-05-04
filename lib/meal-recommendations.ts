import { Profile } from './types'

export interface MealOption {
  name: string
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  tags: string[] // e.g. 'גדם', 'הריון', 'ברזל', 'קלציום', 'מהיר'
  gdm_safe: boolean
}

export interface MealSlot {
  type: 'breakfast' | 'snack1' | 'lunch' | 'snack2' | 'dinner'
  label: string
  emoji: string
  options: MealOption[]
}

const ALL_MEALS: MealSlot[] = [
  {
    type: 'breakfast',
    label: 'ארוחת בוקר',
    emoji: '🌅',
    options: [
      {
        name: 'שיבולת שועל עם פירות ואגוזים',
        description: '½ כוס שיבולת שועל מבושלת, בננה חצויה, חופן אגוזי מלך, כפית דבש',
        calories: 380, protein_g: 10, carbs_g: 55, fat_g: 14,
        tags: ['סיבים', 'ברזל', 'מהיר'], gdm_safe: false,
      },
      {
        name: 'ביצים עם ירקות',
        description: '2 ביצים מקושקשות עם עגבנייה, פלפל ועלי תרד, פרוסת לחם מחיטה מלאה',
        calories: 310, protein_g: 18, carbs_g: 22, fat_g: 16,
        tags: ['חלבון', 'ברזל'], gdm_safe: true,
      },
      {
        name: 'יוגורט יווני עם גרנולה',
        description: '200 גר׳ יוגורט יווני 5%, 3 כפות גרנולה, חופן פטל/תות',
        calories: 350, protein_g: 20, carbs_g: 38, fat_g: 10,
        tags: ['חלבון', 'קלציום', 'מהיר'], gdm_safe: false,
      },
      {
        name: 'טוסט אבוקדו עם ביצה',
        description: '2 פרוסות לחם מחיטה מלאה, ½ אבוקדו, ביצה קשה, מלח, לימון',
        calories: 420, protein_g: 16, carbs_g: 38, fat_g: 22,
        tags: ['שומן בריא', 'חלבון'], gdm_safe: true,
      },
      {
        name: 'קוטג׳ עם ירקות',
        description: '250 גר׳ קוטג׳ 5%, מלפפון, עגבנייה, 2 פרוסות לחם',
        calories: 280, protein_g: 24, carbs_g: 26, fat_g: 6,
        tags: ['חלבון', 'קלציום', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'חביתה ירקות ומוצרלה',
        description: '3 ביצים, עלי בייבי, עגבנייה שרי, 30 גר׳ מוצרלה',
        calories: 370, protein_g: 26, carbs_g: 4, fat_g: 27,
        tags: ['חלבון', 'קלציום'], gdm_safe: true,
      },
      {
        name: 'לחם עם גבינה לבנה ועגבנייה',
        description: '2 פרוסות לחם מחיטה מלאה, 60 גר׳ גבינה לבנה 5%, עגבנייה, אורגנו',
        calories: 290, protein_g: 14, carbs_g: 34, fat_g: 8,
        tags: ['קלציום', 'מהיר'], gdm_safe: false,
      },
    ],
  },
  {
    type: 'snack1',
    label: 'ביניים בוקר',
    emoji: '🍎',
    options: [
      {
        name: 'תפוח + חמאת שקדים',
        description: 'תפוח בינוני + 2 כפות חמאת שקדים טבעית',
        calories: 230, protein_g: 6, carbs_g: 32, fat_g: 10,
        tags: ['שומן בריא', 'סיבים'], gdm_safe: false,
      },
      {
        name: 'חמוציות ואגוזים',
        description: 'חופן שקדים (20 גר׳) + חופן אגוזי קשיו',
        calories: 190, protein_g: 6, carbs_g: 10, fat_g: 14,
        tags: ['שומן בריא', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'ירקות עם חומוס',
        description: 'גזר + מלפפון + 4 כפות חומוס',
        calories: 160, protein_g: 6, carbs_g: 20, fat_g: 6,
        tags: ['סיבים', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'יוגורט 0% עם בננה',
        description: '150 גר׳ יוגורט 0% + בננה קטנה',
        calories: 170, protein_g: 8, carbs_g: 34, fat_g: 1,
        tags: ['קלציום', 'חלבון'], gdm_safe: false,
      },
      {
        name: 'גבינה + כריך קטן',
        description: 'פרוסת לחם + 30 גר׳ גבינה צהובה',
        calories: 200, protein_g: 10, carbs_g: 18, fat_g: 9,
        tags: ['קלציום', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'ביצה קשה + עגבנייה שרי',
        description: 'ביצה קשה + 10 עגבניות שרי',
        calories: 130, protein_g: 8, carbs_g: 6, fat_g: 7,
        tags: ['חלבון', 'מהיר', 'ברזל'], gdm_safe: true,
      },
    ],
  },
  {
    type: 'lunch',
    label: 'ארוחת צהריים',
    emoji: '☀️',
    options: [
      {
        name: 'חזה עוף עם אורז מלא וסלט',
        description: '150 גר׳ חזה עוף אפוי, ½ כוס אורז מלא מבושל, סלט ירקות',
        calories: 450, protein_g: 38, carbs_g: 38, fat_g: 8,
        tags: ['חלבון', 'ברזל'], gdm_safe: false,
      },
      {
        name: 'סלמון אפוי עם ירקות',
        description: '150 גר׳ פילה סלמון אפוי, תפוח אדמה בינוני, ברוקולי מאודה',
        calories: 480, protein_g: 36, carbs_g: 32, fat_g: 18,
        tags: ['אומגה3', 'DHA', 'חלבון'], gdm_safe: false,
      },
      {
        name: 'קיש ירקות ביצה',
        description: '2 פרוסות קיש ביצים עם תרד, פטריות וגבינה',
        calories: 380, protein_g: 22, carbs_g: 20, fat_g: 24,
        tags: ['חלבון', 'ברזל', 'קלציום'], gdm_safe: true,
      },
      {
        name: 'מרק עדשים עם לחם',
        description: 'קערת מרק עדשים, פרוסת לחם מחיטה מלאה, 1 כף טחינה',
        calories: 380, protein_g: 18, carbs_g: 55, fat_g: 8,
        tags: ['ברזל', 'חלבון', 'סיבים'], gdm_safe: false,
      },
      {
        name: 'פסטה מחיטה מלאה ברוטב עגבניות',
        description: '80 גר׳ פסטה, רוטב עגבניות ביתי, 100 גר׳ בשר טחון רזה',
        calories: 490, protein_g: 28, carbs_g: 58, fat_g: 12,
        tags: ['חלבון', 'ברזל'], gdm_safe: false,
      },
      {
        name: 'טונה עם סלט גדול',
        description: '1 קופסת טונה במים, ירוקים, עגבנייה, מלפפון, ביצה, כף שמן זית',
        calories: 340, protein_g: 34, carbs_g: 10, fat_g: 16,
        tags: ['חלבון', 'אומגה3', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'קוסקוס עם ירקות צלויים ועוף',
        description: '½ כוס קוסקוס, ירקות צלויים, 120 גר׳ עוף',
        calories: 440, protein_g: 32, carbs_g: 48, fat_g: 10,
        tags: ['חלבון', 'ברזל'], gdm_safe: false,
      },
      {
        name: 'חמין קלאסי קטן',
        description: 'כוס חמין עם ביצה, בשר, עפ״י הרכב',
        calories: 420, protein_g: 24, carbs_g: 42, fat_g: 14,
        tags: ['ברזל', 'חלבון'], gdm_safe: false,
      },
    ],
  },
  {
    type: 'snack2',
    label: 'ביניים אחה"צ',
    emoji: '🧁',
    options: [
      {
        name: 'שייק חלבון עם פרי',
        description: '½ כוס חלב + בננה קטנה + כף חמאת בוטנים',
        calories: 250, protein_g: 12, carbs_g: 32, fat_g: 8,
        tags: ['חלבון', 'קלציום'], gdm_safe: false,
      },
      {
        name: 'תמרים ואגוזי מלך',
        description: '3 תמרים + 5 אגוזי מלך',
        calories: 200, protein_g: 3, carbs_g: 35, fat_g: 8,
        tags: ['ברזל', 'שומן בריא'], gdm_safe: false,
      },
      {
        name: 'אדממה (שעועית סויה)',
        description: 'כוס אדממה מבושלת עם קצת מלח',
        calories: 190, protein_g: 17, carbs_g: 14, fat_g: 8,
        tags: ['חלבון', 'ברזל', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'כריך טחינה ודבש קטן',
        description: 'פרוסת לחם + 2 כפות טחינה גולמית + קצת דבש',
        calories: 220, protein_g: 7, carbs_g: 28, fat_g: 9,
        tags: ['קלציום', 'ברזל'], gdm_safe: false,
      },
      {
        name: 'גבינה צהובה + פלפל',
        description: '2 פרוסות גבינה צהובה + פלפל צבעוני',
        calories: 160, protein_g: 10, carbs_g: 8, fat_g: 10,
        tags: ['קלציום', 'חלבון', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'קרקרים עם אבוקדו',
        description: '6 קרקרים מחיטה מלאה + ½ אבוקדו',
        calories: 220, protein_g: 4, carbs_g: 24, fat_g: 12,
        tags: ['שומן בריא', 'סיבים'], gdm_safe: true,
      },
    ],
  },
  {
    type: 'dinner',
    label: 'ארוחת ערב',
    emoji: '🌙',
    options: [
      {
        name: 'ירקות מוקפצים עם טופו',
        description: '150 גר׳ טופו מוקפץ, ירקות מגוונים, רוטב סויה, שומשום',
        calories: 350, protein_g: 20, carbs_g: 22, fat_g: 18,
        tags: ['חלבון', 'ברזל', 'קלציום'], gdm_safe: true,
      },
      {
        name: 'מנת דגים קלה',
        description: '150 גר׳ פלמידה/דניס אפויה בלימון ועשבי תיבול, סלט',
        calories: 290, protein_g: 32, carbs_g: 6, fat_g: 14,
        tags: ['חלבון', 'אומגה3', 'קל'], gdm_safe: true,
      },
      {
        name: 'מרק עוף עם ירקות ואטריות',
        description: 'קערת מרק עוף עשיר, ¼ כוס אטריות, ירקות שורש',
        calories: 320, protein_g: 24, carbs_g: 30, fat_g: 8,
        tags: ['חלבון', 'קל'], gdm_safe: false,
      },
      {
        name: 'ביצים בשקשוקה',
        description: '2 ביצים, רוטב עגבניות, פלפלים, בצל, כפית שמן זית',
        calories: 310, protein_g: 16, carbs_g: 22, fat_g: 16,
        tags: ['חלבון', 'ברזל', 'מהיר'], gdm_safe: true,
      },
      {
        name: 'פיתה מחיטה מלאה עם חומוס וסלט',
        description: 'פיתה קטנה מלאה + 5 כפות חומוס ביתי + סלט ירוק',
        calories: 380, protein_g: 14, carbs_g: 54, fat_g: 10,
        tags: ['ברזל', 'סיבים'], gdm_safe: false,
      },
      {
        name: 'ירקות ממולאים',
        description: '2 פלפלים ממולאים בבשר רזה ואורז מלא',
        calories: 380, protein_g: 22, carbs_g: 36, fat_g: 12,
        tags: ['חלבון', 'ברזל'], gdm_safe: false,
      },
      {
        name: 'חביתה ירקות + סלט',
        description: '3 ביצים עם תרד ובצל + סלט מלפפון-עגבנייה',
        calories: 280, protein_g: 20, carbs_g: 10, fat_g: 18,
        tags: ['חלבון', 'ברזל', 'מהיר', 'קל'], gdm_safe: true,
      },
    ],
  },
]

export function getMealRecommendations(profile: Profile | null): MealSlot[] {
  const isPregnant = profile?.is_pregnant ?? false
  const isGDM = profile?.has_gestational_diabetes ?? false

  return ALL_MEALS.map((slot) => {
    let options = [...slot.options]

    // For GDM: show GDM-safe options first
    if (isGDM) {
      options = [
        ...options.filter((o) => o.gdm_safe),
        ...options.filter((o) => !o.gdm_safe),
      ]
    }

    // Tag pregnancy-specific items
    if (isPregnant) {
      options = options.map((o) => ({
        ...o,
        tags: o.tags.includes('DHA') || o.tags.includes('ברזל') || o.tags.includes('קלציום')
          ? ['⭐ מומלץ להריון', ...o.tags]
          : o.tags,
      }))
    }

    return { ...slot, options }
  })
}

export function getDailyCalorieTarget(profile: Profile | null): number {
  const base = profile?.gender === 'male' ? 2200 : 1900
  const extra = profile?.is_pregnant ? 300 : 0
  const activityMap: Record<string, number> = {
    sedentary: 0, light: 100, moderate: 200, active: 350, very_active: 500,
  }
  return base + extra + (activityMap[profile?.activity_level ?? ''] ?? 0)
}
