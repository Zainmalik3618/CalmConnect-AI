import React, { useState, useMemo, useEffect } from 'react';
import type { User, Appointment, Conversation } from '../../types';
import { CalendarIcon, PlusIcon, TrashIcon, CheckCircleIcon, StarIcon, PencilIcon } from '../Icons';
import AddAppointmentModal from './AddAppointmentModal';
import ConfirmationDialog from '../ConfirmationDialog';
import UserProfileModal from '../UserProfileModal';
import FeedbackForm from '../FeedbackForm';

interface AppointmentsViewProps {
    currentUser: User;
    users: User[];
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    conversations: Conversation[];
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

type StatusTab = 'scheduled' | 'cancelled' | 'all' | 'completed';

// Helper function to map server response to frontend type
const formatAppointmentFromServer = (serverAppointment: any): Appointment => {
    // The 'time' column might include seconds, we only want HH:MM.
    const timePart = serverAppointment.time ? serverAppointment.time.substring(0, 5) : '00:00';
    
    // Create a date object from the ISO string from the server.
    // This correctly interprets the timezone information.
    const appointmentDate = new Date(serverAppointment.date);

    // Format the date into YYYY-MM-DD based on the browser's local timezone,
    // which correctly reflects the intended date regardless of where the server is.
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;

    return {
        id: serverAppointment.id,
        psychiatristId: serverAppointment.psychiatrist_id,
        patientId: serverAppointment.patient_id,
        date: datePart,
        time: timePart,
        status: serverAppointment.status,
        notes: serverAppointment.notes,
        patientHasSeen: serverAppointment.patient_has_seen,
    };
};

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ currentUser, users, appointments, setAppointments, conversations, apiFetch }) => {
    const [activeTab, setActiveTab] = useState<StatusTab>('scheduled');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
    const [appointmentToComplete, setAppointmentToComplete] = useState<Appointment | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [feedbackAppointment, setFeedbackAppointment] = useState<Appointment | null>(null);
    const [engagementFeedbackAppointment, setEngagementFeedbackAppointment] = useState<Appointment | null>(null);

    // Mark appointments as seen for patients when they view this page.
    // This is now the single source of truth for this action.
    useEffect(() => {
        if (currentUser.role === 'patient') {
            const unseenAppointmentIds = appointments
                .filter(a => a.patientId === currentUser.id && !a.patientHasSeen)
                .map(a => a.id);

            if (unseenAppointmentIds.length > 0) {
                // 1. Update the backend to persist the "seen" status.
                apiFetch('/appointments/seen', { method: 'PUT' }).catch(console.error);

                // 2. Optimistically update the local state for an immediate UI response.
                setAppointments(prev => prev.map(a => 
                    unseenAppointmentIds.includes(a.id) ? { ...a, patientHasSeen: true } : a
                ));
            }
        }
    }, [currentUser.role, currentUser.id, appointments, setAppointments, apiFetch]);
    
    const userAppointments = useMemo(() => {
        if (currentUser.role === 'admin') {
            return appointments;
        }
        return appointments
            .filter(a => a.patientId === currentUser.id || a.psychiatristId === currentUser.id);
    }, [appointments, currentUser.id, currentUser.role]);

    const displayedAppointments = useMemo(() => {
        const filtered = userAppointments.filter(app => {
            if (activeTab === 'all') {
                return true;
            }
            return app.status === activeTab;
        });

        if (activeTab === 'scheduled') {
            // Sort ascending for scheduled (soonest first)
            return filtered.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        }

        // Sort descending for 'all', 'completed', and 'cancelled' (most recent first)
        return filtered.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    }, [userAppointments, activeTab]);
    
    const patientsForPsychiatrist = useMemo(() => {
        if (currentUser.role !== 'psychiatrist') return [];
        const patientIds = new Set(
            conversations
                .filter(c => c.participantIds.includes(currentUser.id))
                .map(c => c.participantIds.find(id => id !== currentUser.id))
        );
        return users.filter(u => u.role === 'patient' && patientIds.has(u.id));
    }, [currentUser, conversations, users]);

    const handleAddAppointment = async (newAppointmentData: Omit<Appointment, 'id'>) => {
        const payload = {
            patientId: newAppointmentData.patientId,
            date: newAppointmentData.date,
            time: newAppointmentData.time,
            notes: newAppointmentData.notes,
        };
        try {
            const newAppointmentFromServer = await apiFetch('/appointments', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setAppointments(prev => [...prev, formatAppointmentFromServer(newAppointmentFromServer)]);
            setIsModalOpen(false); // Close modal on success
        } catch (error) {
            console.error("Failed to schedule appointment:", error);
            throw error; // Re-throw to be caught by the modal
        }
    };

    const handleCancelClick = (appointment: Appointment) => {
        setAppointmentToCancel(appointment);
    };
    
    const handleCompleteClick = (appointment: Appointment) => {
        setAppointmentToComplete(appointment);
    };

    const confirmCancel = async () => {
        if (!appointmentToCancel) return;
        try {
            const cancelledAppointmentFromServer = await apiFetch(`/appointments/${appointmentToCancel.id}/cancel`, {
                method: 'PUT',
            });
            const formattedAppointment = formatAppointmentFromServer(cancelledAppointmentFromServer);
            setAppointments(prev => prev.map(a => 
                a.id === appointmentToCancel.id ? formattedAppointment : a
            ));
            setAppointmentToCancel(null);
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            setAppointmentToCancel(null);
        }
    };

    const confirmComplete = async () => {
        if (!appointmentToComplete) return;
        try {
            const completedAppointmentFromServer = await apiFetch(`/appointments/${appointmentToComplete.id}/complete`, {
                method: 'PUT',
            });
            const formattedAppointment = formatAppointmentFromServer(completedAppointmentFromServer);
            setAppointments(prev => prev.map(a =>
                a.id === appointmentToComplete.id ? formattedAppointment : a
            ));
            setAppointmentToComplete(null);
        } catch (error) {
            console.error("Failed to complete appointment:", error);
            setAppointmentToComplete(null);
        }
    };

    const handleViewProfile = (userId: string) => {
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) setViewingUser(foundUser);
    };

    const getUserNameById = (id: string) => users.find(u => u.id === id)?.username || 'Unknown User';

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Appointments</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {currentUser.role === 'psychiatrist' ? 'Manage your scheduled appointments.' : currentUser.role === 'admin' ? 'View all appointments in the system.' : 'View your appointments.'}
                    </p>
                </div>
                {currentUser.role === 'psychiatrist' && (
                     <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                    >
                        <PlusIcon /> Schedule Appointment
                    </button>
                )}
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('scheduled')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'scheduled' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Scheduled
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Completed
                    </button>
                    <button onClick={() => setActiveTab('cancelled')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cancelled' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Cancelled
                    </button>
                     <button onClick={() => setActiveTab('all')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        All
                    </button>
                </nav>
            </div>
            
            <div className="flex-grow">
                {displayedAppointments.length > 0 ? (
                    <ul className="space-y-4">
                        {displayedAppointments.map(app => {
                            const appointmentDate = new Date(`${app.date}T${app.time}`);
                            
                            let canCancel = false;
                            if (app.status === 'scheduled') {
                                if (currentUser.role === 'psychiatrist' || currentUser.role === 'admin') {
                                    canCancel = true; 
                                } else if (currentUser.role === 'patient') {
                                    canCancel = appointmentDate > new Date();
                                }
                            }
                            
                            const canComplete = currentUser.role === 'psychiatrist' && app.status === 'scheduled' && appointmentDate < new Date();

                            return (
                                <li key={app.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center w-16 flex-shrink-0">
                                            <p className="text-sm text-red-500 font-semibold">{appointmentDate.toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{appointmentDate.getDate()}</p>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white">
                                                {currentUser.role === 'admin' ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        <span>Patient:</span>
                                                        <button 
                                                            onClick={() => handleViewProfile(app.patientId)} 
                                                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors focus:outline-none"
                                                        >
                                                            {getUserNameById(app.patientId)}
                                                        </button>
                                                        <span>with</span>
                                                        <button 
                                                            onClick={() => handleViewProfile(app.psychiatristId)} 
                                                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors focus:outline-none"
                                                        >
                                                            {getUserNameById(app.psychiatristId)}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        <span>Appointment with</span>
                                                        <button 
                                                            onClick={() => handleViewProfile(currentUser.role === 'patient' ? app.psychiatristId : app.patientId)} 
                                                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors focus:outline-none"
                                                        >
                                                            {getUserNameById(currentUser.role === 'patient' ? app.psychiatristId : app.patientId)}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {appointmentDate.toLocaleDateString('en-US', { weekday: 'long' })} at {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </p>
                                             {app.notes && <p className="text-xs italic text-gray-500 mt-1">Note: {app.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                            app.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                            app.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            app.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {app.status}
                                        </span>
                                        {canCancel && (
                                            <button onClick={() => handleCancelClick(app)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500" title="Cancel Appointment">
                                                <TrashIcon />
                                            </button>
                                        )}
                                        {canComplete && (
                                            <button onClick={() => handleCompleteClick(app)} className="p-2 rounded-md text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-500" title="Mark as Completed">
                                                <CheckCircleIcon />
                                            </button>
                                        )}
                                        {app.status === 'completed' && currentUser.role === 'patient' && (
                                            <button 
                                                onClick={() => setFeedbackAppointment(app)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors text-sm font-medium"
                                            >
                                                <StarIcon className="h-4 w-4" /> Rate Session
                                            </button>
                                        )}
                                        {app.status === 'completed' && currentUser.role === 'psychiatrist' && (
                                            <button 
                                                onClick={() => setEngagementFeedbackAppointment(app)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium"
                                            >
                                                <PencilIcon className="h-4 w-4" /> Engagement Feedback
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center text-gray-500 dark:text-gray-400">
                         <CalendarIcon />
                         <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No {activeTab} appointments</h3>
                         <p className="mt-1 text-sm">
                            {currentUser.role === 'psychiatrist' && activeTab === 'scheduled' 
                                ? "Click 'Schedule Appointment' to create a new one." 
                                : `You have no ${activeTab} appointments.`
                            }
                        </p>
                    </div>
                )}
            </div>

            <UserProfileModal 
                user={viewingUser}
                onClose={() => setViewingUser(null)}
            />

            {currentUser.role === 'psychiatrist' && (
                 <AddAppointmentModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddAppointment={handleAddAppointment}
                    psychiatristId={currentUser.id}
                    patients={patientsForPsychiatrist}
                 />
            )}
            
            <ConfirmationDialog
                isOpen={!!appointmentToCancel}
                onClose={() => setAppointmentToCancel(null)}
                onConfirm={confirmCancel}
                title="Cancel Appointment"
                confirmText="Yes, Cancel"
            >
                Are you sure you want to cancel this appointment? This action cannot be undone.
            </ConfirmationDialog>
            <ConfirmationDialog
                isOpen={!!appointmentToComplete}
                onClose={() => setAppointmentToComplete(null)}
                onConfirm={confirmComplete}
                title="Complete Appointment"
                confirmText="Yes, Complete"
            >
                Are you sure you want to mark this appointment as completed?
            </ConfirmationDialog>

            {feedbackAppointment && (
                <FeedbackForm
                    type="appointment"
                    appointmentId={feedbackAppointment.id}
                    targetId={feedbackAppointment.psychiatristId}
                    title="Rate your session"
                    onClose={() => setFeedbackAppointment(null)}
                    apiFetch={apiFetch}
                    onSubmit={() => {
                        // Optionally show a success toast
                    }}
                />
            )}

            {engagementFeedbackAppointment && (
                <FeedbackForm
                    type="psychiatrist"
                    appointmentId={engagementFeedbackAppointment.id}
                    targetId={engagementFeedbackAppointment.patientId}
                    title="Patient Engagement Feedback"
                    onClose={() => setEngagementFeedbackAppointment(null)}
                    apiFetch={apiFetch}
                    onSubmit={() => {
                        // Optionally show a success toast
                    }}
                />
            )}
        </div>
    );
};

export default AppointmentsView;