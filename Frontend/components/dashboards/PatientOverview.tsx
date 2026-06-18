import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Leaf,
  MessageCircleHeart,
  PenLine,
  Sparkles,
  Wind,
} from 'lucide-react';
import type {
  Appointment,
  ChatSession,
  CompletedExerciseLog,
  Conversation,
  JournalEntry,
  MoodEntry,
  User,
  View,
} from '../../types';

interface PatientOverviewProps {
  currentUser: User;
  users: User[];
  appointments: Appointment[];
  conversations: Conversation[];
  chatSessions: ChatSession[];
  moodHistory: MoodEntry[];
  journalEntries: JournalEntry[];
  completedLogs: CompletedExerciseLog[];
  totalUnreadCount: number;
  setCurrentView: (view: View) => void;
}

const moodFaces = ['😔', '😟', '😐', '🙂', '😊'];

const PatientOverview: React.FC<PatientOverviewProps> = ({
  currentUser,
  users,
  appointments,
  conversations,
  chatSessions,
  moodHistory,
  journalEntries,
  completedLogs,
  totalUnreadCount,
  setCurrentView,
}) => {
  const data = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const recentMoods = [...moodHistory]
      .filter(entry => new Date(entry.date) >= weekStart)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const hasMoodToday = moodHistory.some(entry => new Date(entry.date).toDateString() === today);
    const latestMood = [...moodHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const averageMood = recentMoods.length
      ? recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length
      : null;

    const previousMoods = [...moodHistory]
      .filter(entry => {
        const date = new Date(entry.date);
        const previousStart = new Date(weekStart);
        previousStart.setDate(previousStart.getDate() - 7);
        return date >= previousStart && date < weekStart;
      });
    const previousAverage = previousMoods.length
      ? previousMoods.reduce((sum, entry) => sum + entry.mood, 0) / previousMoods.length
      : null;

    let moodReflection = 'A few check-ins will help you notice how your week is feeling.';
    if (averageMood !== null && previousAverage !== null) {
      const difference = averageMood - previousAverage;
      moodReflection = difference > 0.35
        ? 'Your recent check-ins feel a little lighter than last week.'
        : difference < -0.35
          ? 'This week seems a little heavier. Gentle support may help.'
          : 'Your mood has been fairly steady across recent check-ins.';
    } else if (averageMood !== null) {
      moodReflection = averageMood >= 4
        ? 'Your recent check-ins have leaned toward feeling positive.'
        : averageMood <= 2
          ? 'Your recent check-ins suggest you may need some extra gentleness.'
          : 'Your recent check-ins show a mixed, very human week.';
    }

    const nextAppointment = appointments
      .filter(item => item.patientId === currentUser.id && item.status === 'scheduled')
      .filter(item => new Date(`${item.date}T${item.time}`).getTime() >= now.getTime())
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];

    const latestJournal = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestChat = [...chatSessions].sort((a, b) => {
      const aDate = a.updated_at || a.createdAt;
      const bDate = b.updated_at || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];
    const exercisesThisWeek = completedLogs.filter(item => new Date(item.date) >= weekStart).length;
    const journalsThisWeek = journalEntries.filter(item => new Date(item.date) >= weekStart).length;
    const connectedConversation = conversations.find(item => item.participantIds.includes(currentUser.id));
    const professionalId = connectedConversation?.participantIds.find(id => id !== currentUser.id);
    const professional = users.find(user => user.id === professionalId);

    return {
      recentMoods,
      hasMoodToday,
      latestMood,
      moodReflection,
      nextAppointment,
      latestJournal,
      latestChat,
      exercisesThisWeek,
      journalsThisWeek,
      professional,
    };
  }, [appointments, chatSessions, completedLogs, conversations, currentUser.id, journalEntries, moodHistory, users]);

  const recommendation = !data.hasMoodToday
    ? {
        eyebrow: 'A gentle place to begin',
        title: 'How are you feeling today?',
        text: 'A quick check-in can help you pause, notice, and choose what support feels right.',
        action: 'Check in with your mood',
        view: 'mood' as View,
        icon: HeartHandshake,
      }
    : data.latestMood && data.latestMood.mood <= 2
      ? {
          eyebrow: 'Support for right now',
          title: 'You do not have to carry today alone.',
          text: 'Take a quiet moment with CalmConnect or reach out to someone you trust.',
          action: 'Talk to CalmConnect',
          view: 'chat' as View,
          icon: MessageCircleHeart,
        }
      : {
          eyebrow: 'Your next small step',
          title: 'Make a little room to breathe.',
          text: 'A short grounding or breathing practice can help you reconnect with the present moment.',
          action: 'Open wellness exercises',
          view: 'cbt' as View,
          icon: Wind,
        };

  const RecommendationIcon = recommendation.icon;

  const quickActions = [
    { label: 'Log mood', detail: 'Notice how you feel', icon: HeartHandshake, view: 'mood' as View, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300' },
    { label: 'Write journal', detail: 'Put thoughts into words', icon: PenLine, view: 'journal' as View, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300' },
    { label: 'Take a breath', detail: 'Try a calming exercise', icon: Wind, view: 'cbt' as View, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-300' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-[1450px] space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
              <Leaf className="h-4 w-4" />
              Your wellness space
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Hi, {currentUser.username}. How are you today?
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              There is no perfect way to feel. Start with the small step that feels manageable.
            </p>
          </div>
          {totalUnreadCount > 0 && (
            <button onClick={() => setCurrentView('messaging')} className="inline-flex items-center gap-2 self-start rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 shadow-sm hover:bg-teal-50 dark:border-teal-900 dark:bg-gray-800 dark:text-teal-300 dark:hover:bg-teal-950/30">
              <MessageCircleHeart className="h-4 w-4" />
              {totalUnreadCount} unread {totalUnreadCount === 1 ? 'message' : 'messages'}
            </button>
          )}
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-700 to-sky-700 p-7 text-white shadow-xl shadow-teal-900/10 sm:p-9">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <RecommendationIcon className="h-6 w-6" />
              </span>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-teal-100">{recommendation.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{recommendation.title}</h2>
              <p className="mt-4 max-w-xl leading-7 text-teal-50/85">{recommendation.text}</p>
              <button onClick={() => setCurrentView(recommendation.view)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-teal-800 shadow-lg hover:bg-teal-50">
                {recommendation.action}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -right-4 top-8 h-32 w-32 rounded-full border border-white/10" />
          </article>

          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Connected care</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Your next appointment</h2>
              </div>
              <CalendarDays className="h-6 w-6 text-teal-600 dark:text-teal-300" />
            </div>
            {data.nextAppointment ? (
              <div className="mt-6">
                <div className="flex items-center gap-4 rounded-2xl bg-sage-50 p-5 dark:bg-slate-900/50">
                  <div className="min-w-16 text-center">
                    <p className="text-xs font-bold uppercase text-teal-700 dark:text-teal-300">
                      {new Date(`${data.nextAppointment.date}T${data.nextAppointment.time}`).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {new Date(`${data.nextAppointment.date}T${data.nextAppointment.time}`).getDate()}
                    </p>
                  </div>
                  <div className="border-l border-sage-200 pl-4 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {new Date(`${data.nextAppointment.date}T${data.nextAppointment.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {users.find(user => user.id === data.nextAppointment?.psychiatristId)?.username || 'Your psychiatrist'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setCurrentView('appointments')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                  View appointment details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center rounded-2xl bg-sage-50 px-5 py-9 text-center dark:bg-slate-900/50">
                <CalendarDays className="h-8 w-8 text-sage-500 dark:text-sage-300" />
                <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">No upcoming appointment</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your care schedule is clear for now.</p>
              </div>
            )}
          </article>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Quick care tools</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">What would help right now?</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map(({ label, detail, icon: Icon, view, color }) => (
              <button key={label} onClick={() => setCurrentView(view)} className="surface-motion flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <span className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-gray-900 dark:text-white">{label}</span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">{detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">A gentle reflection</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Your last seven days</h2>
              </div>
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
            <div className="mt-6 flex min-h-20 items-end gap-2">
              {Array.from({ length: 7 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const entry = data.recentMoods.find(item => new Date(item.date).toDateString() === date.toDateString());
                return (
                  <div key={date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                    <div className={`flex h-11 w-full max-w-12 items-center justify-center rounded-xl ${entry ? 'bg-sage-100 text-lg dark:bg-sage-800' : 'border border-dashed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600'}`}>
                      {entry ? moodFaces[Math.max(0, Math.min(4, entry.mood - 1))] : '·'}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 rounded-2xl bg-sage-50 p-4 text-sm leading-6 text-sage-800 dark:bg-sage-900/30 dark:text-sage-200">
              {data.moodReflection}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xl font-bold text-gray-900 dark:text-white">{data.recentMoods.length}</p><p className="text-xs text-gray-500">check-ins</p></div>
              <div><p className="text-xl font-bold text-gray-900 dark:text-white">{data.journalsThisWeek}</p><p className="text-xs text-gray-500">journal entries</p></div>
              <div><p className="text-xl font-bold text-gray-900 dark:text-white">{data.exercisesThisWeek}</p><p className="text-xs text-gray-500">exercises</p></div>
            </div>
          </article>

          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Pick up gently</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Continue where you left off</h2>
            </div>
            <div className="mt-5 space-y-3">
              {data.latestChat && (
                <button onClick={() => setCurrentView('chat')} className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-teal-200 hover:bg-teal-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-teal-800 dark:hover:bg-teal-950/20">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"><MessageCircleHeart className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold text-gray-900 dark:text-white">{data.latestChat.title || 'Recent conversation'}</span><span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">Continue your conversation with CalmConnect</span></span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              )}
              {data.latestJournal && (
                <button onClick={() => setCurrentView('journal')} className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-amber-200 hover:bg-amber-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-amber-800 dark:hover:bg-amber-950/20">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"><BookHeart className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-bold text-gray-900 dark:text-white">Your recent reflection</span><span className="mt-1 block truncate text-sm text-gray-500 dark:text-gray-400">{data.latestJournal.content}</span></span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              )}
              {!data.latestChat && !data.latestJournal && (
                <div className="flex flex-col items-center rounded-2xl bg-sage-50 px-5 py-10 text-center dark:bg-slate-900/50">
                  <BookHeart className="h-8 w-8 text-sage-500" />
                  <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">Your space is ready when you are</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start a conversation or write a private reflection.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-3xl border border-teal-200/70 bg-teal-50/80 p-6 dark:border-teal-900/50 dark:bg-teal-950/20">
            <div className="flex gap-4">
              <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm dark:bg-gray-800 dark:text-teal-300">
                <HeartHandshake className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-teal-950 dark:text-teal-100">
                  {data.professional ? `${data.professional.username} is part of your support circle` : 'Support is always within reach'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-teal-800/80 dark:text-teal-200/70">
                  {data.professional ? 'You can send a private message whenever you need to share an update or ask a care question.' : 'Use direct messages to connect with a care professional when one becomes available.'}
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setCurrentView('messaging')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
            Open messages
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <aside className="rounded-2xl border border-red-200/70 bg-red-50/70 px-5 py-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p>
              CalmConnect is not an emergency service. If you or someone else may be in immediate danger, call
              <a href="tel:1122" className="mx-1 font-bold underline">1122</a>
              or <a href="tel:15" className="font-bold underline">15</a> in Pakistan, or contact local emergency services.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientOverview;
