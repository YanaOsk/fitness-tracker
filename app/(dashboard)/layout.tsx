'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  MessageCircle,
  User,
  LogOut,
  Activity,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'ראשי', icon: LayoutDashboard },
  { href: '/workouts', label: 'אימונים', icon: Dumbbell },
  { href: '/nutrition', label: 'תזונה', icon: Apple },
  { href: '/chat', label: 'AI', icon: MessageCircle },
  { href: '/profile', label: 'פרופיל', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => { if (data) setProfile(data as Profile) })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen flex bg-slate-50" dir="rtl">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-l border-slate-100 shadow-sm fixed right-0 top-0 h-full z-30">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">FitLife</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{label}</span>
                {isActive && <div className="mr-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {profile && (
            <div className="flex items-center gap-3 mb-3 px-2">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-semibold text-sm">{profile.full_name?.charAt(0) ?? '?'}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{profile.full_name ?? 'משתמש'}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm">
            <LogOut className="w-4 h-4" />
            <span>החלף משתמש</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:mr-64 pb-20 lg:pb-0">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 safe-area-pb">
        <div className="flex items-center">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
                {isActive && <div className="w-1 h-1 bg-emerald-500 rounded-full" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
