'use client'
import Link from 'next/link'
import { useAuth } from '@/context/auth'

export const Navbar = () => {
    const { user, logout } = useAuth()

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link href="/">Mini Twitter</Link>
            </div>
            <div className="navbar-actions">
                {user ? (
                    <>
                        <Link href="/feed">Feed</Link>
                        <Link href={`/profile/${user.id}`}>Perfil</Link>
                        <button onClick={logout}>Sair</button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Login</Link>
                        <Link href="/register">Registrar</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
