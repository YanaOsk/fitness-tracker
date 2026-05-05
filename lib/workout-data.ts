import { WorkoutPlan } from './types'

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'prenatal-yoga-1',
    name: 'יוגה לנשים בהריון – שקט ואיזון',
    type: 'yoga',
    duration: 40,
    intensity: 'low',
    targetGender: 'female',
    pregnancySafe: true,
    trimesters: [1, 2, 3],
    calories: 150,
    description: 'תרגול עדין המתמקד בנשימה, גמישות ורגיעה. מתאים לכל שלבי ההריון.',
    safetyWarnings: [
      'אין לשכב על הגב לאחר שבוע 20',
      'הימנעי מפיתולים עמוקים לבטן',
      'הפסיקי מיד אם יש כאב, סחרחורת או קוצר נשימה',
      'שמרי על נשימה שוטפת לאורך כל התרגיל',
    ],
    exercises: [
      { name: 'נשימות בטן עמוקות', duration: '5 דקות', notes: 'ישיבה נוחה, ידיים על הבטן', pregnancySafe: true },
      { name: 'מתיחות צוואר עדינות', duration: '3 דקות', notes: 'סיבובים איטיים ומבוקרים', pregnancySafe: true },
      { name: 'תנוחת חתול-פרה (Cat-Cow)', sets: 3, reps: '10 חזרות', notes: 'על ארבע, גב מרוכך', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=MgDn34q4Hm8' },
      { name: 'תנוחת הלוחם I (מעודנת)', duration: '2 דקות לכל צד', notes: 'צעד רחב, ידיים בגובה כתפיים', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=4b5e0FAAwlU' },
      { name: 'תנוחת העץ (עם תמיכה בקיר)', duration: '1 דקה לכל רגל', notes: 'יד על קיר לאיזון', pregnancySafe: true },
      { name: 'ישיבת פרפר', duration: '5 דקות', notes: 'כפות רגליים יחד, גב ישר', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=yiTrnImuOMQ' },
      { name: 'שחרור גב תחתון בשכיבת צד', duration: '5 דקות לכל צד', notes: 'כרית בין הברכיים', pregnancySafe: true },
      { name: 'שבסאנה – הרפיה', duration: '10 דקות', notes: 'שכיבת צד שמאל עם כריות תומכות', pregnancySafe: true },
    ],
  },
  {
    id: 'prenatal-pilates-1',
    name: 'פילאטיס להריון – חיזוק עדין',
    type: 'pilates',
    duration: 45,
    intensity: 'low',
    targetGender: 'female',
    pregnancySafe: true,
    trimesters: [1, 2],
    calories: 180,
    description: 'חיזוק שרירי ליבה, רצפת אגן וגב. מתאים לטרימסטר 1 ו-2 בלבד.',
    safetyWarnings: [
      'הימנעי משכיבה על הגב לאחר שבוע 16',
      'אל תבצעי כפיפות בטן (crunches) עמוקות',
      'שמרי על נשימה רציפה – אל תאמצי',
      'הפסיקי אם יש לחץ בבטן התחתונה',
    ],
    exercises: [
      { name: 'כיווץ עדין של שרירי הבטן', sets: 3, reps: '10 חזרות', notes: 'כיווץ קל בלבד', pregnancySafe: true },
      { name: 'גשר (Bridge)', sets: 2, reps: '12 חזרות', notes: 'גב ישר, אגן יציב', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8' },
      { name: 'כיווץ רצפת אגן (Kegel)', sets: 3, reps: '15 שניות החזקה', notes: 'חיוני לכל שלבי ההריון', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=Wjb20SXIvA4' },
      { name: 'הנפת רגל צידה בשכיבה', sets: 3, reps: '15 לכל רגל', notes: 'תנועה איטית ומבוקרת', pregnancySafe: true },
      { name: 'הרחבת חזה עם גומי התנגדות', sets: 3, reps: '12 חזרות', notes: 'עמידה, גב ישר', pregnancySafe: true },
      { name: 'כיפוף ברכיים בישיבה', sets: 2, reps: '15 לכל רגל', pregnancySafe: true },
    ],
  },
  {
    id: 'prenatal-yoga-t3',
    name: 'יוגה לשליש השלישי – הכנה ללידה',
    type: 'yoga',
    duration: 35,
    intensity: 'low',
    targetGender: 'female',
    pregnancySafe: true,
    trimesters: [3],
    calories: 120,
    description: 'הכנת גוף ונפש ללידה. נשימות לידה, פתיחת אגן ורגיעה עמוקה.',
    safetyWarnings: [
      'כל פעילות בשליש השלישי – עם אישור רופא בלבד',
      'הימנעי לחלוטין משכיבה על הגב',
      'עמידה ליד קיר לכל תנוחות עמידה',
      'הפסיקי מיד אם יש התכווצויות',
    ],
    exercises: [
      { name: 'נשימות לידה (בסיסי)', duration: '10 דקות', notes: 'שאיפה ל-4 שניות, נשיפה ל-6 שניות', pregnancySafe: true },
      { name: 'תנוחת פרפר מעמיקה', duration: '5 דקות', notes: 'פתיחת אגן, גב מורם קלות', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=yiTrnImuOMQ' },
      { name: 'כריעה רחבה (Squat) עם קיר', sets: 2, reps: '5 חזרות × 30 שניות', notes: 'תמיכה בקיר', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U' },
      { name: 'נדנוד על ארבע – שחרור גב', duration: '5 דקות', notes: 'הרפיית גב תחתון ובטן', pregnancySafe: true, videoUrl: 'https://www.youtube.com/watch?v=MgDn34q4Hm8' },
      { name: 'מדיטציה מונחית', duration: '10 דקות', notes: 'ויזואליזציה חיובית ללידה', pregnancySafe: true },
    ],
  },
  {
    id: 'prenatal-walk',
    name: 'הליכה בריאה להריון',
    type: 'walking',
    duration: 30,
    intensity: 'low',
    targetGender: 'female',
    pregnancySafe: true,
    trimesters: [1, 2, 3],
    calories: 150,
    description: 'הפעילות הבטוחה ביותר בהריון. שיפור מחזור דם ורמות אנרגיה.',
    safetyWarnings: [
      'שתי מים לפני, במהלך ואחרי ההליכה',
      'הימנעי מהליכה בחום קיצוני',
      'עצרי אם יש כאב בטן, דימום, או קוצר נשימה חריג',
    ],
    exercises: [
      { name: 'חימום – הליכה איטית', duration: '5 דקות', pregnancySafe: true },
      { name: 'הליכה בקצב נוח-מתון', duration: '20 דקות', notes: 'צריכה להיות מסוגלת לדבר בזמן ההליכה', pregnancySafe: true },
      { name: 'קירור ומתיחות', duration: '5 דקות', pregnancySafe: true },
    ],
  },
  {
    id: 'women-strength-1',
    name: 'אימון כוח לנשים – מתחילות',
    type: 'strength',
    duration: 45,
    intensity: 'medium',
    targetGender: 'female',
    pregnancySafe: false,
    calories: 250,
    description: 'בניית כוח וטונוס שרירי עם משקל גוף ומשקולות קלות.',
    exercises: [
      { name: 'סקוואט עם משקל גוף', sets: 3, reps: '15 חזרות', rest: '60 שניות', videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U' },
      { name: "לאנג'ס קדמיים", sets: 3, reps: '12 לכל רגל', rest: '60 שניות', videoUrl: 'https://www.youtube.com/watch?v=WzONHuAe6BY' },
      { name: 'שכיבות שמיכה על הברכיים', sets: 3, reps: '10 חזרות', rest: '60 שניות', videoUrl: 'https://www.youtube.com/watch?v=BQu26ABuVS0' },
      { name: 'חתירה עם גומי התנגדות', sets: 3, reps: '15 חזרות', rest: '45 שניות' },
      { name: 'כיפוף מרפקים 2-4 ק"ג', sets: 3, reps: '12 חזרות', rest: '45 שניות' },
      { name: 'פלאנק קדמי', sets: 3, duration: '30 שניות', rest: '30 שניות', videoUrl: 'https://www.youtube.com/watch?v=BQu26ABuVS0' },
      { name: "גלוטי בריג' (Glute Bridge)", sets: 3, reps: '20 חזרות', rest: '45 שניות', videoUrl: 'https://www.youtube.com/watch?v=wPM8icPu6H8' },
      { name: 'סופרמן', sets: 3, reps: '15 חזרות', rest: '30 שניות' },
    ],
  },
  {
    id: 'women-cardio-1',
    name: 'אירובי לנשים – שריפת שומן',
    type: 'cardio',
    duration: 30,
    intensity: 'medium',
    targetGender: 'female',
    pregnancySafe: false,
    calories: 300,
    description: 'אינטרוולים לשריפת קלוריות ושיפור כושר לב-ריאה.',
    exercises: [
      { name: 'חימום – הליכה מהירה', duration: '5 דקות' },
      { name: "ג'אמפינג ג'קס", sets: 4, duration: '40 שניות פעילות / 20 מנוחה', videoUrl: 'https://www.youtube.com/watch?v=bg_rErB71jw' },
      { name: 'ריצת מקום גבוהה', sets: 4, duration: '40 שניות פעילות / 20 מנוחה' },
      { name: "ברפי (ללא קפיצה)", sets: 3, duration: '30 שניות', videoUrl: 'https://www.youtube.com/watch?v=xRdGC6cFY0s' },
      { name: 'Mountain Climbers', sets: 4, duration: '40 שניות', videoUrl: 'https://www.youtube.com/watch?v=xRdGC6cFY0s' },
      { name: 'Squat Jumps', sets: 3, reps: '15 חזרות', videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U' },
      { name: 'שחרור ומתיחות', duration: '5 דקות' },
    ],
  },
  {
    id: 'women-yoga-1',
    name: 'יוגה לנשים – כוח וגמישות',
    type: 'yoga',
    duration: 50,
    intensity: 'medium',
    targetGender: 'female',
    pregnancySafe: false,
    calories: 200,
    description: 'שילוב כוח וגמישות בסגנון Vinyasa. מחזק ליבה ומרגיע נפש.',
    exercises: [
      { name: 'סורייה נמסקרא (שמש ביקורת) ×6', duration: '10 דקות', videoUrl: 'https://www.youtube.com/watch?v=UPszTB6UzaA' },
      { name: 'תנוחת לוחם III', duration: '2 דקות לכל צד', videoUrl: 'https://www.youtube.com/watch?v=t4yz5Tnam0o' },
      { name: 'תנוחת נשר', duration: '2 דקות לכל צד' },
      { name: 'כלב מסתכל למטה ×5', duration: '3 דקות', videoUrl: 'https://www.youtube.com/watch?v=3TWz3hoog9w' },
      { name: 'תנוחת גמל', reps: '3 פעמים' },
      { name: 'שחרור פיריפורמיס', duration: '3 דקות לכל צד' },
      { name: 'שבסאנה', duration: '10 דקות' },
    ],
  },
  {
    id: 'men-strength-1',
    name: 'אימון כוח לגברים – בניית מסת שריר',
    type: 'strength',
    duration: 60,
    intensity: 'high',
    targetGender: 'male',
    pregnancySafe: false,
    calories: 420,
    description: 'אימון כוח מלא לבניית מסת שריר וחיזוק הגוף.',
    exercises: [
      { name: 'סקוואט עם מוט', sets: 4, reps: '8-10 חזרות', rest: '90 שניות', notes: 'משקל מאתגר', videoUrl: 'https://www.youtube.com/watch?v=Uv_DKDl7EjA' },
      { name: 'לחיצת ספסל (Bench Press)', sets: 4, reps: '8-10 חזרות', rest: '90 שניות', videoUrl: 'https://www.youtube.com/watch?v=Z1ErMMcDR9E' },
      { name: 'מתח (Pull-ups)', sets: 3, reps: 'מקסימום', rest: '90 שניות', videoUrl: 'https://www.youtube.com/watch?v=Z1ErMMcDR9E' },
      { name: 'Deadlift', sets: 3, reps: '6-8 חזרות', rest: '120 שניות', notes: 'טכניקה נכונה קודמת למשקל', videoUrl: 'https://www.youtube.com/watch?v=XxWcirHIwVo' },
      { name: 'לחיצת כתפיים (Overhead Press)', sets: 3, reps: '10 חזרות', rest: '75 שניות', videoUrl: 'https://www.youtube.com/watch?v=Z1ErMMcDR9E' },
      { name: 'כיפוף מרפקים עם מוט', sets: 3, reps: '12 חזרות', rest: '60 שניות' },
      { name: 'Tricep Dips', sets: 3, reps: '12-15 חזרות', rest: '60 שניות' },
      { name: 'פלאנק', sets: 3, duration: '60 שניות', rest: '30 שניות', videoUrl: 'https://www.youtube.com/watch?v=BQu26ABuVS0' },
    ],
  },
  {
    id: 'men-cardio-1',
    name: 'HIIT לגברים – שריפת שומן וכושר',
    type: 'cardio',
    duration: 40,
    intensity: 'high',
    targetGender: 'male',
    pregnancySafe: false,
    calories: 460,
    description: 'אינטרוולים עצימים לשריפת שומן ושיפור כושר קרדיו-ווסקולרי.',
    exercises: [
      { name: 'חימום – ריצה קלה', duration: '5 דקות' },
      { name: 'ספרינט 100 מטר', sets: 6, rest: '90 שניות' },
      { name: 'ברפי', sets: 4, reps: '15 חזרות', rest: '45 שניות', videoUrl: 'https://www.youtube.com/watch?v=xRdGC6cFY0s' },
      { name: 'Box Jumps', sets: 4, reps: '12 חזרות', rest: '60 שניות' },
      { name: 'Mountain Climbers', sets: 4, duration: '45 שניות', rest: '15 שניות', videoUrl: 'https://www.youtube.com/watch?v=xRdGC6cFY0s' },
      { name: 'Squat Jumps', sets: 3, reps: '20 חזרות', rest: '45 שניות', videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U' },
      { name: 'קירור – ריצה קלה', duration: '5 דקות' },
    ],
  },
  {
    id: 'men-pilates-1',
    name: 'פילאטיס וליבה לגברים',
    type: 'pilates',
    duration: 40,
    intensity: 'medium',
    targetGender: 'male',
    pregnancySafe: false,
    calories: 250,
    description: 'חיזוק שרירי הליבה, שיפור יציבה וגמישות לגברים.',
    exercises: [
      { name: 'Dead Bug', sets: 3, reps: '10 לכל צד', rest: '30 שניות' },
      { name: 'פלאנק קדמי + צדדי', sets: 3, duration: '45 שניות כל כיוון', videoUrl: 'https://www.youtube.com/watch?v=BQu26ABuVS0' },
      { name: 'Roll-Up', sets: 3, reps: '10 חזרות' },
      { name: 'Single Leg Stretch', sets: 3, reps: '10 לכל רגל' },
      { name: 'Hundred (גרסה מתקדמת)', sets: 1, duration: '100 פעימות' },
      { name: 'Swan Dive', sets: 3, reps: '10 חזרות' },
    ],
  },
  {
    id: 'general-yoga-1',
    name: 'יוגה כללי – גמישות וליבה',
    type: 'yoga',
    duration: 50,
    intensity: 'low',
    targetGender: 'all',
    pregnancySafe: false,
    calories: 180,
    description: 'שיפור גמישות, חיזוק ליבה ורגיעה מנטלית. מתאים לכל הרמות.',
    exercises: [
      { name: 'סורייה נמסקרא ×5', duration: '10 דקות', videoUrl: 'https://www.youtube.com/watch?v=UPszTB6UzaA' },
      { name: 'תנוחת לוחם II', duration: '2 דקות לכל צד', videoUrl: 'https://www.youtube.com/watch?v=t4yz5Tnam0o' },
      { name: 'תנוחת משולש', duration: '2 דקות לכל צד' },
      { name: 'כלב מסתכל למטה', duration: '3 דקות', videoUrl: 'https://www.youtube.com/watch?v=3TWz3hoog9w' },
      { name: "ישיבת פרפר", duration: '3 דקות', videoUrl: 'https://www.youtube.com/watch?v=Bv6IJBehD6U' },
      { name: "שכיבת ילד (Child's Pose)", duration: '3 דקות' },
      { name: 'שחרור פיריפורמיס', duration: '2 דקות לכל צד' },
      { name: 'שבסאנה', duration: '10 דקות' },
    ],
  },
]

export function getWorkoutsForUser(
  gender: 'male' | 'female' | null,
  isPregnant: boolean,
  pregnancyWeek: number | null
): WorkoutPlan[] {
  const trimester = pregnancyWeek ? getTrimester(pregnancyWeek) : null

  return workoutPlans.filter((w) => {
    if (isPregnant) {
      if (!w.pregnancySafe) return false
      if (trimester && w.trimesters && !w.trimesters.includes(trimester)) return false
      return true
    }
    if (w.targetGender === 'all') return true
    if (w.targetGender === gender) return true
    return false
  })
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1
  if (week <= 27) return 2
  return 3
}

export const workoutTypeLabels: Record<string, string> = {
  yoga: 'יוגה',
  pilates: 'פילאטיס',
  strength: 'כוח',
  cardio: 'אירובי',
  stretching: 'מתיחות',
  walking: 'הליכה',
}

export const intensityLabels: Record<string, string> = {
  low: 'קל',
  medium: 'בינוני',
  high: 'גבוה',
}

export const intensityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export const workoutTypeColors: Record<string, string> = {
  yoga: 'bg-purple-100 text-purple-700',
  pilates: 'bg-pink-100 text-pink-700',
  strength: 'bg-orange-100 text-orange-700',
  cardio: 'bg-blue-100 text-blue-700',
  stretching: 'bg-teal-100 text-teal-700',
  walking: 'bg-emerald-100 text-emerald-700',
}
