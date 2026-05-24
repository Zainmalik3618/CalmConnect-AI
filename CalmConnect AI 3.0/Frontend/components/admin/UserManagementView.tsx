
import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import { BanIcon, TrashIcon, UserPlusIcon, UnlockIcon, ClockIcon, XCircleIcon } from '../Icons';
import ConfirmationDialog from '../ConfirmationDialog';
import AddPsychiatristModal from './AddPsychiatristModal';
import UserProfileModal from '../UserProfileModal';

interface UserManagementViewProps {
    currentUser: User;
    users: User[];
    onUpdateUsers: (users: User[]) => void;
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

type RoleFilter = 'all' | 'patient' | 'psychiatrist';

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser, users, onUpdateUsers, apiFetch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => user.id !== currentUser.id) // Exclude current admin
            .filter(user => {
                if (roleFilter === 'all') return true;
                return user.role === roleFilter;
            })
            .filter(user => {
                const term = searchTerm.toLowerCase();
                return user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
            })
            .sort((a, b) => {
                // Sort users with deletion requests to the top
                if (a.deletion_requested_at && !b.deletion_requested_at) return -1;
                if (!a.deletion_requested_at && b.deletion_requested_at) return 1;
                
                // If both have or both don't have deletion requests, sort by username
                return a.username.localeCompare(b.username);
            });
    }, [users, currentUser.id, roleFilter, searchTerm]);

    const handleToggleBlock = async (userToUpdate: User) => {
        setError(null);
        const newStatus = userToUpdate.status === 'blocked' ? 'active' : 'blocked';
        try {
            const updatedUser = await apiFetch(`/users/${userToUpdate.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });
            const updatedUsers = users.map(user =>
                user.id === userToUpdate.id ? updatedUser : user
            );
            onUpdateUsers(updatedUsers);
        } catch (err) {
            console.error("Failed to update user status:", err);
            setError(`Failed to update status for ${userToUpdate.username}. Please try again.`);
        }
    };

    const handleRejectDeletion = async (userToUpdate: User) => {
        setError(null);
        try {
            const updatedUser = await apiFetch(`/users/${userToUpdate.id}/reject-deletion`, {
                method: 'POST',
            });
            const updatedUsers = users.map(user =>
                user.id === userToUpdate.id ? updatedUser : user
            );
            onUpdateUsers(updatedUsers);
        } catch (err) {
            console.error("Failed to reject deletion request:", err);
            setError(`Failed to reject deletion request for ${userToUpdate.username}. Please try again.`);
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setError(null);
        try {
            await apiFetch(`/users/${userToDelete.id}`, {
                method: 'DELETE',
            });
            const updatedUsers = users.filter(user => user.id !== userToDelete.id);
            onUpdateUsers(updatedUsers);
            setUserToDelete(null);
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError(`Failed to delete user ${userToDelete.username}. Please try again.`);
            setUserToDelete(null); // Close modal even on error
        }
    };

    const handleAddPsychiatrist = (newUser: User) => {
        onUpdateUsers([...users, newUser]);
        setIsAddModalOpen(false);
    };

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">View, manage, and add user accounts.</p>
                </div>
                 <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                >
                    <UserPlusIcon /> Add Psychiatrist
                </button>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Controls */}
            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    id="user-search"
                    name="user-search"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                    <button onClick={() => setRoleFilter('all')} className={`px-4 py-2 text-sm rounded-md ${roleFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>All</button>
                    <button onClick={() => setRoleFilter('patient')} className={`px-4 py-2 text-sm rounded-md ${roleFilter === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Patients</button>
                    <button onClick={() => setRoleFilter('psychiatrist')} className={`px-4 py-2 text-sm rounded-md ${roleFilter === 'psychiatrist' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Psychiatrists</button>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <button 
                                            onClick={() => setViewingUser(user)}
                                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-left focus:outline-none"
                                            title="View Profile"
                                        >
                                            {user.username}
                                        </button>
                                        {user.deletion_requested_at && (
                                            <span title={`Deletion requested on ${new Date(user.deletion_requested_at).toLocaleDateString()}`}>
                                                <ClockIcon className="h-4 w-4 text-orange-500 ml-2" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{user.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status !== 'blocked' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {user.status === 'blocked' ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user.deletion_requested_at && (
                                        <button 
                                            onClick={() => handleRejectDeletion(user)} 
                                            className="p-2 rounded-md text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/50 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                            title="Reject Deletion Request"
                                        >
                                            <XCircleIcon />
                                        </button>
                                    )}
                                    <button onClick={() => handleToggleBlock(user)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}>
                                        {user.status === 'blocked' ? <UnlockIcon /> : <BanIcon />}
                                    </button>
                                    <button onClick={() => handleDeleteClick(user)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500" title="Delete User">
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <p className="text-center p-6 text-gray-500">No users found.</p>
                )}
            </div>

            <UserProfileModal 
                user={viewingUser}
                onClose={() => setViewingUser(null)}
            />

            <ConfirmationDialog
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete User Account"
            >
                {userToDelete?.deletion_requested_at && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-md text-sm">
                        <p className="font-bold text-yellow-800 dark:text-yellow-200">This user has requested account deletion.</p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Reason provided: <span className="italic">{userToDelete.deletion_request_reason || 'No reason provided.'}</span>
                        </p>
                    </div>
                )}
                Are you sure you want to permanently delete the account for <strong className="font-bold">{userToDelete?.username}</strong>? This action cannot be undone.
            </ConfirmationDialog>
            
            <AddPsychiatristModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddPsychiatrist={handleAddPsychiatrist}
                existingUsers={users}
                apiFetch={apiFetch}
            />

        </div>
    );
};

export default UserManagementView;
