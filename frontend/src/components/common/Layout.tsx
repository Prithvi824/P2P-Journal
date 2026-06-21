import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';

interface LayoutProps { children: ReactNode }

export default function Layout({ children }: LayoutProps) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14.5 flex items-center gap-6 px-7 bg-[rgba(13,21,37,0.85)] [backdrop-filter:blur(16px)_saturate(1.4)] border-b border-border sticky top-0 z-100 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[linear-gradient(90deg,transparent_0%,rgba(0,229,168,0.25)_30%,rgba(79,140,255,0.2)_70%,transparent_100%)]">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.25 text-[15px] font-extrabold text-text tracking-[-0.03em] transition-opacity hover:opacity-85"
        >
          <span className="flex items-center justify-center w-6.5 h-6.5 rounded-1.75 bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-secondary)_100%)] shadow-[0_0_12px_rgba(0,229,168,0.3)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11 L7 3 L11 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 8.5 H9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </span>
          P2P Journal
        </Link>
        <nav className="flex-1 flex gap-1">
          <Link
            to="/dashboard"
            className="px-3 py-1.5 rounded-sm text-muted text-base font-medium transition-[color,background] hover:text-text hover:bg-white/5"
          >
            Dashboard
          </Link>
        </nav>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
      </header>
      <main className="flex-1 p-7 max-w-360 w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
