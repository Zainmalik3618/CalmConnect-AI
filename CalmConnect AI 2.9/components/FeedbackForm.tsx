
import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface FeedbackFormProps {
    type: 'appointment' | 'psychiatrist' | 'ai_support';
    appointmentId?: string;
    targetId?: string;
    onSubmit: (feedback: { rating: number; comment: string }) => void;
    onClose: () => void;
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
    title?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ type, appointmentId, targetId, onSubmit, onClose, apiFetch, title }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await apiFetch('/feedback', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    appointmentId,
                    targetId,
                    rating,
                    comment
                })
            });

            onSubmit({ rating, comment });
            onClose();
        } catch (err) {
            console.error('Error submitting feedback:', err);
            // alert is discouraged, but I'll leave it for now if it was there, 
            // actually I should use something else if possible, but let's stick to the request of fixing errors.
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {title || 'Share your feedback'}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                    Your feedback helps us improve our services.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <StarIcon
                                        className={`h-10 w-10 ${
                                            (hoverRating || rating) >= star
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-zinc-300 dark:text-zinc-700'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Comments (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us more about your experience..."
                            className="w-full h-32 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;