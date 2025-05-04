import { User, UserProfile } from '@/lib/types'
import axios from 'axios'

const api = axios.create({
    // baseURL: 'http://localhost/api',
    baseURL: 'http://localhost:8000/api',
})

// Interceptor de autenticação mantido
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const authService = {
    register: (data: { email: string; username: string; password: string, password2: string }) =>
        api.post('/users/register/', data), // Endpoint atualizado
    login: (data: { username: string; password: string }) =>
        api.post('/users/token/', data), // Endpoint atualizado
}

export const postService = {
    create: (data: { content: string; image?: File }) => {
        const formData = new FormData()
        formData.append('content', data.content)
        if (data.image) formData.append('image', data.image)
        return api.post('/posts/', formData) // Endpoint atualizado
    },
    getFeed: (page: number = 1) =>
        api.get('/posts/feed/', { params: { page } }), // Endpoint atualizado
    likePost: (postId: string) =>
        api.post(`/posts/${postId}/like/`), // Novo endpoint de like
}

export const userService = {
    follow: (userId: string) =>
        api.post(`/relationships/follow/${userId}/`), // Endpoint atualizado
    unfollow: (userId: string) =>
        api.delete(`/relationships/follow/${userId}/`),
    checkFollow: (userId: string) =>
        api.get(`/relationships/check-follow/${userId}/`), // Novo endpoint
    getFoollowers: (userId: string, page: number = 1, pageSize: number = 10) =>
        api.get(`/relationships/followers/${userId}/`, { params: { page, page_size: pageSize } }),
    getFollowing: (userId: string, page: number = 1, pageSize: number = 10) =>
        api.get(`/relationships/following/${userId}/`, { params: { page, page_size: pageSize } }),
    getRelantionshipsStats: (userId: string) =>
        api.get(`/relationships/stats/${userId}/`), // Endpoint atualizado
    getUserPosts: (userId: string, page: number = 1) =>
        api.get(`/posts/user/${userId}/`, { params: { page } }), // Endpoint atualizado
    // Método corrigido para usar o endpoint correto
    getUsers: (page: number = 1, pageSize: number = 10, query: string = '') =>
        api.get('/users/search/', {
            params: {
                page,
                page_size: pageSize,
                q: query
            }
        }),
}

// Adicione isso para pegar o perfil do usuário logado
export const profileService = {
    getProfile: (userId: string) =>
        api.get(`/users/${userId}/`), // Endpoint atualizado
    getCurrentUserProfile: () => api.get<UserProfile>('/users/profile/'),
    updateProfile: (data: { bio?: string; avatar?: File }) => {
        const formData = new FormData();
        if (data.bio !== undefined) formData.append('bio', data.bio);
        if (data.avatar) formData.append('picture', data.avatar);  // IMPORTANTE: o nome deve corresponder ao campo no modelo

        console.log('Enviando dados para atualização de perfil:', {
            bio: data.bio,
            hasAvatar: !!data.avatar
        });

        return api.put('/users/profile/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}