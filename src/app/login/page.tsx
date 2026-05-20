'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { authApi } from '@/lib/api'
import { Lock, User, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const [needsVerifyHint, setNeedsVerifyHint] = useState(false)
  const [needsPhoneVerifyHint, setNeedsPhoneVerifyHint] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('company_id')
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'refresh_token=; path=/; max-age=0'
      document.cookie = 'company_id=; path=/; max-age=0'
      authApi.logout()
    } catch {
      /* ignore */
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')
    setNeedsVerifyHint(false)
    setNeedsPhoneVerifyHint(false)

    try {
      const {
        error,
        code,
        verificationEmailSent,
        verificationEmailCooldown,
      } = await signIn(username, password)

      if (error) {
        if (code === 'email_not_verified') {
          let detail =
            'Your account is not verified yet. Check your email (including spam) for a verification link.'
          if (verificationEmailSent) {
            detail += ' We sent another verification email.'
          } else if (verificationEmailCooldown) {
            detail += ' Try “Resend email” below when eligible.'
          }
          setLoginError(detail)
          showError(detail)
          setNeedsVerifyHint(true)
        } else if (code === 'phone_not_verified') {
          const detail =
            typeof error === 'string' && error.trim()
              ? error
              : 'Your cellphone number must be verified before you can sign in. Open your profile to complete verification.'
          setLoginError(detail)
          showError(detail)
          setNeedsPhoneVerifyHint(true)
        } else {
          const msg = typeof error === 'string' ? error : 'Login failed'
          setLoginError(msg)
          showError(msg)
        }
      } else {
        showSuccess('Welcome back!')
        router.push('/')
      }
    } catch {
      const msg = 'An unexpected error occurred'
      setLoginError(msg)
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        <div className="bg-surface p-8 rounded-xl shadow-xl border border-forest-primary/10">
          <div className="text-center mb-10">
            <Link href="/" className="inline-block group transition-transform hover:scale-105 duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-forest-primary to-forest-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-forest-primary/20 group-hover:shadow-forest-primary/30 transition-shadow">
                <User className="w-10 h-10 text-text-inverse" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold font-playfair text-text tracking-tight">Welcome Back</h1>
            <p className="text-text-muted mt-3 text-lg">Sign in to your account</p>
          </div>

          {loginError ? (
            <div
              role="alert"
              data-cy="login-submit-error"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {loginError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="form-label text-sm font-semibold uppercase tracking-wider text-text-light">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors group-focus-within:text-forest-primary z-20">
                  <User className="w-5 h-5 text-text-muted" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-cy="login-username"
                  className="w-full pl-12 pr-4 py-3 bg-surface-raised border border-border rounded-md hover:border-forest-primary/50 transition-all focus:bg-surface focus:ring-4 focus:ring-forest-primary/10 focus:outline-none focus:border-transparent relative z-10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label text-sm font-semibold uppercase tracking-wider text-text-light">
                  Password
                </label>
                <Link href="#" className="text-xs font-semibold text-forest-primary hover:text-forest-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-colors group-focus-within:text-forest-primary z-20">
                  <Lock className="w-5 h-5 text-text-muted" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-cy="login-password"
                  className="w-full pl-12 pr-4 py-3 bg-surface-raised border border-border rounded-md hover:border-forest-primary/50 transition-all focus:bg-surface focus:ring-4 focus:ring-forest-primary/10 focus:outline-none focus:border-transparent relative z-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-forest-primary focus:ring-forest-primary border-border rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-light cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-cy="login-submit"
              className="btn btn-primary w-full py-4 text-base font-bold shadow-lg shadow-forest-primary/20 hover:shadow-forest-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-text-inverse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {needsVerifyHint ? (
            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm space-y-3">
              <p className="text-text font-medium">
                Email verification required. Check your inbox and spam folder for our link before signing in.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/auth/verify-email?email=${encodeURIComponent(username.trim())}`}
                  className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-raised"
                >
                  Verification help
                </Link>
                <button
                  type="button"
                  disabled={resendBusy}
                  onClick={async () => {
                    try {
                      setResendBusy(true)
                      const { authApi } = await import('@/lib/api')
                      await authApi.resendVerificationEmail(username.trim())
                      showSuccess(
                        'If your account exists and still needs verification, we sent another email.',
                      )
                    } catch {
                      showError('Could not resend. Try again shortly.')
                    } finally {
                      setResendBusy(false)
                    }
                  }}
                  className="rounded-md bg-gradient-to-r from-forest-primary to-forest-primary-dark px-3 py-2 text-sm font-semibold text-text-inverse shadow disabled:opacity-50"
                >
                  {resendBusy ? 'Sending…' : 'Resend email'}
                </button>
              </div>
            </div>
          ) : null}

          {needsPhoneVerifyHint ? (
            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm space-y-3">
              <p className="text-text font-medium">
                Phone verification is required. Complete verification from your profile, then sign in again.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-raised"
              >
                Go to profile
              </Link>
            </div>
          ) : null}

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-forest-primary hover:text-forest-primary-dark font-bold transition-colors underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
