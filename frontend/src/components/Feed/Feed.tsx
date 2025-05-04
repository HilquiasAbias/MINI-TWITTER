'use client'
import { Post } from '@/components/Post/Post'
import { CreatePost } from '@/components/Post/CreatePost'
import { postService, userService } from '@/services/api'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth'
import { UserItem } from '@/components/UserList/UserItem'

export const Feed = () => {
    const [posts, setPosts] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [postPage, setPostPage] = useState(1)
    const [userPage, setUserPage] = useState(1)
    const [userSearch, setUserSearch] = useState('')
    const [hasMorePosts, setHasMorePosts] = useState(true)
    const [hasMoreUsers, setHasMoreUsers] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const { token, user } = useAuth()

    const fetchPosts = async () => {
        try {
            const response = await postService.getFeed(postPage)
            console.log("Feed response:", response.data);

            // Garantir que response.data é um array
            const postsData = Array.isArray(response.data) ? response.data : [];

            if (postPage === 1) {
                // Se for a primeira página, substitui completamente os posts
                setPosts(postsData)
            } else {
                // Se for carregamento de mais posts, adiciona apenas posts que não existem ainda
                setPosts((prev) => {
                    // Cria um Set com os IDs dos posts existentes para verificação rápida
                    const existingIds = new Set(prev.map(post => post.id));

                    // Filtra apenas os novos posts
                    const newPosts = postsData.filter(post => !existingIds.has(post.id));

                    // Retorna a lista anterior mais os novos posts
                    return [...prev, ...newPosts];
                });
            }

            // Se não recebemos novos posts, não há mais para carregar
            setHasMorePosts(postsData.length > 0);
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await userService.getUsers(userPage, 10, userSearch)
            console.log("Users response:", response.data);

            // Verificando a estrutura da resposta
            const userData = response.data.results || response.data;

            // Filtrar o usuário logado da lista
            const filteredUsers = userData.filter((u: any) => u.id !== user?.id);

            if (userPage === 1) {
                setUsers(filteredUsers)
            } else {
                // Similar ao que fizemos com os posts, evitamos duplicatas
                setUsers((prev) => {
                    const existingIds = new Set(prev.map(user => user.id));
                    const newUsers = filteredUsers.filter((user: any) => !existingIds.has(user.id));
                    return [...prev, ...newUsers];
                });
            }

            // Verificando se há mais páginas
            setHasMoreUsers(!!response.data.next)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [postPage, token])

    useEffect(() => {
        // Resetar a página quando a busca mudar
        if (userPage === 1) {
            fetchUsers()
        } else {
            setUserPage(1) // Isso vai disparar o useEffect acima
        }
    }, [userSearch, token])

    // Efeito separado para mudanças na página de usuários
    useEffect(() => {
        fetchUsers()
    }, [userPage])

    const handlePostCreated = () => {
        setPosts([])
        setPostPage(1)
        fetchPosts()
    }

    const handleFollow = async (userId: string) => {
        try {
            await userService.follow(userId)

            // Atualizar a lista de usuários para remover o usuário seguido
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))

            // Mostrar toast de sucesso
            setToast({
                show: true,
                message: 'Usuário seguido com sucesso!',
                type: 'success'
            })

            // Esconder o toast após 5 segundos
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' })
            }, 5000)

            // Atualizar o feed para incluir posts do usuário seguido
            setPosts([])
            setPostPage(1)
            fetchPosts()
        } catch (error) {
            console.error('Error following user:', error)

            // Mostrar toast de erro
            setToast({
                show: true,
                message: 'Erro ao seguir usuário',
                type: 'error'
            })

            // Esconder o toast após 5 segundos
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' })
            }, 5000)
        }
    }

    return (
        <div className="feed-container">
            {toast.show && (
                <div className={`toast ${toast.type}-toast`}>
                    {toast.message}
                </div>
            )}

            <div className="feed-posts">
                <div className="create-post-container">
                    <CreatePost onPostCreated={handlePostCreated} />
                </div>

                <div className="posts-list">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))
                    ) : (
                        <p className="no-posts">Nenhum post encontrado. Siga mais usuários para ver posts!</p>
                    )}

                    {hasMorePosts && posts.length > 0 && (
                        <button
                            className="load-more-button"
                            onClick={() => setPostPage(prev => prev + 1)}
                        >
                            Carregar mais posts
                        </button>
                    )}
                </div>
            </div>

            <div className="feed-users">
                <h3>Usuários para seguir</h3>

                <div className="user-search">
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                    />
                </div>

                <div className="users-list">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <UserItem
                                key={user.id}
                                user={user}
                                onFollow={handleFollow}
                            />
                        ))
                    ) : (
                        <p className="no-results">Nenhum usuário encontrado</p>
                    )}

                    {hasMoreUsers && users.length > 0 && (
                        <button
                            className="load-more-button"
                            onClick={() => setUserPage(prev => prev + 1)}
                        >
                            Carregar mais usuários
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
