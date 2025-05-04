'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { userService, profileService } from '@/services/api'
import { Post } from '@/components/Post/Post'
import { useAuth } from '@/context/auth'
import { Navbar } from '@/components/Common/Navbar'
import { UserRelationshipsStats } from '@/lib/types'

export default function ProfilePage() {
    const { userId } = useParams()
    const [user, setUser] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user: currentUser } = useAuth()

    const [relationshipStats, setRelationshipStats] = useState<UserRelationshipsStats | null>(null)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)

    // Estados para edição de perfil
    const [isEditing, setIsEditing] = useState(false)
    const [bio, setBio] = useState('')
    const [avatar, setAvatar] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [updateSuccess, setUpdateSuccess] = useState(false)

    // Referência para o input de arquivo
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!userId || userId === 'undefined') {
            setError('ID de usuário inválido')
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                console.log(currentUser, userId);

                // Verificar se estamos visualizando nosso próprio perfil
                const isOwnProfile = currentUser && (currentUser.id == userId);

                let profileRes, postsRes, statsRes;

                if (isOwnProfile) {
                    // Se for o próprio perfil, use o endpoint específico
                    console.log('Buscando perfil do usuário logado');

                    [profileRes, postsRes, statsRes] = await Promise.all([
                        profileService.getCurrentUserProfile(),
                        userService.getUserPosts(userId as string),
                        userService.getRelantionshipsStats(userId as string)
                    ]);
                } else {
                    // Se for perfil de outro usuário
                    console.log('Buscando perfil de outro usuário');
                    [profileRes, postsRes, statsRes] = await Promise.all([
                        profileService.getProfile(userId as string),
                        userService.getUserPosts(userId as string),
                        userService.getRelantionshipsStats(userId as string)
                    ]);
                }

                console.log('Perfil recebido:', profileRes.data);

                // Mapear os dados corretamente com base na estrutura da resposta
                const profileData = profileRes.data;

                // Construir a URL completa da imagem
                let avatarUrl = profileData.picture || '';

                // Se a URL da imagem começar com /media/, adicione a URL base do servidor
                if (avatarUrl && avatarUrl.startsWith('/media/')) {
                    avatarUrl = `http://localhost:8000${avatarUrl}`;
                }

                console.log('avatarUrl:', avatarUrl);

                setUser({
                    id: profileData.user?.id,
                    username: profileData.user?.username,
                    email: profileData.user?.email,
                    bio: profileData.bio || '',
                    avatar: avatarUrl,
                });

                setBio(profileData.bio || '');
                setPosts(postsRes.data);
                setRelationshipStats(statsRes.data);
                setIsFollowing(statsRes.data.is_following);

                // Use the stats from getRelantionshipsStats
                setFollowersCount(statsRes.data.followers_count || 0);
                setFollowingCount(statsRes.data.following_count || 0);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Erro ao carregar perfil');
                setLoading(false);
            }
        }

        fetchData();
    }, [userId, currentUser]);


    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await userService.unfollow(userId as string)
                setFollowersCount(prev => prev - 1)
            } else {
                await userService.follow(userId as string)
                setFollowersCount(prev => prev + 1)
            }
            setIsFollowing(!isFollowing)
        } catch (error) {
            console.error('Error following user:', error)
        }
    }

    const handleEditProfile = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setBio(user.bio || '')
        setAvatar(null)
        setAvatarPreview(null)
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatar(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setUpdateLoading(true);
            console.log('Iniciando atualização de perfil com:', { bio, hasAvatar: !!avatar });

            const response = await profileService.updateProfile({
                bio,
                avatar: avatar || undefined
            });

            console.log('Resposta da atualização de perfil:', response.data);

            setUser((prev: any) => ({
                ...prev,
                bio: bio,
                avatar: avatarPreview || prev.avatar
            }));

            setIsEditing(false);
            setUpdateSuccess(true);

            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil. Por favor, tente novamente.');
        } finally {
            setUpdateLoading(false);
        }
    }

    if (loading) return (
        <>
            <Navbar />
            <div>Carregando...</div>
        </>
    )

    if (error) return (
        <>
            <Navbar />
            <div className="error-message">{error}</div>
        </>
    )

    if (!user) return (
        <>
            <Navbar />
            <div>Usuário não encontrado</div>
        </>
    )

    const isOwnProfile = currentUser && (currentUser.id == userId);

    console.log('user:', user);
    const avatarUrl = user.avatar ? 'http://localhost:8000' + user.avatar : '/default-avatar.png';
    console.log('avatarUrl:', avatarUrl);


    return (
        <>
            <Navbar />
            <div className="profile-page">
                {updateSuccess && (
                    <div className="success-message">Perfil atualizado com sucesso!</div>
                )}

                <div className="profile-header">
                    <div className="profile-avatar-container">
                        {isEditing ? (
                            <div className="avatar-edit">
                                <label htmlFor="profile-avatar" className="avatar-label">
                                    <img
                                        src={avatarUrl}
                                        alt={user.username}
                                        className="profile-avatar editable"
                                    />
                                    <div className="avatar-edit-overlay">
                                        <span>Alterar foto</span>
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    id="profile-avatar"
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>
                        ) : (
                            <img
                                src={user.avatar || '/default-avatar.png'}
                                alt={user.username}
                                className="profile-avatar"
                            />
                        )}

                    </div>

                    <h1>{user.username}</h1>
                    <p>{user.email}</p>

                    {isEditing ? (
                        <div className="bio-edit">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Adicione uma bio..."
                                maxLength={160}
                            />
                            <div className="bio-char-count">
                                {bio.length}/160
                            </div>
                        </div>
                    ) : (
                        <p className="user-bio">{user.bio || 'Sem biografia'}</p>
                    )}

                    <div className="profile-stats">
                        <span>{posts.length} posts</span>
                        <span>{followersCount} seguidores</span>
                        <span>{followingCount} seguindo</span>
                    </div>

                    {isOwnProfile ? (
                        isEditing ? (
                            <div className="profile-actions">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={updateLoading}
                                    className="edit-profile-btn"
                                >
                                    {updateLoading ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="cancel-edit-btn"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleEditProfile}
                                className="edit-profile-btn"
                            >
                                Editar perfil
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleFollow}
                            className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        >
                            {isFollowing ? 'Deixar de seguir' : 'Seguir'}
                        </button>
                    )}
                </div>

                <div className="profile-posts">
                    <h2>Posts</h2>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Post key={post.id || post._id} post={post} />
                        ))
                    ) : (
                        <p className="no-posts">Este usuário ainda não fez nenhum post.</p>
                    )}
                </div>
            </div>
        </>
    )

}
