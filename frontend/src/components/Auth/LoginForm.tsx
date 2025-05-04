'use client'
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { authService } from '@/services/api'
import Link from 'next/link'

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [showToast, setShowToast] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Verificar se há uma mensagem na URL usando window.location
        const searchParams = new URLSearchParams(window.location.search)
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
    }, [])

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
        <>
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
        </>
    )
}