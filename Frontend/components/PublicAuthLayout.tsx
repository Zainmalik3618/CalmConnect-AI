import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

interface PublicAuthLayoutProps {
  children: React.ReactNode;
  theme: Theme;
  toggleTheme: () => void;
  eyebrow: string;
  title: string;
  description: string;
  imageLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageVariant?: 'landscape' | 'portrait';
}

const trustPoints = [
  { icon: ShieldCheck, label: 'Private by design' },
  { icon: HeartHandshake, label: 'Human-centered care' },
  { icon: Sparkles, label: 'Thoughtful AI support' },
];

const PublicAuthLayout: React.FC<PublicAuthLayoutProps> = ({
  children,
  theme,
  toggleTheme,
  eyebrow,
  title,
  description,
  imageLabel = 'Connected mental wellness',
  imageSrc = '/signin.png',
  imageAlt = 'A CalmConnect mental wellness experience',
  imageVariant = 'landscape',
}) => (
  <div className="public-auth-theme min-h-screen bg-[#f4f7f5] text-slate-900 dark:bg-[#071311] dark:text-slate-100">
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(129,198,200,0.22),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(132,152,104,0.16),transparent_30%)] dark:bg-[radial-gradient(circle_at_8%_12%,rgba(45,212,191,0.1),transparent_32%),radial-gradient(circle_at_92%_25%,rgba(132,152,104,0.08),transparent_30%)]" />
    <PublicHeader theme={theme} toggleTheme={toggleTheme} />

    <main className="relative mx-auto flex min-h-screen max-w-[1440px] items-center px-4 pb-10 pt-28 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_32px_90px_-42px_rgba(15,56,51,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/50 lg:grid-cols-[1.08fr_0.92fr]">
        <section className={`relative min-h-[270px] overflow-hidden bg-[#d8d1c4] sm:min-h-[340px] ${
          imageVariant === 'portrait' ? 'lg:min-h-[860px]' : 'lg:min-h-[660px]'
        }`}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className={`absolute inset-0 h-full w-full object-cover ${
              imageVariant === 'portrait'
                ? 'object-[center_34%] lg:object-center'
                : 'object-[48%_center]'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102f2d]/95 via-[#102f2d]/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/15 dark:lg:to-slate-950/20" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
            <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
              {imageLabel}
            </span>
            <p className="mt-4 max-w-xl text-xl font-semibold leading-snug sm:text-2xl">
              Technology should make care feel more connected, never less human.
            </p>
          </div>
        </section>

        <section className="flex items-center bg-[linear-gradient(155deg,rgba(255,255,255,0.98),rgba(244,247,245,0.92))] p-6 dark:bg-[linear-gradient(155deg,rgba(15,23,42,0.98),rgba(11,31,28,0.96))] sm:p-10 lg:p-12 xl:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            </div>

            {children}

            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-6 dark:border-slate-700/70">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="h-4 w-4 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                  <span className="text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>

    <PublicFooter />
  </div>
);

export default PublicAuthLayout;
