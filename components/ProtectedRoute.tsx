'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import LoadingDots from './LoadingDots'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/signin')
        return
      }
      // Optional: fetch subscription row from `user_id` metadata
      // if not active, push to /subscribe
      setLoading(false)
    }
    check()
  }, [router])

  if (loading) return <div className="p-8 h-screen w-full flex items-center justify-center gap-2"><LoadingDots/> Loading...</div>
  return <>{children}</>
}