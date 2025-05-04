'use client'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { authService } from '@/services/api'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        console.log("Submitting registration form...");

        // Verificar se as senhas coincidem
        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        try {
            const response = await authService.register({ email, username, password, password2: confirmPassword })
            console.log("Registration response:", response.data);

            // Em vez de fazer login, redireciona para a página de login com a mensagem
            router.push(`/login?message=${encodeURIComponent(response.data.message || 'Cadastro realizado com sucesso!')}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro no cadastro')
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Criar Conta</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome de usuário"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar senha"
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Registrar</button>
                </form>
                <p>
                    Já tem uma conta? <Link href="/login">Faça login</Link>
                </p>
            </div>
        </div>
    )
}
