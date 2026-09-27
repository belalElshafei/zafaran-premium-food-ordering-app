'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Header from '@/components/Header';
import PasswordStrength from '@/components/PasswordStrength';
import { useAuthStore } from '@/store/authStore';
import { hashPassword, comparePassword, getStoredUsers, saveStoredUsers, StoredUser } from '@/lib/authUtils';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}`;
  const { setUser } = useAuthStore();

  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
 
  const { status } = useSession();
  const { isLoggedIn } = useAuthStore();
 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === 'authenticated' || isLoggedIn) {
      router.push(`/${locale}`);
    }
  }, [status, isLoggedIn, locale, router, mounted]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginForm.email) errs.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = t('errors.emailInvalid');
    if (!loginForm.password) errs.password = t('errors.passwordRequired');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginForm.email.toLowerCase().trim(),
        password: loginForm.password,
        redirect: false,
      });
 
      if (result?.error) {
        setErrors({ general: t('errors.invalidCredentials') });
      } else {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        if (sessionData?.user) {
          setUser({
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
          });
        }
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (err) {
      setErrors({ general: t('errors.somethingWentWrong') });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regForm.name.trim()) errs.name = t('errors.nameRequired');
    if (!regForm.email.trim()) errs.email = t('errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errs.email = t('errors.emailInvalid');
    if (!regForm.password) errs.password = t('errors.passwordRequired');
    else if (regForm.password.length < 8) errs.password = t('errors.passwordLength');
    if (regForm.password !== regForm.confirm) errs.confirm = t('errors.passwordMatch');
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
 
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name.trim(),
          email: regForm.email.toLowerCase().trim(),
          password: regForm.password,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        if (data.error === 'User already exists' || res.status === 400) {
          setErrors({ email: t('errors.emailExists'), general: t('errors.emailExists') });
          showToast(t('errors.emailExists'));
        } else {
          setErrors({ general: data.error || t('errors.generic') });
          showToast(data.error || t('errors.generic'));
        }
        return;
      }
 
      showToast(t('success.accountCreated'));
      
      // Auto-login after registration
      const result = await signIn('credentials', {
        email: regForm.email.toLowerCase().trim(),
        password: regForm.password,
        redirect: false,
      });

      if (!result?.error) {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        if (sessionData?.user) {
          setUser({
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
          });
        }
        router.refresh();
        router.push(callbackUrl);
      } else {
        setTab('login'); // Fallback to login tab if auto-login fails
      }
    } catch (err) {
      setErrors({ general: t('errors.somethingWentWrong') });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => signIn('google', { callbackUrl });

  const handleForgot = () => showToast(t('resetSent'));

  return (
    <div className="min-h-screen bg-cream-100">
      <Header />

      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-warm-lg overflow-hidden">

          {/* Top bar */}
          <div className="bg-warm-gradient px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                <span className="text-white font-display font-bold text-xl">Z</span>
              </div>
              <span className="font-display font-bold text-xl text-cream-100">Zafaran</span>
            </div>
            <div className="flex rounded-xl bg-white/10 p-1 gap-1">
              {(['login', 'register'] as Tab[]).map((t2) => (
                <button key={t2} onClick={() => { setTab(t2); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t2 ? 'bg-white text-charcoal-700 shadow-sm' : 'text-cream-200 hover:text-cream-100'}`}>
                  {t2 === 'login' ? t('signIn') : t('register')}
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-5">
                  
                  {errors.general && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.general}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-charcoal-600 mb-2">{t('email')}</label>
                    <div className="input-icon-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input type="email" value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className={`form-input input-with-icon ${errors.email ? 'form-input-error' : ''}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-charcoal-600">{t('password')}</label>
                      <button type="button" onClick={handleForgot}
                        className="text-xs text-terracotta-500 hover:text-terracotta-600 transition-colors">
                        {t('forgotPassword')}
                      </button>
                    </div>
                    <div className="input-icon-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input type={showPassword ? 'text' : 'password'} value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder={t('passwordPlaceholder')}
                        className={`form-input input-with-icon input-with-icon-end ${errors.password ? 'form-input-error' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="input-icon-end">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                    {t('signIn')}
                  </button>

                  {/* 
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-charcoal-200" />
                    <span className="text-xs text-charcoal-400">{t('orWith')}</span>
                    <div className="flex-1 h-px bg-charcoal-200" />
                  </div>

                  <button type="button" onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 border-2 border-charcoal-200 rounded-xl py-3 text-sm font-semibold text-charcoal-600 hover:bg-cream-100 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('google')}
                  </button>
                  */}

                  <p className="text-center text-sm text-charcoal-400">
                    {t('noAccount')}{' '}
                    <button type="button" onClick={() => setTab('register')}
                      className="text-terracotta-500 font-semibold hover:underline">{t('registerLink')}
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-4">
                  
                  {errors.general && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.general}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-charcoal-600 mb-2">{t('fullName')}</label>
                    <div className="input-icon-wrapper">
                      <User size={16} className="input-icon" />
                      <input type="text" value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        placeholder={t('fullNamePlaceholder')}
                        className={`form-input input-with-icon ${errors.name ? 'form-input-error' : ''}`} />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal-600 mb-2">{t('email')}</label>
                    <div className="input-icon-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input type="email" value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className={`form-input input-with-icon ${errors.email ? 'form-input-error' : ''}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal-600 mb-2">{t('password')}</label>
                    <div className="input-icon-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input type={showPassword ? 'text' : 'password'} value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder={t('passwordPlaceholder')}
                        className={`form-input input-with-icon input-with-icon-end ${errors.password ? 'form-input-error' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="input-icon-end">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    <PasswordStrength password={regForm.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal-600 mb-2">{t('confirmPassword')}</label>
                    <div className="input-icon-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input type={showConfirm ? 'text' : 'password'} value={regForm.confirm}
                        onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
                        placeholder={t('confirmPasswordPlaceholder')}
                        className={`form-input input-with-icon input-with-icon-end ${errors.confirm ? 'form-input-error' : ''}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="input-icon-end">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {t('register')}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-charcoal-200" />
                    <span className="text-xs text-charcoal-400">{t('orWith')}</span>
                    <div className="flex-1 h-px bg-charcoal-200" />
                  </div>

                  <button type="button" onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 border-2 border-charcoal-200 rounded-xl py-3 text-sm font-semibold text-charcoal-600 hover:bg-cream-100 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('google')}
                  </button>

                  <p className="text-center text-sm text-charcoal-400">
                    {t('haveAccount')}{' '}
                    <button type="button" onClick={() => setTab('login')}
                      className="text-terracotta-500 font-semibold hover:underline">{t('loginLink')}
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal-700 text-cream-100 px-6 py-3 rounded-xl shadow-warm-lg text-sm font-medium z-50">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
