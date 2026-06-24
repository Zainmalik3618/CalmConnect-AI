import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  LineChart,
  MessageCircleHeart,
  PenLine,
  Sparkles,
  Target,
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
  setMoodHistory: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
  journalEntries: JournalEntry[];
  completedLogs: CompletedExerciseLog[];
  totalUnreadCount: number;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  setCurrentView: (view: View) => void;
}

const moodOptions = [
  { label: 'Great', level: 5, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900' },
  { label: 'Good', level: 4, tone: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900' },
  { label: 'Okay', level: 3, tone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900' },
  { label: 'Anxious', level: 2, tone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900' },
  { label: 'Sad', level: 1, tone: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900' },
];

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getMoodLabel = (level?: number) => moodOptions.find(option => option.level === level)?.label || 'Not checked in';

const PatientOverview: React.FC<PatientOverviewProps> = ({
  currentUser,
  users,
  appointments,
  conversations,
  chatSessions,
  moodHistory,
  setMoodHistory,
  journalEntries,
  completedLogs,
  totalUnreadCount,
  apiFetch,
  setCurrentView,
}) => {
  const [checkInMessage, setCheckInMessage] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);

  const data = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);

    const moodsByDateDesc = [...moodHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const todayMood = moodsByDateDesc.find(entry => sameDay(new Date(entry.date), today));
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayMood = moodsByDateDesc.find(entry => sameDay(new Date(entry.date), yesterday));

    const moodsThisWeek = moodHistory.filter(entry => new Date(entry.date) >= weekStart);
    const moodsLastWeek = moodHistory.filter(entry => {
      const date = new Date(entry.date);
      return date >= previousWeekStart && date < weekStart;
    });
    const avgThisWeek = moodsThisWeek.length ? moodsThisWeek.reduce((sum, entry) => sum + entry.mood, 0) / moodsThisWeek.length : null;
    const avgLastWeek = moodsLastWeek.length ? moodsLastWeek.reduce((sum, entry) => sum + entry.mood, 0) / moodsLastWeek.length : null;

    const journalsThisWeek = journalEntries.filter(entry => new Date(entry.date) >= weekStart);
    const chatsThisWeek = chatSessions.filter(session => new Date(session.updated_at || session.createdAt) >= weekStart);
    const exercisesThisWeek = completedLogs.filter(log => new Date(log.date) >= weekStart);

    const latestJournal = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const latestChat = [...chatSessions].sort((a, b) => new Date(b.updated_at || b.createdAt).getTime() - new Date(a.updated_at || a.createdAt).getTime())[0];

    const upcomingAppointment = appointments
      .filter(item => item.patientId === currentUser.id && item.status === 'scheduled')
      .filter(item => new Date(`${item.date}T${item.time}`).getTime() >= now.getTime())
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];

    const anxietyCount = moodsThisWeek.filter(entry => entry.mood === 2).length;
    const daysSinceJournal = latestJournal
      ? Math.floor((today.getTime() - startOfDay(new Date(latestJournal.date)).getTime()) / 86400000)
      : null;

    let insight = 'A few check-ins will help CalmConnect notice your patterns over time.';
    if (anxietyCount >= 2) {
      insight = `You reported anxiety ${anxietyCount} times this week. A short grounding exercise may help today.`;
    } else if (avgThisWeek !== null && avgLastWeek !== null && avgThisWeek - avgLastWeek >= 0.35) {
      insight = 'Your average mood improved compared to last week.';
    } else if (avgThisWeek !== null && avgLastWeek !== null && avgLastWeek - avgThisWeek >= 0.35) {
      insight = 'Your average mood is lower than last week. Consider a gentle check-in or CBT exercise.';
    } else if (daysSinceJournal !== null && daysSinceJournal >= 5) {
      insight = `You have not written a journal entry in ${daysSinceJournal} days.`;
    } else if (journalsThisWeek.length >= 2 && avgThisWeek !== null && avgThisWeek >= 3.5) {
      insight = 'Journaling appears to be part of a steadier week for you.';
    } else if (moodsThisWeek.length > 0) {
      insight = `You checked in ${moodsThisWeek.length} ${moodsThisWeek.length === 1 ? 'time' : 'times'} this week. CalmConnect is building a clearer picture with you.`;
    }

    const uniqueMoodDays = new Set(moodHistory.map(entry => startOfDay(new Date(entry.date)).toDateString()));
    let moodStreak = 0;
    const cursor = new Date(today);
    while (uniqueMoodDays.has(cursor.toDateString())) {
      moodStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const lastActivityDate = [latestJournal?.date, latestChat?.updated_at || latestChat?.createdAt, moodsByDateDesc[0]?.date, completedLogs[completedLogs.length - 1]?.date]
      .filter(Boolean)
      .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0] as string | undefined;

    return {
      todayMood,
      yesterdayMood,
      insight,
      latestChat,
      latestJournal,
      upcomingAppointment,
      journalsThisWeek: journalsThisWeek.length,
      chatsThisWeek: chatsThisWeek.length,
      exercisesThisWeek: exercisesThisWeek.length,
      moodStreak,
      lastActivityDate,
    };
  }, [appointments, chatSessions, completedLogs, currentUser.id, journalEntries, moodHistory]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const handleMoodCheckIn = async (level: number) => {
    if (data.todayMood || isSavingMood) return;
    setIsSavingMood(true);
    setCheckInMessage('');
    try {
      const newEntry = await apiFetch('/mood', {
        method: 'POST',
        body: JSON.stringify({ mood: level, notes: 'Daily dashboard check-in' }),
      });
      setMoodHistory(prev => [...prev, newEntry]);
      setCheckInMessage('Thank you for checking in.');
    } catch (error) {
      console.error('Failed to save daily check-in:', error);
      setCheckInMessage('Could not save your check-in. Please try again.');
    } finally {
      setIsSavingMood(false);
    }
  };

  const suggestedActions = useMemo(() => {
    const actions = [
      !data.todayMood && {
        label: "Record Today's Mood",
        detail: 'Start with a quick check-in',
        view: 'mood' as View,
        icon: HeartHandshake,
      },
      data.latestChat && {
        label: 'Continue Last Chat',
        detail: data.latestChat.title || 'Return to your conversation',
        view: 'chat' as View,
        icon: MessageCircleHeart,
      },
      {
        label: 'Write Journal Entry',
        detail: data.latestJournal ? 'Reflect on what changed today' : 'Start your first private reflection',
        view: 'journal' as View,
        icon: PenLine,
      },
      {
        label: 'Start CBT Exercise',
        detail: 'Practice a short calming tool',
        view: 'cbt' as View,
        icon: Wind,
      },
      data.upcomingAppointment && {
        label: 'View Upcoming Appointment',
        detail: new Date(`${data.upcomingAppointment.date}T${data.upcomingAppointment.time}`).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        view: 'appointments' as View,
        icon: CalendarDays,
      },
    ].filter(Boolean) as Array<{ label: string; detail: string; view: View; icon: typeof HeartHandshake }>;

    return actions.slice(0, 3);
  }, [data.latestChat, data.latestJournal, data.todayMood, data.upcomingAppointment]);

  const lastActivityText = data.lastActivityDate
    ? `Last activity ${new Date(data.lastActivityDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
    : 'Your first activity is waiting when you are ready';

  const psychiatristName = data.upcomingAppointment
    ? users.find(user => user.id === data.upcomingAppointment?.psychiatristId)?.username || 'your psychiatrist'
    : null;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-[1450px] space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl bg-gradient-to-br from-teal-700 via-sky-700 to-indigo-700 p-7 text-white shadow-xl shadow-teal-900/10 sm:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-100">{greeting}, {currentUser.username}</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Welcome back to your wellness journey.</h1>
                <p className="mt-4 max-w-2xl leading-7 text-teal-50/90">
                  You {data.yesterdayMood ? `checked in feeling "${getMoodLabel(data.yesterdayMood.mood)}" yesterday` : 'have a quiet space ready today'}.
                  {' '}You wrote {data.journalsThisWeek} {data.journalsThisWeek === 1 ? 'journal entry' : 'journal entries'} this week.
                </p>
              </div>
              <button onClick={() => setCurrentView(data.latestChat ? 'chat' : 'mood')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-teal-800 shadow-lg hover:bg-teal-50">
                Continue Your Wellness Journey
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-semibold text-teal-100">Current mood</p>
                <p className="mt-2 text-xl font-bold">{getMoodLabel(data.todayMood?.mood)}</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-semibold text-teal-100">Recent activity</p>
                <p className="mt-2 text-xl font-bold">{lastActivityText}</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-semibold text-teal-100">Care connection</p>
                <p className="mt-2 text-xl font-bold">{psychiatristName ? `Next with ${psychiatristName}` : 'No appointment yet'}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{greeting}, {currentUser.username}</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">How are you feeling today?</h2>
              </div>
              <HeartHandshake className="h-6 w-6 text-teal-600 dark:text-teal-300" />
            </div>
            {data.todayMood ? (
              <div className="mt-6 rounded-2xl bg-teal-50 p-5 text-teal-900 dark:bg-teal-950/30 dark:text-teal-100">
                <p className="text-sm font-semibold">Today&apos;s check-in</p>
                <p className="mt-2 text-2xl font-bold">{getMoodLabel(data.todayMood.mood)}</p>
                <p className="mt-1 text-sm text-teal-700 dark:text-teal-200">Thank you for checking in.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-2">
                  {moodOptions.map(option => (
                    <button
                      key={option.label}
                      onClick={() => handleMoodCheckIn(option.level)}
                      disabled={isSavingMood}
                      className={`rounded-2xl border px-3 py-4 text-center text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${option.tone}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {checkInMessage && <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-700 dark:bg-gray-900/50 dark:text-gray-200">{checkInMessage}</p>}
              </>
            )}
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Personalized insight</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">CalmConnect noticed</h2>
              </div>
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
            <p className="mt-6 rounded-2xl bg-amber-50 p-5 leading-7 text-amber-900 dark:bg-amber-950/25 dark:text-amber-100">{data.insight}</p>
          </article>

          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Suggested actions</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">What should you do next?</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {suggestedActions.map(({ label, detail, view, icon: Icon }) => (
                <button key={label} onClick={() => setCurrentView(view)} className="surface-motion flex min-h-32 flex-col items-start justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-teal-200 hover:bg-teal-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-teal-800 dark:hover:bg-teal-950/20">
                  <Icon className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                  <span>
                    <span className="block font-bold text-gray-900 dark:text-white">{label}</span>
                    <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">{detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <ProgressTile icon={Target} label="Mood streak" value={`${data.moodStreak} ${data.moodStreak === 1 ? 'day' : 'days'}`} />
          <ProgressTile icon={BookHeart} label="Journal entries this week" value={data.journalsThisWeek.toString()} />
          <ProgressTile icon={MessageCircleHeart} label="Chat sessions this week" value={data.chatsThisWeek.toString()} />
          <ProgressTile icon={Wind} label="CBT exercises completed" value={data.exercisesThisWeek.toString()} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Progress snapshot</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Your recent rhythm</h2>
              </div>
              <LineChart className="h-6 w-6 text-sky-600 dark:text-sky-300" />
            </div>
            <p className="mt-5 text-gray-600 dark:text-gray-300">
              You checked in {data.moodStreak > 0 ? `for ${data.moodStreak} ${data.moodStreak === 1 ? 'day' : 'days'} in a row` : 'when you were ready'} and used {data.journalsThisWeek + data.chatsThisWeek + data.exercisesThisWeek} support tools this week.
            </p>
          </article>

          <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Care continuity</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Stay connected</h2>
            </div>
            {totalUnreadCount > 0 ? (
              <button onClick={() => setCurrentView('messaging')} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-teal-50 p-5 text-left text-teal-900 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-100 dark:hover:bg-teal-950/50">
                <span className="font-bold">{totalUnreadCount} unread {totalUnreadCount === 1 ? 'message' : 'messages'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="mt-5 rounded-2xl bg-gray-50 p-5 text-gray-600 dark:bg-gray-900/50 dark:text-gray-300">No unread care messages right now. Your support space is still here whenever you need it.</p>
            )}
          </article>
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

interface ProgressTileProps {
  icon: typeof Target;
  label: string;
  value: string;
}

const ProgressTile: React.FC<ProgressTileProps> = ({ icon: Icon, label, value }) => (
  <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  </article>
);

export default PatientOverview;
