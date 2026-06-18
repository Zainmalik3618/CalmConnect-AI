import React, { useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Stethoscope,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AppNotification, Appointment, Conversation, User, View } from '../../types';

interface PsychiatristOverviewProps {
  currentUser: User;
  users: User[];
  appointments: Appointment[];
  conversations: Conversation[];
  notifications: AppNotification[];
  totalUnreadCount: number;
  setCurrentView: (view: View) => void;
}

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PsychiatristOverview: React.FC<PsychiatristOverviewProps> = ({
  currentUser,
  users,
  appointments,
  conversations,
  notifications,
  totalUnreadCount,
  setCurrentView,
}) => {
  const data = useMemo(() => {
    const now = new Date();
    const todayKey = formatDateKey(now);
    const ownAppointments = appointments.filter(item => item.psychiatristId === currentUser.id);
    const scheduled = ownAppointments.filter(item => item.status === 'scheduled');
    const completed = ownAppointments.filter(item => item.status === 'completed');
    const cancelled = ownAppointments.filter(item => item.status === 'cancelled');
    const today = scheduled
      .filter(item => item.date === todayKey)
      .sort((a, b) => a.time.localeCompare(b.time));
    const upcoming = scheduled
      .filter(item => new Date(`${item.date}T${item.time}`).getTime() >= now.getTime())
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    const patientIds = new Set<string>();
    ownAppointments.forEach(item => patientIds.add(item.patientId));
    conversations
      .filter(item => item.participantIds.includes(currentUser.id))
      .forEach(item => {
        const patientId = item.participantIds.find(id => id !== currentUser.id);
        if (patientId) patientIds.add(patientId);
      });

    const activePatients = users.filter(user => user.role === 'patient' && patientIds.has(user.id));
    const unreadNotifications = notifications.filter(item => !item.is_read).length;
    const completionRate = ownAppointments.length
      ? Math.round((completed.length / ownAppointments.length) * 100)
      : 0;

    const weekly = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() + index);
      const key = formatDateKey(date);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: scheduled.filter(item => item.date === key).length,
      };
    });

    return {
      ownAppointments,
      scheduled,
      completed,
      cancelled,
      today,
      upcoming,
      activePatients,
      unreadNotifications,
      completionRate,
      weekly,
    };
  }, [appointments, conversations, currentUser.id, notifications, users]);

  const getPatient = (id: string) => users.find(user => user.id === id);
  const nextAppointment = data.upcoming[0];
  const latestNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const metrics = [
    {
      label: "Today's sessions",
      value: data.today.length,
      detail: nextAppointment ? `Next at ${nextAppointment.time}` : 'No upcoming session today',
      icon: CalendarCheck,
      tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
    {
      label: 'Active patients',
      value: data.activePatients.length,
      detail: `${data.scheduled.length} scheduled appointments`,
      icon: Users,
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    },
    {
      label: 'Care completion',
      value: `${data.completionRate}%`,
      detail: `${data.completed.length} sessions completed`,
      icon: UserRoundCheck,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      label: 'Inbox attention',
      value: totalUnreadCount + data.unreadNotifications,
      detail: `${totalUnreadCount} messages · ${data.unreadNotifications} alerts`,
      icon: MessageCircle,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
              <Stethoscope className="h-4 w-4" />
              Clinical workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Welcome back, {currentUser.username}
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Review today&apos;s care schedule, patient activity, and communication priorities at a glance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCurrentView('appointments')} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
              Manage appointments
            </button>
            <button onClick={() => setCurrentView('messaging')} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              Open messages
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="surface-motion rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Seven-day outlook</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Scheduled care load</h2>
              </div>
              <button onClick={() => setCurrentView('appointments')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">
                Full calendar
              </button>
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.22)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(129,140,248,0.08)' }} contentStyle={{ borderRadius: 12, borderColor: 'rgba(148,163,184,0.25)' }} />
                  <Bar dataKey="appointments" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Daily agenda</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Today&apos;s sessions</h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {data.today.length} total
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {data.today.length > 0 ? data.today.slice(0, 5).map(appointment => {
                const patient = getPatient(appointment.patientId);
                return (
                  <button key={appointment.id} onClick={() => setCurrentView('appointments')} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20">
                    <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white font-bold text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-300">
                      {appointment.time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-gray-900 dark:text-white">{patient?.username || 'Patient'}</span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{appointment.notes || 'Scheduled consultation'}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </button>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 dark:text-gray-400">
                  <CalendarCheck className="h-9 w-9 text-indigo-400" />
                  <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">No sessions today</p>
                  <p className="mt-1 text-sm">Your schedule is clear.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Care network</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Active patients</h2>
              </div>
              <Users className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.activePatients.slice(0, 6).map(patient => {
                const patientAppointments = data.ownAppointments.filter(item => item.patientId === patient.id);
                const next = patientAppointments
                  .filter(item => item.status === 'scheduled' && new Date(`${item.date}T${item.time}`) >= new Date())
                  .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
                return (
                  <button key={patient.id} onClick={() => setCurrentView('messaging')} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {patient.username.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-gray-900 dark:text-white">{patient.username}</span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{patient.email}</span>
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {next ? `Next session ${new Date(`${next.date}T${next.time}`).toLocaleDateString()}` : `${patientAppointments.length} appointment records`}
                    </p>
                  </button>
                );
              })}
              {data.activePatients.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-gray-500 dark:text-gray-400">No connected patients yet.</p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Care signals</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Recent notifications</h2>
              </div>
              <button onClick={() => setCurrentView('notifications')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">View all</button>
            </div>
            <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-700">
              {latestNotifications.length > 0 ? latestNotifications.map(notification => (
                <div key={notification.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <span className={`mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${notification.is_read ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'}`}>
                    {notification.is_read ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{notification.title}</p>
                      <time className="whitespace-nowrap text-xs text-gray-400">{new Date(notification.created_at).toLocaleDateString()}</time>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                  </div>
                </div>
              )) : (
                <div className="py-14 text-center text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 font-semibold">You are all caught up</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Upcoming sessions', value: data.upcoming.length, detail: 'Scheduled from today onward', icon: Clock3 },
            { label: 'Conversation threads', value: conversations.filter(item => item.participantIds.includes(currentUser.id)).length, detail: `${totalUnreadCount} unread messages`, icon: MessageCircle },
            { label: 'Practice status', value: data.cancelled.length > data.completed.length ? 'Review' : 'On track', detail: `${data.cancelled.length} cancelled appointments`, icon: Activity },
          ].map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-indigo-50/40 p-5 dark:border-gray-700 dark:from-gray-800 dark:to-indigo-950/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400"><Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />{label}</div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PsychiatristOverview;
