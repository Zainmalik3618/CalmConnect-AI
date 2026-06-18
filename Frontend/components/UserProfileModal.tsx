
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';
import { AwardIcon, BookOpenIcon, CognitiveDistortionsIcon, FlameIcon, SparklesIcon, SmileIcon, XIcon, ZapIcon } from './Icons';

interface UserProfileModalProps {
  user: User | null;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  useEffect(() => {
    if (user) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [user, onClose]);

  if (!user) return null;

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'psychiatrist': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'admin': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const className = "h-5 w-5";
    switch (iconName) {
      case 'book':
        return <BookOpenIcon className={className} />;
      case 'flame':
        return <FlameIcon className={className} />;
      case 'zap':
        return <ZapIcon className={className} />;
      case 'brain':
        return <CognitiveDistortionsIcon className={className} />;
      case 'smile':
        return <SmileIcon className={className} />;
      default:
        return <AwardIcon className={className} />;
    }
  };

  const InfoTile = ({ label, value, icon, fullWidth = false, isItalic = false }: { label: string, value: string | number, icon?: React.ReactNode, fullWidth?: boolean, isItalic?: boolean }) => (
    <div className={`surface-motion p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 ${fullWidth ? 'col-span-2' : 'col-span-1'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-gray-800 dark:text-gray-200 font-semibold leading-relaxed ${isItalic ? 'italic text-sm opacity-90' : 'text-base'}`}>
        {value}
      </div>
    </div>
  );

  const portalTarget = document.querySelector('.role-theme') ?? document.body;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        <motion.div 
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-slate-950/25 dark:border-gray-700 dark:bg-gray-900 sm:max-h-[calc(100dvh-3rem)]"
        >
          {/* Header Section */}
          <div
            className="relative h-28 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--role-primary, #2563eb), var(--role-accent, #0ea5e9))' }}
          >
            <button 
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="absolute right-4 top-4 z-30 rounded-xl border border-white/20 bg-white/10 p-2 text-white/90 shadow-sm backdrop-blur-md hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <XIcon className="h-5 w-5" />
            </button>
            
            {/* Avatar Overlap */}
            <div className="absolute -bottom-8 left-6 sm:left-8">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-gray-900 dark:bg-gray-900">
                <span className="select-none text-4xl font-bold leading-none text-blue-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6 pt-12 sm:px-8 sm:pb-8">
            <div className="mb-6">
              <h2 id="user-profile-title" className="mb-2 break-words text-2xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h2>
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <InfoTile label="Email Address" value={user.email} fullWidth />
              
              <div className="surface-motion col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block">Account Status</span>
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${user.status === 'blocked' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-gray-800 dark:text-gray-200 font-bold capitalize">
                    {user.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Patient Specific Details */}
              {user.role === 'patient' && (
                <>
                  <div className="surface-motion col-span-2 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Wellness Activity</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-blue-100 dark:border-blue-800">
                        <SparklesIcon className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{user.total_points || 0} Points</span>
                      </div>
                    </div>
                    
                    {user.earnedBadges && user.earnedBadges.length > 0 ? (
                      <div className="grid grid-cols-4 gap-3">
                        {user.earnedBadges.map((badge) => (
                          <div key={badge.id} className="group relative flex flex-col items-center">
                            <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-50 dark:border-blue-900/50 text-blue-500 transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                              {getBadgeIcon(badge.icon_name)}
                            </div>
                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center">
                              <p className="font-semibold mb-0.5">{badge.name}</p>
                              <p className="opacity-70 leading-tight">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-blue-400 dark:text-blue-500 italic font-medium">No badges earned yet.</p>
                    )}
                  </div>
                  {user.age && <InfoTile label="Age" value={`${user.age} years`} />}
                  {user.emergency_contact && <InfoTile label="Emergency" value={user.emergency_contact} />}
                  {user.mental_health_goals && (
                    <InfoTile label="Wellness Goals" value={user.mental_health_goals} fullWidth isItalic />
                  )}
                  {user.background_details && (
                    <InfoTile label="Background" value={user.background_details} fullWidth />
                  )}
                </>
              )}

              {/* Psychiatrist Specific Details */}
              {user.role === 'psychiatrist' && (
                <>
                  {user.qualifications && <InfoTile label="Qualifications" value={user.qualifications} fullWidth />}
                  {user.specialization && <InfoTile label="Specialization" value={user.specialization} />}
                  {user.experience && <InfoTile label="Experience" value={user.experience} />}
                  {user.registration_number && <InfoTile label="Registration" value={user.registration_number} fullWidth />}
                  {user.clinic_details && <InfoTile label="Clinic" value={user.clinic_details} fullWidth />}
                  
                  {user.availability && user.availability.length > 0 && (
                    <div className="surface-motion col-span-2 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                      <span className="text-xs font-semibold text-purple-400 dark:text-purple-500 uppercase tracking-wide mb-4 block">Weekly Availability</span>
                      <div className="grid grid-cols-1 gap-2">
                        {user.availability.map((slot, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-white/60 dark:bg-gray-800/40 p-3 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/5">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{slot.day}</span>
                            <span className="font-bold text-gray-600 dark:text-gray-400">{slot.startTime} — {slot.endTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {user.deletion_requested_at && (
                <div className="surface-motion col-span-2 p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Deletion Request</span>
                  </div>
                  <span className="text-red-900 dark:text-red-200 text-sm font-bold block">
                    Requested on {new Date(user.deletion_requested_at).toLocaleDateString()}
                  </span>
                  {user.deletion_request_reason && (
                    <p className="text-red-700 dark:text-red-400 text-xs italic mt-3 leading-relaxed opacity-80">
                      "{user.deletion_request_reason}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-700 dark:bg-gray-800/50 sm:px-8">
            <button 
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    portalTarget
  );
};

export default UserProfileModal;
