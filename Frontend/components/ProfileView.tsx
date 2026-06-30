import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { validateEmail, validateUsername } from '../utils/validation';
import { calculatePasswordStrength } from '../utils/password';
import { EyeIcon, EyeSlashIcon } from './Icons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import PasswordRequirements from './PasswordRequirements';
import ConfirmationDialog from './ConfirmationDialog';

interface ProfileViewProps {
  currentUser: User;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, users, onUpdateUser, apiFetch }) => {
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    age: currentUser.age || '',
    emergency_contact: currentUser.emergency_contact || '',
    mental_health_goals: currentUser.mental_health_goals || '',
    background_details: currentUser.background_details || '',
    qualifications: currentUser.qualifications || '',
    specialization: currentUser.specialization || '',
    registration_number: currentUser.registration_number || '',
    clinic_details: currentUser.clinic_details || '',
    experience: currentUser.experience || '',
  });
  const [availability, setAvailability] = useState<any[]>(currentUser.availability || []);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  const handleCloseDeletionModal = useCallback(() => {
    setIsDeletionModalOpen(false);
  }, []);


  useEffect(() => {
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      age: currentUser.age || '',
      emergency_contact: currentUser.emergency_contact || '',
      mental_health_goals: currentUser.mental_health_goals || '',
      background_details: currentUser.background_details || '',
      qualifications: currentUser.qualifications || '',
      specialization: currentUser.specialization || '',
      registration_number: currentUser.registration_number || '',
      clinic_details: currentUser.clinic_details || '',
      experience: currentUser.experience || '',
    });
    setAvailability(currentUser.availability || []);
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const hasProfileChanges = 
        formData.username !== currentUser.username || 
        formData.email !== currentUser.email ||
        formData.age !== (currentUser.age || '') ||
        formData.emergency_contact !== (currentUser.emergency_contact || '') ||
        formData.mental_health_goals !== (currentUser.mental_health_goals || '') ||
        formData.background_details !== (currentUser.background_details || '') ||
        formData.qualifications !== (currentUser.qualifications || '') ||
        formData.specialization !== (currentUser.specialization || '') ||
        formData.registration_number !== (currentUser.registration_number || '') ||
        formData.clinic_details !== (currentUser.clinic_details || '') ||
        formData.experience !== (currentUser.experience || '');
    
    const hasAvailabilityChanges = JSON.stringify(availability) !== JSON.stringify(currentUser.availability || []);
    const hasPasswordChanges = passwordData.newPassword !== '';
    let payload: any = {};

    if (hasProfileChanges) {
        if (!validateUsername(formData.username)) {
            setError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.');
            return;
        }
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (users.some(u => u.id !== currentUser.id && u.username === formData.username)) {
            setError('This username is already taken.');
            return;
        }
        if (users.some(u => u.id !== currentUser.id && u.email === formData.email)) {
            setError('An account with this email already exists.');
            return;
        }
        payload = { ...formData };
        if (payload.age === '') delete payload.age;
        else payload.age = parseInt(payload.age as string);
    }
    
    if (hasAvailabilityChanges) {
        payload.availability = availability;
    }
    
    if (hasPasswordChanges) {
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        
        if (!currentPassword) {
            setError('Please enter your current password to change your password.');
            return;
        }
        if (!newPassword) {
            setError('New password cannot be empty.');
            return;
        }
        if (passwordStrength < 3) {
          setError('Please choose a stronger password that meets all requirements.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match.');
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
    }
    
    if (Object.keys(payload).length === 0) {
        return;
    }

    setIsLoading(true);
    try {
        const updatedUser = await apiFetch('/users/me', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        
        onUpdateUser(updatedUser);
        setSuccess('Profile updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength(0);
        setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
        const updatedUser = await apiFetch('/users/me/request-deletion', {
            method: 'POST',
            body: JSON.stringify({ reason: deletionReason }),
        });
        onUpdateUser(updatedUser);
        setSuccess('Your deletion request has been submitted.');
        setIsDeletionModalOpen(false);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };


  const profileChanged = 
    formData.username !== currentUser.username || 
    formData.email !== currentUser.email ||
    formData.age !== (currentUser.age || '') ||
    formData.emergency_contact !== (currentUser.emergency_contact || '') ||
    formData.mental_health_goals !== (currentUser.mental_health_goals || '') ||
    formData.background_details !== (currentUser.background_details || '') ||
    formData.qualifications !== (currentUser.qualifications || '') ||
    formData.specialization !== (currentUser.specialization || '') ||
    formData.registration_number !== (currentUser.registration_number || '') ||
    formData.clinic_details !== (currentUser.clinic_details || '') ||
    formData.experience !== (currentUser.experience || '');
  
  const availabilityChanged = JSON.stringify(availability) !== JSON.stringify(currentUser.availability || []);
  const passwordFieldsFilled = passwordData.newPassword !== '';
  const hasChanges = profileChanged || availabilityChanged || passwordFieldsFilled;

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateAvailabilitySlot = (index: number, field: string, value: string) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Profile Settings</h2>
        
        {error && <div role="alert" className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded-r-lg"><p>{error}</p></div>}
        {success && <div role="status" className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-4 rounded-r-lg"><p>{success}</p></div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {currentUser.role === 'patient' && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Wellness Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="mental_health_goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mental Health Goals</label>
                <textarea
                  name="mental_health_goals"
                  id="mental_health_goals"
                  value={formData.mental_health_goals}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="background_details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Details (Optional)</label>
                <textarea
                  name="background_details"
                  id="background_details"
                  value={formData.background_details}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentUser.role === 'psychiatrist' && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Professional Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qualifications</label>
                  <input
                    type="text"
                    name="qualifications"
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    id="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience (Years)</label>
                  <input
                    type="text"
                    name="experience"
                    id="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="clinic_details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Clinic Details</label>
                <textarea
                  name="clinic_details"
                  id="clinic_details"
                  value={formData.clinic_details}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Availability Settings</h3>
                  <button
                    type="button"
                    onClick={addAvailabilitySlot}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    + Add Slot
                  </button>
                </div>
                <div className="space-y-4">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <select
                        value={slot.day}
                        onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-red-500 hover:text-red-600 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {availability.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No availability slots set.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Change Password</h3>
            <div className="space-y-4">
                 <div>
                    <label htmlFor="currentPassword"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <div className="relative mt-1">
                        <input id="currentPassword" name="currentPassword" type={isCurrentPasswordVisible ? 'text' : 'password'} value={passwordData.currentPassword} onChange={handlePasswordInputChange} placeholder="Enter current password to change" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <button type="button" onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full" aria-label={isCurrentPasswordVisible ? "Hide current password" : "Show current password"}>
                            {isCurrentPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
                 <div>
                    <label htmlFor="newPassword"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <div className="relative mt-1">
                        <input id="newPassword" name="newPassword" type={isNewPasswordVisible ? 'text' : 'password'} value={passwordData.newPassword} onChange={handlePasswordInputChange} placeholder="Enter new password" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <button type="button" onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full" aria-label={isNewPasswordVisible ? "Hide new password" : "Show new password"}>
                            {isNewPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                    {passwordData.newPassword && (
                        <>
                            <PasswordStrengthIndicator strength={passwordStrength} />
                            <PasswordRequirements password={passwordData.newPassword} />
                        </>
                    )}
                </div>
                <div>
                    <label htmlFor="confirmPassword"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <div className="relative mt-1">
                        <input id="confirmPassword" name="confirmPassword" type={isConfirmPasswordVisible ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={handlePasswordInputChange} placeholder="Confirm new password" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                        <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full" aria-label={isConfirmPasswordVisible ? "Hide confirm new password" : "Show confirm new password"}>
                            {isConfirmPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
              <button type="submit" disabled={!hasChanges || isLoading} className="w-40 flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                  {isLoading ? <span className="loading-skeleton-on-accent h-4 w-24 rounded" /> : 'Save Changes'}
              </button>
          </div>
        </form>

        <div className="pt-6 mt-6 border-t border-red-300 dark:border-red-900/50">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Delete Your Account</h3>
             {currentUser.deletion_requested_at ? (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm">
                    Your account deletion request was submitted on {new Date(currentUser.deletion_requested_at).toLocaleDateString()} and is pending review by an administrator.
                </div>
             ) : (
                <>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Requesting to delete your account will permanently remove all your data, including chat history, journal entries, and mood logs. This action cannot be undone. An administrator will review your request.
                    </p>
                    <div className="mt-4">
                        <button onClick={() => setIsDeletionModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Request Account Deletion
                        </button>
                    </div>
                </>
             )}
        </div>
      </div>
       <ConfirmationDialog
            isOpen={isDeletionModalOpen}
            onClose={handleCloseDeletionModal}
            onConfirm={handleRequestDeletion}
            title="Request Account Deletion"
            confirmText="Request Deletion"
        >
            <p className="mb-4">Are you sure you want to request the permanent deletion of your account? An administrator will review this request. This action cannot be undone.</p>
            <label htmlFor="deletion_reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason (Optional)</label>
            <textarea
                id="deletion_reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Why would you like to delete your account?"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
            />
        </ConfirmationDialog>
    </div>
  );
};

export default ProfileView;
