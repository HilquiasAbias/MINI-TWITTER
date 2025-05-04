'use client'
import { Feed } from '@/components/Feed/Feed'
import { Navbar } from '@/components/Common/Navbar'
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FeedPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Só redireciona se não estiver carregando e não houver usuário
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Mostra um indicador de carregamento enquanto verifica a autenticação
    if (loading) {
        return <div className="loading-container">Carregando...</div>
    }

    // Redireciona se não houver usuário após o carregamento
    if (!user) {
        return <div>Redirecionando para login...</div>
    }

    return (
        <main>
            <Navbar />
            <div className="container">
                <Feed />
            </div>
        </main>
    )
}
