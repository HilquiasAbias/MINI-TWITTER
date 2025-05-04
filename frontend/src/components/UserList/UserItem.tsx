import React from 'react';
import { useState } from 'react';

interface UserItemProps {
    user: {
        id: string;
        username: string;
        email: string;
        picture: string;
        is_following: boolean;
        is_follower: boolean;
    };
    onFollow: (userId: string) => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onFollow }) => {
    const [isLoading, setIsLoading] = useState(false);

    // If already following, don't show this user
    if (user.is_following) {
        return null;
    }

    const handleFollowClick = async () => {
        setIsLoading(true);
        try {
            // Apenas notifica o componente pai para fazer a requisição
            await onFollow(user.id);
        } finally {
            setIsLoading(false);
        }
    };

    // Use default avatar if no picture is provided
    const avatarSrc = user.picture || '/default-avatar.png';

    return (
        <div className="user-item">
            <div className="user-avatar">
                <img
                    src={avatarSrc}
                    alt={user.username}
                    className="user-avatar-img"
                    onError={(e) => {
                        // Fallback to default avatar if image loading fails
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                />
            </div>
            <div className="user-info">
                <p className="username">{user.username}</p>
            </div>
            <button
                onClick={handleFollowClick}
                disabled={isLoading}
                className="follow-button"
            >
                {isLoading ? 'Loading...' : user.is_follower ? 'Seguir de volta' : 'Seguir'}
            </button>
        </div>
    );
};
