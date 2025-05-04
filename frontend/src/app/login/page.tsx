'use client'
import { useAuth } from '@/context/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { authService } from '@/services/api'
import Link from 'next/link'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const { login } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Verificar se há uma mensagem na URL
        const message = searchParams.get('message')
        if (message) {
            setSuccessMessage(message)
            setShowToast(true)

            // Esconder o toast após 5 segundos
            const timer = setTimeout(() => {
                setShowToast(false)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [searchParams])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const response = await authService.login({ username, password })
            console.log("Login response:", response.data);

            const user = {
                id: response.data.user_id,
                username: response.data.username,
            }
            login(response.data.access, user)
            router.push('/feed')
        } catch (err) {
            setError('Credenciais inválidas')
        }
    }

    return (
        <div className="auth-container">
            {showToast && (
                <div className="toast success-toast">
                    {successMessage}
                </div>
            )}

            <div className="auth-form">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Usuário"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Entrar</button>
                </form>
                <p>
                    Não tem uma conta? <Link href="/register">Registre-se</Link>
                </p>
            </div>
        </div>
    )
}
