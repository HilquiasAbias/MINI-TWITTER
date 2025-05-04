import { postService } from '@/services/api'
import { useState } from 'react'

export const Post = ({ post }: { post: any }) => {
    const [likes, setLikes] = useState(post.likes_count)
    const [isLiked, setIsLiked] = useState(post.is_liked)
    const [isLikeLoading, setIsLikeLoading] = useState(false)

    const handleLike = async () => {
        if (isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            await postService.likePost(post.id)
            setIsLiked(!isLiked)
            setLikes((prev: any) => isLiked ? prev - 1 : prev + 1)
        } catch (error) {
            console.error('Erro ao curtir:', error)
        } finally {
            setIsLikeLoading(false);
        }
    }

    return (
        <div className="post">
            <div className="post-header">
                <h3>{post.user?.username || 'Usuário desconhecido'}</h3>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <p>{post.content}</p>
            {post.image && <img src={post.image} alt="Post" className="post-image" />}
            <button
                onClick={handleLike}
                className={`like-button ${isLiked ? 'liked' : ''}`}
                disabled={isLikeLoading}
            >
                <span className={`heart-icon ${isLiked ? 'heart-filled' : 'heart-empty'}`}></span>
                <span className="like-count">{likes}</span>
            </button>
        </div>
    )
}

