import React from 'react';
import { BriefcaseBusiness, Code2, Globe2 } from 'lucide-react';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/Zainmalik3618',
    icon: Code2,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/zainmalik3618/',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Portfolio',
    href: 'https://my-portfolio-six-alpha-75.vercel.app/',
    icon: Globe2,
  },
];

const PublicFooter: React.FC = () => (
  <footer className="relative z-10 border-t border-slate-200/80 bg-white/65 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 md:text-left">
        &copy; 2026 CalmConnect AI. All rights reserved.
      </p>

      <nav aria-label="Developer links" className="flex flex-wrap items-center justify-center gap-2">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:text-slate-300 dark:hover:bg-teal-950/50 dark:hover:text-teal-300"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
    </div>
  </footer>
);

export default PublicFooter;
