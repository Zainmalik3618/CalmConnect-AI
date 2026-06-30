import React from 'react';
import { BrainCircuit, CalendarDays, HeartHandshake, LockKeyhole, MessageCircle, NotebookPen, ShieldCheck, Users } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface AboutViewProps {
  theme: Theme;
  toggleTheme: () => void;
}

const features = [
  { icon: BrainCircuit, title: 'AI-supported conversations', text: 'An empathetic companion for reflection, coping prompts, and practical self-care guidance.' },
  { icon: NotebookPen, title: 'Personal wellness tools', text: 'Mood history, private journaling, CBT thought records, mindfulness, and guided relaxation.' },
  { icon: CalendarDays, title: 'Coordinated care', text: 'Appointments, reminders, notifications, and clear workflows for patients and psychiatrists.' },
  { icon: MessageCircle, title: 'Human connection', text: 'Direct professional messaging and a community designed to make asking for support easier.' },
];

const roles = [
  { icon: Users, title: 'Patients', text: 'Track wellbeing, practice self-care, connect with professionals, and find community support.' },
  { icon: HeartHandshake, title: 'Psychiatrists', text: 'Coordinate appointments, understand patient context, and communicate directly.' },
  { icon: ShieldCheck, title: 'Administrators', text: 'Manage the platform, review feedback, and maintain a safe, dependable environment.' },
];

const AboutView: React.FC<AboutViewProps> = ({ theme, toggleTheme }) => (
  <div className="public-auth-theme min-h-screen bg-[#f4f7fb] text-slate-900 dark:bg-[#0b1120] dark:text-slate-100">
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(148,163,184,0.14),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(15,118,110,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_8%_12%,rgba(148,163,184,0.05),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(45,212,191,0.035),transparent_30%)]" />
    <PublicHeader theme={theme} toggleTheme={toggleTheme} currentPage="about" />

    <main className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="grid overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_32px_90px_-42px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/95 dark:shadow-black/50 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center bg-[linear-gradient(155deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-7 dark:bg-[linear-gradient(155deg,rgba(17,24,39,0.99),rgba(15,23,42,0.98))] sm:p-10 lg:p-14">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">About CalmConnect AI</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              A calmer bridge between self-care and connected care.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              CalmConnect brings reflection tools, responsible AI support, care coordination, and real human connection into one welcoming mental wellness workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Private by design', 'Human-centered', 'Built for continuity'].map(item => (
                <span key={item} className="rounded-full border border-teal-900/10 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 dark:border-teal-300/15 dark:bg-teal-950/40 dark:text-teal-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden bg-[#d8d1c4] lg:min-h-[620px]">
          <img src="/signup.jpg" alt="A welcoming conversation between a patient and mental health professional" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[center_38%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
          <p className="absolute inset-x-0 bottom-0 max-w-xl p-7 text-xl font-semibold leading-snug text-white sm:p-10 sm:text-2xl">
            Care works best when thoughtful technology strengthens the human relationship.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">One connected workspace</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Tools that support the whole care journey</h2>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 dark:border-slate-700 dark:bg-slate-700 md:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="bg-white/95 p-6 dark:bg-slate-900/95 sm:p-7">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                <Icon aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
        <div className="rounded-2xl bg-slate-900 p-8 text-white dark:bg-slate-950">
          <HeartHandshake className="h-9 w-9 text-teal-200" aria-hidden="true" />
          <h2 className="mt-6 text-3xl font-semibold">Designed around people, not dashboards.</h2>
          <p className="mt-4 leading-7 text-slate-300">
            CalmConnect helps people notice patterns, practice healthier responses, stay organized, and reach real support when it matters.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950/40">
              <Icon className="h-7 w-7 text-teal-700 dark:text-teal-300" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-px overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-200/80 shadow-sm dark:border-slate-700/70 dark:bg-slate-700 lg:grid-cols-2">
        <article className="bg-white/90 p-8 dark:bg-slate-900/90 sm:p-10">
          <LockKeyhole className="h-8 w-8 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">Privacy and responsible access</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
            Verification, authenticated sessions, and role-based experiences help keep personal wellness information connected to the right user.
          </p>
        </article>
        <article className="bg-white/90 p-8 dark:bg-slate-900/90 sm:p-10">
          <ShieldCheck className="h-8 w-8 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">An important boundary</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
            CalmConnect supports wellbeing and care organization. It does not diagnose conditions, replace qualified professionals, or provide emergency services.
          </p>
        </article>
      </section>

      <div className="mt-10 text-center">
        <a href="/" className="inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
          Explore CalmConnect
        </a>
      </div>
    </main>
    <PublicFooter />
  </div>
);

export default AboutView;
