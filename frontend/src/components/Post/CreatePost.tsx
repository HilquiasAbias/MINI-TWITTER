'use client'
import { useState } from 'react'
import { postService } from '@/services/api'
import { useAuth } from '@/context/auth'

export const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        try {
            await postService.create({ content, image: image || undefined })
            setContent('')
            setImage(null)
            onPostCreated()
        } catch (error) {
            console.error('Error creating post:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="create-post">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`O que você está pensando, ${user?.username || 'Usuário'}?`}
                    className="create-post-textarea"
                />
                <div className="post-actions">
                    <label htmlFor="post-image" className="file-input-label">
                        <span className="file-icon">📷</span>
                        <span className="file-text">Adicionar imagem</span>
                        <input
                            type="file"
                            id="post-image"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="file-input"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isLoading || !content.trim()}
                        className="post-button"
                    >
                        {isLoading ? 'Postando...' : 'Postar'}
                    </button>
                </div>
                {image && (
                    <div className="image-preview">
                        <img src={URL.createObjectURL(image)} alt="Preview" />
                        <button
                            onClick={() => setImage(null)}
                            type="button"
                            className="remove-image-button"
                        >
                            Remover
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}
