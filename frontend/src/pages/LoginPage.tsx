import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(0,229,168,0.09)_0%,transparent_65%),radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(79,140,255,0.06)_0%,transparent_60%)]">
      <motion.div
        className="relative bg-card border border-border border-t-[rgba(255,255,255,0.08)] rounded-lg py-11 px-10 w-full max-w-105 shadow-[var(--shadow-lg),0_0_60px_rgba(0,229,168,0.04)] before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_40%)] before:pointer-events-none"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-7.5 h-7.5 rounded-sm bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-secondary)_100%)] shadow-[0_0_14px_rgba(0,229,168,0.35)]">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M3 11 L7 3 L11 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 8.5 H9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <span className="text-[16px] font-extrabold text-text tracking-[-0.03em]">P2P Journal</span>
        </div>

        <h1 className="text-[26px] font-extrabold text-text tracking-[-0.03em]">Welcome back</h1>
        <p className="text-[13px] text-muted mt-1.5 mb-8 leading-normal">Sign in to your trading journal</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" autoFocus required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" showToggle required />
          {error && (
            <p className="text-[12px] text-danger text-center py-2 px-3 bg-danger-dim rounded-sm border border-[rgba(255,77,77,0.15)]">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center mt-1">
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
