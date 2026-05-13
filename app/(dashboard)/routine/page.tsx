'use client'

const morningSteps = [
  '20 סיבובי קרסוליים לכל צד — לפני הקימה מהמיטה',
  '10 חזרות מתיחת "חתול-פרה" לשחרור הגב התחתון והעצב הסיאטי',
  'שתיית כוס מים גדולה',
]

const eveningSteps = [
  '20 דקות הגבהת רגליים על הקיר',
  'שינה עם כרית הריון התומכת מהברך עד הקרסול',
]

const weekDays = [
  {
    day: 'ראשון',
    tags: [{ label: '🏊 בריכה', color: 'bg-sky-100 text-sky-700' }],
    detail: '15 דק׳ הליכה במים · תנועות "אופניים" · ציפה להרפיה',
    note: 'בוקר / צהריים',
  },
  {
    day: 'שני',
    tags: [{ label: '🧘 מתיחות', color: 'bg-emerald-100 text-emerald-700' }],
    detail: 'Yoga with Adriene – Prenatal Sciatica',
    note: 'או הכנה ללידה של Bridget Teyler',
  },
  {
    day: 'שלישי',
    tags: [
      { label: '🧘 מתיחות', color: 'bg-emerald-100 text-emerald-700' },
      { label: '✨ טיפוח עור', color: 'bg-purple-100 text-purple-700' },
    ],
    detail: 'מתיחות קצרות (סרטון יוטיוב)',
    note: 'פילינג ביתי מקפה ושמן זית במקלחת',
  },
  {
    day: 'רביעי',
    tags: [{ label: '🏊 בריכה', color: 'bg-sky-100 text-sky-700' }],
    detail: '15 דק׳ הליכה במים · תנועות "אופניים" · ציפה להרפיה',
    note: 'בוקר / צהריים',
  },
  {
    day: 'חמישי',
    tags: [{ label: '🧘 מתיחות', color: 'bg-emerald-100 text-emerald-700' }],
    detail: 'Yoga with Adriene – Prenatal Sciatica',
    note: 'או הכנה ללידה של Bridget Teyler',
  },
  {
    day: 'שישי',
    tags: [{ label: '✨ טיפוח עור', color: 'bg-purple-100 text-purple-700' }],
    detail: 'פילינג ביתי מקפה ושמן זית במקלחת',
    note: 'לטיפוח ומיצוק העור',
  },
  {
    day: 'שבת',
    tags: [{ label: '💛 מנוחה', color: 'bg-amber-100 text-amber-700' }],
    detail: 'יום מנוחה מלאה — להקשיב לגוף',
    note: '',
  },
]

const nutrition = [
  { icon: '🧂', title: 'דל נתרן', desc: 'להורדת נפיחות בברך' },
  { icon: '🥩', title: 'חלבון + ברזל', desc: 'לבניית שריר ומניעת אנמיה' },
  { icon: '🍽️', title: 'ארוחות קטנות ותכופות', desc: 'לייצוב סוכר ועיכול' },
  { icon: '💧', title: '2.5 ליטר מים', desc: 'שתייה סדירה לאורך היום' },
]

const notes = [
  { icon: '👟', title: 'נעלי Hoka תמיד', desc: 'גם בבית — לתמיכה מרבית בצעד', style: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { icon: '⚠️', title: 'להימנע מעמידה ממושכת', desc: 'לזוז, לשבת, לחלק עמידה לאורך היום', style: 'bg-amber-50 border-amber-200 text-amber-800' },
  { icon: '🛑', title: 'עצירה מיידית בדקירה בברך', desc: 'לעצור כל פעילות אם מופיע כאב', style: 'bg-red-50 border-red-200 text-red-800' },
]

export default function RoutinePage() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto" dir="rtl">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-1">תוכנית אישית</p>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-1">לוּז רוטינה שבועית 🌸</h1>
        <p className="text-sm text-slate-400">לגוף בריא, נשמה מאושרת ותנועה נכונה</p>
        <div className="w-12 h-0.5 bg-gradient-to-l from-rose-300 to-amber-300 rounded-full mx-auto mt-3" />
      </div>

      {/* Daily routines */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">שגרה יומית קבועה</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-800 mb-3 flex items-center gap-2">☀️ שגרת בוקר</p>
          <ul className="space-y-2">
            {morningSteps.map((s) => (
              <li key={s} className="text-sm text-amber-900 flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-400">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
          <p className="font-bold text-violet-800 mb-3 flex items-center gap-2">🌙 שגרת ערב</p>
          <ul className="space-y-2">
            {eveningSteps.map((s) => (
              <li key={s} className="text-sm text-violet-900 flex gap-2">
                <span className="mt-0.5 shrink-0 text-violet-400">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly table */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">לוח פעילות שבועי</h2>
      <div className="rounded-2xl border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-100">
              <th className="text-right px-4 py-3 font-semibold w-20">יום</th>
              <th className="text-right px-4 py-3 font-semibold">פעילות</th>
              <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">פירוט</th>
            </tr>
          </thead>
          <tbody>
            {weekDays.map(({ day, tags, detail, note }, i) => (
              <tr key={day} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap">{day}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.color}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 sm:hidden">{detail}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-slate-700">{detail}</p>
                  {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nutrition */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">דגשי תזונה</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {nutrition.map(({ icon, title, desc }) => (
          <div key={title} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1.5">{icon}</div>
            <p className="text-xs font-bold text-emerald-800 mb-1">{title}</p>
            <p className="text-xs text-emerald-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Special notes */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">הנחיות מיוחדות</h2>
      <div className="space-y-3 mb-8">
        {notes.map(({ icon, title, desc, style }) => (
          <div key={title} className={`flex items-start gap-3 border rounded-xl p-4 ${style}`}>
            <span className="text-xl shrink-0">{icon}</span>
            <div>
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs mt-0.5 opacity-80">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-5 border-t border-slate-100">
        <p className="font-bold text-slate-700 text-base">את עושה עבודה מדהימה — המשיכי כך! 💪🌸</p>
        <p className="text-xs text-slate-400 mt-1">הקשיבי לגוף שלך · קחי צעד אחד בכל פעם · כל תנועה קטנה נחשבת</p>
      </div>

    </div>
  )
}
