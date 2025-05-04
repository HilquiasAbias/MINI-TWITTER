import React, { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { UserItem } from './UserItem';
import { useAuth } from '@/context/auth';

export const UserList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await userService.getUsers();
                // Filtrar o usuário logado da lista
                const filteredUsers = response.data.results.filter((u: any) => u.id !== user?.id);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const handleFollow = (userId: string) => {
        // Update local state if needed
        setUsers(users.map(user =>
            user.id === userId ? { ...user, is_following: true } : user
        ));
    };

    if (loading) return <div className="loading-container">Loading users...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="user-list">
            <h2>Suggested Users</h2>
            {users.length > 0 ? (
                users.map(user => (
                    <UserItem
                        key={user.id}
                        user={user}
                        onFollow={handleFollow}
                    />
                ))
            ) : (
                <p className="no-results">No users found</p>
            )}
        </div>
    );
};
