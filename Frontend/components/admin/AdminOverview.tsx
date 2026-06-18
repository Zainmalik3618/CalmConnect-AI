import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AppNotification, Appointment, Conversation, User, View } from '../../types';

interface AdminOverviewProps {
  currentUser: User;
  users: User[];
  appointments: Appointment[];
  conversations: Conversation[];
  notifications: AppNotification[];
  setCurrentView: (view: View) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  currentUser,
  users,
  appointments,
  conversations,
  notifications,
  setCurrentView,
}) => {
  const analytics = useMemo(() => {
    const managedUsers = users.filter(user => user.id !== currentUser.id);
    const patients = managedUsers.filter(user => user.role === 'patient').length;
    const psychiatrists = managedUsers.filter(user => user.role === 'psychiatrist').length;
    const blocked = managedUsers.filter(user => user.status === 'blocked').length;
    const deletionRequests = managedUsers.filter(user => user.deletion_requested_at).length;
    const scheduled = appointments.filter(item => item.status === 'scheduled').length;
    const completed = appointments.filter(item => item.status === 'completed').length;
    const cancelled = appointments.filter(item => item.status === 'cancelled').length;
    const unreadNotifications = notifications.filter(item => !item.is_read).length;
    const totalMessages = conversations.reduce((total, conversation) => total + conversation.messages.length, 0);
    const activeRate = managedUsers.length
      ? Math.round(((managedUsers.length - blocked) / managedUsers.length) * 100)
      : 100;

    return {
      managedUsers,
      patients,
      psychiatrists,
      blocked,
      deletionRequests,
      scheduled,
      completed,
      cancelled,
      unreadNotifications,
      totalMessages,
      activeRate,
    };
  }, [appointments, conversations, currentUser.id, notifications, users]);

  const roleData = [
    { name: 'Patients', value: analytics.patients, color: '#0f4c81' },
    { name: 'Psychiatrists', value: analytics.psychiatrists, color: '#0891b2' },
    { name: 'Administrators', value: users.filter(user => user.role === 'admin').length, color: '#64748b' },
  ];

  const appointmentData = [
    { name: 'Scheduled', value: analytics.scheduled, fill: '#0f4c81' },
    { name: 'Completed', value: analytics.completed, fill: '#16a34a' },
    { name: 'Cancelled', value: analytics.cancelled, fill: '#e11d48' },
  ];

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const statCards = [
    { label: 'Managed users', value: analytics.managedUsers.length, detail: `${analytics.patients} patients · ${analytics.psychiatrists} psychiatrists`, icon: Users, tone: 'blue' },
    { label: 'Account health', value: `${analytics.activeRate}%`, detail: `${analytics.blocked} blocked accounts`, icon: UserCheck, tone: 'green' },
    { label: 'Scheduled care', value: analytics.scheduled, detail: `${analytics.completed} completed appointments`, icon: CalendarCheck, tone: 'cyan' },
    { label: 'Needs attention', value: analytics.deletionRequests + analytics.unreadNotifications, detail: `${analytics.deletionRequests} deletion · ${analytics.unreadNotifications} unread`, icon: ShieldAlert, tone: 'amber' },
  ];

  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  };

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
              <Activity className="h-4 w-4" />
              Platform command center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Administrative overview
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Monitor account health, care operations, communication volume, and items that require review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCurrentView('user-management')} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Manage users
            </button>
            <button onClick={() => setCurrentView('activity-logs')} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              View audit log
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className="surface-motion rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Care operations</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Appointment status</h2>
              </div>
              <button onClick={() => setCurrentView('appointments')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300">
                Open schedule
              </button>
            </div>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.22)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ borderRadius: 12, borderColor: 'rgba(148,163,184,0.25)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                    {appointmentData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Platform composition</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Users by role</h2>
            <div className="relative mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={4}>
                    {roleData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: 'rgba(148,163,184,0.25)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">accounts</span>
              </div>
            </div>
            <div className="space-y-3">
              {roleData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Operational queue</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Requires attention</h2>
              </div>
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Deletion requests', value: analytics.deletionRequests, view: 'user-management' as View, icon: Clock3 },
                { label: 'Blocked accounts', value: analytics.blocked, view: 'user-management' as View, icon: ShieldAlert },
                { label: 'Unread notifications', value: analytics.unreadNotifications, view: 'notifications' as View, icon: AlertTriangle },
                { label: 'Cancelled appointments', value: analytics.cancelled, view: 'appointments' as View, icon: CalendarCheck },
              ].map(({ label, value, view, icon: Icon }) => (
                <button key={label} onClick={() => setCurrentView(view)} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-blue-800 dark:hover:bg-blue-950/20">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300"><Icon className="h-4 w-4" /></span>
                  <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Latest signals</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Notification activity</h2>
              </div>
              <button onClick={() => setCurrentView('notifications')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300">View all</button>
            </div>
            <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-700">
              {recentNotifications.length > 0 ? recentNotifications.map(notification => (
                <div key={notification.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <span className={`mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${notification.is_read ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                    {notification.is_read ? <CheckCircle2 className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
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
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 font-semibold">No recent notifications</p>
                  <p className="mt-1 text-sm">The operational queue is clear.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Conversation threads', value: conversations.length, detail: `${analytics.totalMessages} messages recorded`, icon: MessageSquare },
            { label: 'Appointment completion', value: appointments.length ? `${Math.round((analytics.completed / appointments.length) * 100)}%` : '0%', detail: `${analytics.completed} of ${appointments.length} completed`, icon: CheckCircle2 },
            { label: 'System posture', value: analytics.deletionRequests + analytics.blocked === 0 ? 'Stable' : 'Review', detail: analytics.deletionRequests + analytics.blocked === 0 ? 'No account risks flagged' : 'Account actions are waiting', icon: Activity },
          ].map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50 p-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400"><Icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />{label}</div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
