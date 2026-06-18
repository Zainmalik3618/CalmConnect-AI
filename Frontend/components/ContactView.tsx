import React from 'react';
import { BriefcaseBusiness, Code2, ExternalLink, Globe2, Mail, MapPin, MessageSquareText } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface ContactViewProps {
  theme: Theme;
  toggleTheme: () => void;
}

const contacts = [
  { icon: Mail, label: 'Gmail', value: 'zainmalik3618@gmail.com', description: 'Project questions, collaboration, and general enquiries.', href: 'mailto:zainmalik3618@gmail.com' },
  { icon: Code2, label: 'GitHub', value: '@Zainmalik3618', description: 'Source code, projects, and ongoing development work.', href: 'https://github.com/Zainmalik3618' },
  { icon: BriefcaseBusiness, label: 'LinkedIn', value: 'Zain Malik', description: 'Professional connection and development updates.', href: 'https://www.linkedin.com/in/zainmalik3618/' },
  { icon: Globe2, label: 'Portfolio', value: 'View my work', description: 'My profile, skills, and selected software projects.', href: 'https://my-portfolio-six-alpha-75.vercel.app/' },
];

const ContactView: React.FC<ContactViewProps> = ({ theme, toggleTheme }) => (
  <div className="public-auth-theme min-h-screen bg-[#f4f7f5] text-slate-900 dark:bg-[#071311] dark:text-slate-100">
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(129,198,200,0.22),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(132,152,104,0.16),transparent_30%)] dark:bg-[radial-gradient(circle_at_8%_12%,rgba(45,212,191,0.1),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(132,152,104,0.08),transparent_30%)]" />
    <PublicHeader theme={theme} toggleTheme={toggleTheme} currentPage="contact" />

    <main className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="grid overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_32px_90px_-42px_rgba(15,56,51,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/50 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-h-[340px] overflow-hidden bg-[#d8d1c4] lg:min-h-[580px]">
          <img src="/signin.jpg" alt="A CalmConnect user in a calm wellness workspace" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[48%_center]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102f2d]/90 via-transparent to-transparent" />
          <p className="absolute inset-x-0 bottom-0 max-w-xl p-7 text-xl font-semibold leading-snug text-white sm:p-10 sm:text-2xl">
            Good products begin with listening. I would be glad to hear from you.
          </p>
        </div>
        <div className="flex items-center bg-[linear-gradient(155deg,rgba(255,255,255,0.98),rgba(244,247,245,0.92))] p-7 dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.98),rgba(11,31,28,0.96))] sm:p-10 lg:p-14">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Contact the developer</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Let&apos;s connect.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Have a question about CalmConnect AI, found an issue, or want to discuss a project? Choose the channel that works best for you.
            </p>
            <a href="mailto:zainmalik3618@gmail.com?subject=CalmConnect%20AI%20Enquiry" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Mail className="h-5 w-5" aria-hidden="true" />
              Send an email
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_24px_70px_-48px_rgba(15,56,51,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 sm:p-8 lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Find me online</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Choose a way to get in touch</h2>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 dark:border-slate-700 dark:bg-slate-700 sm:grid-cols-2">
          {contacts.map(({ icon: Icon, label, value, description, href }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="group bg-white/95 p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:bg-slate-900/95 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                  <Icon aria-hidden="true" />
                </span>
                <ExternalLink className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-300" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{label}</p>
              <h3 className="mt-2 break-words text-xl font-semibold text-slate-950 dark:text-white">{value}</h3>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 grid overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-8 sm:p-10">
          <MessageSquareText className="h-9 w-9 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-semibold text-slate-950 dark:text-white">Help me understand what you need</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
            Include a short subject and any useful context, screenshots, or repository links. I am happy to hear about CalmConnect feedback, software collaboration, and web development opportunities.
          </p>
        </div>
        <div className="flex flex-col justify-center border-t border-slate-200 bg-[#0f514c] p-8 text-white sm:p-10 lg:border-l lg:border-t-0 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-teal-200" aria-hidden="true" />
            <span className="font-semibold">Pakistan · Available online</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-teal-50/75">
            For medical or mental health emergencies, contact local emergency services. This page is for product and professional enquiries only.
          </p>
        </div>
      </section>
    </main>
    <PublicFooter />
  </div>
);

export default ContactView;
