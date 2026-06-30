
import React, { useState, useEffect, useRef } from 'react';
import type { User, Appointment } from '../../types';
import { CalendarIcon } from '../Icons';

interface AddAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAppointment: (newAppointment: Omit<Appointment, 'id'>) => Promise<void>;
    psychiatristId: string;
    patients: User[];
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ isOpen, onClose, onAddAppointment, psychiatristId, patients }) => {
    const [patientId, setPatientId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const patientSelectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setPatientId(patients[0]?.id || '');
            setDate('');
            setTime('');
            setNotes('');
            setError('');
            setIsLoading(false);
            setTimeout(() => patientSelectRef.current?.focus(), 100);
        }
    }, [isOpen, patients]);

    const getTodayString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!patientId || !date || !time) {
            setError('Please fill out all required fields.');
            return;
        }
        
        if (new Date(`${date}T${time}`) < new Date()) {
            setError('Cannot schedule an appointment in the past.');
            return;
        }

        setIsLoading(true);
        try {
            const newAppointment: Omit<Appointment, 'id'> = {
                psychiatristId,
                patientId,
                date,
                time,
                notes: notes.trim(),
                status: 'scheduled',
                patientHasSeen: false,
            };
            await onAddAppointment(newAppointment);
            // The parent component is now responsible for closing the modal on success.
        } catch (err: any) {
            setError(err.message || 'Failed to schedule appointment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-appointment-title"
        >
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                        <CalendarIcon />
                    </div>
                    <div>
                        <h2 id="add-appointment-title" className="text-xl font-bold">Schedule Appointment</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Book a new session with a patient.</p>
                    </div>
                </div>

                {error && <p role="alert" className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/50 p-2 rounded-md">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="patient" className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                        <select
                            id="patient"
                            name="patientId"
                            ref={patientSelectRef}
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {patients.length > 0 ? (
                                patients.map(p => <option key={p.id} value={p.id}>{p.username}</option>)
                            ) : (
                                <option disabled>No patients available</option>
                            )}
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input id="date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)} min={getTodayString()} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                            <input id="time" name="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                        <textarea id="notes" name="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Follow-up session" rows={2} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={isLoading || patients.length === 0} className="px-4 py-2 flex items-center justify-center gap-2 w-40 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400">
                            {isLoading ? <span className="loading-skeleton-on-accent h-4 w-20 rounded" /> : 'Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAppointmentModal;
