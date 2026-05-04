export interface PregnancyTip {
  nutrition: string
  workout: string
  highlight: string // what's happening this week
}

const TIPS: Record<string, PregnancyTip> = {
  '4-5': {
    highlight: 'העובר בגודל גרגיר פרג — הלב מתחיל לפעום',
    nutrition: 'חומצה פולית (400 מק״ג/יום) ויוד — חובה. הימנעי ממזון גולמי, גבינות רכות לא מפוסטרות ואלכוהול.',
    workout: 'הליכה קלה 20–30 דקות ביום. הימנעי מפעילות עצימה עד שתתייעצי עם הרופאה.',
  },
  '6-8': {
    highlight: 'אברים מתפתחים מהר — גודל אפונה',
    nutrition: 'בחילות? קרקרים לפני קימה, ארוחות קטנות ותכופות, ג׳ינג׳ר טרי. שתי הרבה מים.',
    workout: 'יוגה עדינה ומתיחות. הקשיבי לגוף — אם אין כוח, זה בסדר.',
  },
  '9-12': {
    highlight: 'סוף הטרימסטר הראשון — הסיכון למיסקריג׳ יורד',
    nutrition: 'הגבירי חלבון (ביצים, עוף, קטניות). המשיכי עם חומצה פולית. שמרי על הידרציה טובה.',
    workout: 'הליכה, שחייה, פילאטיס עדין. הימנעי ממגע גוף, סיכוני נפילה וחום קיצוני.',
  },
  '13-16': {
    highlight: 'טרימסטר שני — האנרגיה חוזרת! הפנים של התינוק מתגבשות',
    nutrition: 'הגבירי ברזל (בשר רזה, תרד, קטניות) עם ויטמין C לספיגה. הוסיפי 300 קל׳/יום.',
    workout: 'שחייה, פילאטיס, יוגה ואירובי עדין — הזמן הכי טוב להתאמן!',
  },
  '17-20': {
    highlight: 'הרגשת בעיטות ראשונות! התינוק שומע אותך',
    nutrition: 'שומן בריא חשוב עכשיו — אבוקדו, אגוזים, שמן זית. הירקות הכהים נותנים פולאט.',
    workout: 'שחייה מצוינת לגב. הימנעי ממנחי שכיבה ארוכות על הגב (לחץ על וריד).',
  },
  '21-24': {
    highlight: 'מחצית הדרך! תינוק שומע קולות ומגיב לאור',
    nutrition: 'הגבירי אומגה-3 (סלמון, זרעי צ׳יה) לפיתוח מוח. קלציום לעצמות — יוגורט, גבינה.',
    workout: 'תרגילי קרקעית האגן (קיגל) — חשוב מאוד! 3×10 פעמים ביום.',
  },
  '25-28': {
    highlight: 'עיניים נפתחות — התינוק מגיב לאור ממש!',
    nutrition: 'בדיקת סוכר בשבועות אלו. הגבירי סיבים (ירקות, דגנים מלאים) למניעת עצירות.',
    workout: 'פילאטיס לחיזוק גב. הפסיקי תרגילים שדורשים שכיבה על הגב יותר מ-3 דקות.',
  },
  '29-32': {
    highlight: 'ריאות מתפתחות — אם נולד עכשיו, סיכויים טובים מאוד',
    nutrition: 'DHA חיוני — דגים מבושלים 2×/שבוע (סלמון, סרדינים). המנעי מדגים גדולים (כספית).',
    workout: 'תרגילי נשימה ורצפת אגן. הפסיקי פעילויות שמצריכות שיווי משקל.',
  },
  '33-36': {
    highlight: 'ראש כלפי מטה (בד״כ) — הגוף מתכונן',
    nutrition: 'ארוחות קטנות מאוד ותכופות — הבטן לחוצה. הימנעי ממזון חריף ומוגז. מגנזיום עוזר להתכווצויות.',
    workout: 'הליכה קצרה, מתיחות עדינות, תרגילי נשימה. הגוף מתכונן ללידה!',
  },
  '37-40': {
    highlight: 'מלא טווח — התינוק מוכן! כל יום מוסיף שומן ובשלות',
    nutrition: 'תמרים 6/יום — מחקרים מצביעים שיכולים לעזור בהכנה לצוואר הרחם. שמרי על הידרציה.',
    workout: 'הליכות קצרות עוזרות לתנוחת התינוק. יוגה עדינה ונשימות מעמיקות.',
  },
  '41-42': {
    highlight: 'עוברת את המועד — הרופאה תעקוב מקרוב',
    nutrition: 'ארוחות קלות, הרבה מים, מנוחה. שמרי על כוח לקראת הלידה.',
    workout: 'מנוחה ותנועה קלה בלבד. האזיני לגופך.',
  },
}

export function getPregnancyTip(week: number): PregnancyTip {
  if (week <= 5) return TIPS['4-5']
  if (week <= 8) return TIPS['6-8']
  if (week <= 12) return TIPS['9-12']
  if (week <= 16) return TIPS['13-16']
  if (week <= 20) return TIPS['17-20']
  if (week <= 24) return TIPS['21-24']
  if (week <= 28) return TIPS['25-28']
  if (week <= 32) return TIPS['29-32']
  if (week <= 36) return TIPS['33-36']
  if (week <= 40) return TIPS['37-40']
  return TIPS['41-42']
}

// Count Mondays strictly after 'from' and on or before 'to'
export function countMondaysBetween(from: Date, to: Date): number {
  if (to <= from) return 0
  const start = new Date(from)
  start.setDate(start.getDate() + 1)
  start.setHours(0, 0, 0, 0)
  // Find first Monday >= start
  const daysUntilMonday = (8 - start.getDay()) % 7
  start.setDate(start.getDate() + daysUntilMonday)
  if (start > to) return 0
  const toNorm = new Date(to)
  toNorm.setHours(23, 59, 59, 999)
  const msDiff = toNorm.getTime() - start.getTime()
  return Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)) + 1
}
