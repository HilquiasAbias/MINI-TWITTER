'use client'
import { profileService } from '@/services/api'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
    id: string | number;
    username: string;
    email?: string;
    bio?: string;
    picture?: string;
    user?: {
        id: string | number;
        username: string;
        email?: string;
    }
}

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: () => { },
    logout: () => { }
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (storedToken) {
                setToken(storedToken)

                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser)
                        if (parsedUser) {
                            setUser(parsedUser)
                        }
                    } catch (e) {
                        console.error("Erro ao parsear usuário do localStorage:", e)
                    }
                }

                try {
                    const res = await profileService.getCurrentUserProfile()
                    console.log("Resposta da API de perfil:", res.data);

                    const profileData = res.data;
                    const userData = profileData.user;

                    const apiUser: User = {
                        id: userData!.id,
                        username: userData!.username,
                        email: userData!.email,
                        bio: profileData.bio || '',
                        picture: profileData.picture || ''
                    };
                    setUser(apiUser)
                    localStorage.setItem('user', JSON.stringify(apiUser))
                } catch (error) {
                    console.error("Erro ao obter perfil do usuário:", error)
                    // Se a API falhar, mantenha os dados do localStorage
                }
            }

            setLoading(false)
        }

        initAuth()
    }, [])

    const login = (newToken: string, newUser: any) => {
        // Normalizar o formato do usuário ao fazer login
        const normalizedUser: User = {
            id: newUser.id || (newUser.user && newUser.user.id) || newUser.user_id,
            username: newUser.username || (newUser.user && newUser.user.username),
            email: newUser.email || (newUser.user && newUser.user.email),
            bio: newUser.bio || '',
            picture: newUser.picture || ''
        };

        console.log("Login com usuário:", normalizedUser);

        setToken(newToken)
        setUser(normalizedUser)
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(normalizedUser))
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
