'use client'
import dynamic from 'next/dynamic'

// Importar o componente de forma dinâmica com SSR desabilitado
const LoginFormDynamic = dynamic(
    () => import('@/components/Auth/LoginForm'),
    { ssr: false }
)

export default function LoginPage() {
    return (
        <div className="auth-container">
            <LoginFormDynamic />
        </div>
    )
}
