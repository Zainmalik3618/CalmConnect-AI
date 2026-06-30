
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { EyeIcon, EyeSlashIcon, UserPlusIcon } from '../Icons';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';
import { calculatePasswordStrength } from '../../utils/password';
import { validateEmail, validateUsername } from '../../utils/validation';
import PasswordRequirements from '../PasswordRequirements';

interface AddPsychiatristModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPsychiatrist: (newUser: User) => void;
    existingUsers: User[];
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AddPsychiatristModal: React.FC<AddPsychiatristModalProps> = ({ isOpen, onClose, onAddPsychiatrist, existingUsers, apiFetch }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setPasswordStrength(0);
            setIsLoading(false);
            setIsPasswordVisible(false);
            setIsConfirmPasswordVisible(false);

            // Focus first input
            setTimeout(() => usernameInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateUsername(username)) {
            setError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (passwordStrength < 3) {
            setError('Please choose a stronger password.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (existingUsers.some(u => u.email === email)) {
            setError('An account with this email already exists.');
            return;
        }
        if (existingUsers.some(u => u.username === username)) {
            setError('This username is already taken.');
            return;
        }

        setIsLoading(true);
        try {
            const newUserPayload = {
                username,
                email,
                password,
            };
            const createdUser = await apiFetch('/users/psychiatrist', {
                method: 'POST',
                body: JSON.stringify(newUserPayload),
            });
            onAddPsychiatrist(createdUser);
        } catch (err: any) {
            setError(err.message || 'Failed to create psychiatrist account.');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-psychiatrist-title"
        >
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                        <UserPlusIcon />
                    </div>
                    <div>
                        <h2 id="add-psychiatrist-title" className="text-xl font-bold">Add New Psychiatrist</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create a new professional account.</p>
                    </div>
                </div>

                {error && <p role="alert" className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="add-username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input id="add-username" name="username" ref={usernameInputRef} type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="add-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input id="add-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="add-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative mt-1">
                            <input id="add-password" name="password" type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={handlePasswordChange} required className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                                {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <PasswordStrengthIndicator strength={passwordStrength} />
                        <PasswordRequirements password={password} />
                    </div>
                    <div>
                        <label htmlFor="add-confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                         <div className="relative mt-1">
                            <input id="add-confirm-password" name="confirmPassword" type={isConfirmPasswordVisible ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400" aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}>
                                {isConfirmPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 flex items-center justify-center gap-2 w-40 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">
                            {isLoading ? <span className="loading-skeleton-on-accent h-4 w-24 rounded" /> : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPsychiatristModal;
