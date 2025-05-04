export type User = {
    id: string
    email: string
    username: string
    followers_count: number
    following_count: number
}

export type UserProfile = {
    created_at: string;
    updated_at: string;
    bio?: string;
    picture?: string;
    user?: {
        id: string | number;
        username: string;
        email?: string;
        picture?: string;
        is_following?: boolean;
        is_follower?: boolean;
    }
}


export type UserRelationshipsStats = {
    user?: {
        id: string | number;
        username: string;
        email?: string;
    }
    followers_count: number;
    following_count: number;
    is_following: boolean;
}

export type Post = {
    id: string
    content: string
    image?: string
    likes_count: number
    is_liked: boolean
    created_at: string
    author: User
}

export interface AuthResponse {
    token: string;
    user: User;
}
