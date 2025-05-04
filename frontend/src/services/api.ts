import { User, UserProfile } from '@/lib/types'
import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    // baseURL: 'http://localhost:8000/api'
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Adicionar interceptor de resposta para tratar erros 401
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authService = {
    register: (data: { email: string; username: string; password: string, password2: string }) =>
        api.post('/users/register/', data),
    login: (data: { username: string; password: string }) =>
        api.post('/users/token/', data),
}

export const postService = {
    create: (data: { content: string; image?: File }) => {
        const formData = new FormData()
        formData.append('content', data.content)
        if (data.image) formData.append('image', data.image)
        return api.post('/posts/', formData)
    },
    getFeed: (page: number = 1) =>
        api.get('/posts/feed/', { params: { page } }),
    likePost: (postId: string) =>
        api.post(`/posts/${postId}/like/`),
}

export const userService = {
    follow: (userId: string) =>
        api.post(`/relationships/follow/${userId}/`),
    unfollow: (userId: string) =>
        api.delete(`/relationships/follow/${userId}/`),
    checkFollow: (userId: string) =>
        api.get(`/relationships/check-follow/${userId}/`),
    getFoollowers: (userId: string, page: number = 1, pageSize: number = 10) =>
        api.get(`/relationships/followers/${userId}/`, { params: { page, page_size: pageSize } }),
    getFollowing: (userId: string, page: number = 1, pageSize: number = 10) =>
        api.get(`/relationships/following/${userId}/`, { params: { page, page_size: pageSize } }),
    getRelantionshipsStats: (userId: string) =>
        api.get(`/relationships/stats/${userId}/`),
    getUserPosts: (userId: string, page: number = 1) =>
        api.get(`/posts/user/${userId}/`, { params: { page } }),
    getUsers: (page: number = 1, pageSize: number = 10, query: string = '') =>
        api.get('/users/search/', {
            params: {
                page,
                page_size: pageSize,
                q: query
            }
        }),
}

export const profileService = {
    getProfile: (userId: string) =>
        api.get(`/users/${userId}/`),
    getCurrentUserProfile: () => api.get<UserProfile>('/users/profile/'),
    updateProfile: (data: { bio?: string; avatar?: File }) => {
        const formData = new FormData();
        if (data.bio !== undefined) formData.append('bio', data.bio);
        if (data.avatar) formData.append('picture', data.avatar);

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
