"use client"
import Link from 'next/link'
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/feed')
    }
  }, [user, router])

  return (
    <main className="landing-page">
      <div className="landing-container">
        <div className="landing-left">
          <Image
            src="/logo.png"
            alt="Mini Twitter Logo"
            width={400}
            height={400}
            className="landing-logo"
            priority
          />
        </div>
        <div className="landing-right">
          <div className="landing-content">
            <h1>Bem-vindo ao Mini Twitter</h1>
            <div className="auth-buttons">
              <Link href="/login" className="button">
                Entrar
              </Link>
              <Link href="/register" className="button">
                Registrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
