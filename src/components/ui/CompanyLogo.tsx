export const companyStyles: Record<string, string> = {
  Amazon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Google: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Meta: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Uber: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  Stripe: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  LinkedIn: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Airbnb: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Delta: 'bg-red-500/10 text-red-400 border-red-500/20',
  DraftKings: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const renderCompanyLogo = (company?: string, sizeClass = "w-3.5 h-3.5") => {
  if (!company) return null;
  const name = company.toLowerCase();

  if (name.includes('google')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Google</title>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    );
  }
  if (name.includes('amazon')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Amazon</title>
        <path d="M18.8 15.6c-.6.8-1.6 1.4-2.8 1.4-2.2 0-3.6-1.6-3.6-3.8 0-2.6 1.8-4.2 4.4-4.2.8 0 1.5.2 2 .4v1.1c-.5-.3-1.1-.5-1.7-.5-1.6 0-2.6 1.1-2.6 2.7 0 1.4.8 2.3 2.1 2.3.8 0 1.6-.4 2-1v1.6zm.4-7c0-.9-.7-1.5-1.6-1.5-.7 0-1.2.3-1.5.8l-.9-.6C15.7 6.4 16.5 6 17.6 6c1.7 0 2.9 1.1 2.9 2.7v5.5c0 1 .1 1.7.3 2.1h-1.3c-.1-.3-.2-.8-.2-1.2-.5.8-1.4 1.4-2.5 1.4-1.7 0-2.8-1-2.8-2.5 0-1.8 1.4-2.8 4.1-2.8h1.4V9.2c0-1.2-.7-1.8-1.9-1.8-.8 0-1.5.3-2 .8l-.6-.8c.7-.7 1.7-1.1 2.9-1.1 1.8 0 3 1 3 2.9v4.2c0 .6.1 1.2.2 1.6h-1.3c-.1-.3-.1-.7-.1-1.1-.4.8-1.2 1.3-2.3 1.3-1.5 0-2.4-.9-2.4-2.2 0-1.5 1.2-2.3 3.3-2.3h1.5V8.6zm-10-1c0-.9-.6-1.5-1.5-1.5-.7 0-1.2.3-1.5.8l-.9-.6C5.7 6.4 6.5 6 7.6 6c1.7 0 2.9 1.1 2.9 2.7v5.5c0 1 .1 1.7.3 2.1H9.5c-.1-.3-.2-.8-.2-1.2-.5.8-1.4 1.4-2.5 1.4-1.7 0-2.8-1-2.8-2.5 0-1.8 1.4-2.8 4.1-2.8h1.4V9.2c0-1.2-.7-1.8-1.9-1.8-.8 0-1.5.3-2 .8l-.6-.8c.7-.7 1.7-1.1 2.9-1.1 1.8 0 3 1 3 2.9v4.2c0 .6.1 1.2.2 1.6H9.5c-.1-.3-.1-.7-.1-1.1-.4.8-1.2 1.3-2.3 1.3-1.5 0-2.4-.9-2.4-2.2 0-1.5 1.2-2.3 3.3-2.3h1.5V8.6z" fill="#FF9900" />
        <path d="M2.5 19.5c5.5 3 13.5 3 19 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
        <path d="M19.5 18c.5.5 1.5 1.5 2 1.5s-.5-1-1-2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name.includes('meta')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Meta</title>
        <path d="M16.5 6C14.07 6 12.22 7.74 12 10.12 11.78 7.74 9.93 6 7.5 6 4.46 6 2 8.46 2 11.5S4.46 17 7.5 17c2.43 0 4.28-1.74 4.5-4.12.22 2.38 2.07 4.12 4.5 4.12 3.04 0 5.5-2.46 5.5-5.5S19.54 6 16.5 6zm0 9c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm-9 0C5.57 15 4 13.43 4 11.5S5.57 8 7.5 8s3.5 1.57 3.5 3.5S9.43 15 7.5 15z" fill="#0668E1" />
      </svg>
    );
  }
  if (name.includes('uber')) {
    return (
      <svg className={`${sizeClass} rounded bg-black p-0.5`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Uber</title>
        <circle cx="12" cy="12" r="7" fill="#FFFFFF" />
        <rect x="10" y="10" width="4" height="4" fill="#000000" />
        <path d="M12 12h7" stroke="#FFFFFF" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name.includes('stripe')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Stripe</title>
        <rect width="24" height="24" rx="5" fill="#635BFF" />
        <path d="M13.9 8.3c-1.1-.3-1.8-.6-1.8-1.1 0-.5.5-.7 1.2-.7 1 0 1.9.3 2.6.8l.6-2.1c-.8-.4-1.9-.7-3.2-.7-2.6 0-4.3 1.4-4.3 3.7 0 3.5 4.8 2.9 4.8 4.7 0 .6-.6.9-1.4.9-1.2 0-2.3-.4-3.1-1l-.6 2.2c1 .6 2.3.9 3.7.9 2.7 0 4.6-1.3 4.6-3.8 0-3.6-4.8-3-4.8-4.7z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (name.includes('linkedin')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>LinkedIn</title>
        <rect width="24" height="24" rx="5" fill="#0A66C2" />
        <path d="M9 19H6V10h3v9zM7.5 8.7a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zm11.5 10.3h-3v-4.7c0-1.1-.8-1.3-1.1-1.3-.7 0-1.4.5-1.4 1.3V19h-3V10h3v1.2c.4-.7 1.3-1.2 2.5-1.2 2 0 3 1.3 3 3.5V19z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (name.includes('airbnb')) {
    return (
      <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>Airbnb</title>
        <path d="M12 21.6c-.4 0-.8-.2-1-.6C9.1 18.2 4.4 11.2 4.4 8.4 4.4 4.1 7.8.8 12 .8s7.6 3.3 7.6 7.6c0 2.8-4.7 9.8-6.6 12.6-.2.4-.6.6-1 .6zm0-19c-3.1 0-5.6 2.5-5.6 5.6 0 1.9 3.5 7.6 5.6 10.7 2.1-3.1 5.6-8.8 5.6-10.7 0-3.1-2.5-5.6-5.6-5.6z" fill="#FF5A5F" />
        <circle cx="12" cy="8.4" r="2" fill="#FF5A5F" />
      </svg>
    );
  }
  return (
    <span className="px-1 py-0.5 text-[8px] font-bold rounded bg-gray-800 text-gray-400 border border-gray-700">
      {company}
    </span>
  );
};
