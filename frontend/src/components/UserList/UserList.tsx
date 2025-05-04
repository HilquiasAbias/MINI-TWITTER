import React, { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import { UserItem } from './UserItem';


export const UserList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await userService.getUsers();
                setUsers(response.data.results);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

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
