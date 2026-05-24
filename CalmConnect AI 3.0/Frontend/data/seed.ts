import type { User } from '../types';

export const seedProfessionals: User[] = [
    {
        id: 'psychiatrist-01',
        username: 'Dr. Anya Sharma',
        email: 'anya.sharma@calmconnect.com',
        password: 'password123', // In a real app, this would be hashed
        role: 'psychiatrist',
        status: 'active',
    },
    {
        id: 'admin-01',
        username: 'Admin Support',
        email: 'support@calmconnect.com',
        password: 'password123', // In a real app, this would be hashed
        role: 'admin',
        status: 'active',
    }
];