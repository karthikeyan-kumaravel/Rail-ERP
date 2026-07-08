import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEventHandler } from 'react';

type FormErrors = Record<string, string[]>;
type Mode = 'login' | 'register';

const getCsrfToken = () =>
    document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

const firstError = (errors: FormErrors, field: string) => errors[field]?.[0];

export default function Login() {
    const [mode, setMode] = useState<Mode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const isRegistering = mode === 'register';
    const title = useMemo(
        () => (isRegistering ? 'Create account' : 'Sign in'),
        [isRegistering],
    );

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const switchMode = () => {
        setMode((current) => (current === 'login' ? 'register' : 'login'));
        setErrors({});
        setMessage('');
    };

    const submit: FormEventHandler = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        try {
            const response = await fetch(
                isRegistering ? '/api/register' : '/api/login',
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify(
                        isRegistering
                            ? form
                            : {
                                  login: form.email,
                                  password: form.password,
                              },
                    ),
                },
            );

            const payload = await response.json();

            if (!response.ok) {
                setErrors(payload.errors ?? {});
                setMessage(payload.message ?? 'Please check the form.');

                return;
            }

            window.location.href = '/dashboard';
        } catch {
            setMessage('Unable to connect. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={title} />
            <div
                className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center p-6"
                style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
            >
                <div className="absolute inset-0 bg-linear-to-br from-[#0f2436]/85 via-[#16324a]/55 to-[#3a2410]/70" />

                <div className="relative w-full max-w-sm rounded-2xl border border-[#e0a94a]/30 bg-[#0f2436]/60 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#f2905c] to-[#c9a227] shadow-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#0f2436"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-7 w-7"
                            >
                                <rect x="4" y="3" width="16" height="13" rx="2" />
                                <path d="M4 11h16" />
                                <path d="M8 16l-2 4" />
                                <path d="M16 16l2 4" />
                                <circle cx="8" cy="13.5" r="0.5" fill="#0f2436" />
                                <circle cx="16" cy="13.5" r="0.5" fill="#0f2436" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold text-[#fdede1]">
                            Rail ERP
                        </h1>
                        <p className="mt-1 text-sm text-[#f2905c]/90">
                            {isRegistering
                                ? 'Create your workspace account'
                                : 'Sign in to continue your journey'}
                        </p>
                    </div>

                    {/* <div className="mb-5 grid grid-cols-2 rounded-lg border border-[#e0a94a]/25 bg-[#0a1a28]/60 p-1">
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                !isRegistering
                                    ? 'bg-[#f2905c] text-[#0f2436]'
                                    : 'text-[#fdede1]/75 hover:text-[#fdede1]'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('register')}
                            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                isRegistering
                                    ? 'bg-[#f2905c] text-[#0f2436]'
                                    : 'text-[#fdede1]/75 hover:text-[#fdede1]'
                            }`}
                        >
                            Register
                        </button>
                    </div> */}

                    <form onSubmit={submit} className="space-y-5">
                        {isRegistering && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-xs font-medium tracking-wide text-[#e0a94a] uppercase"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(event) =>
                                        updateField('name', event.target.value)
                                    }
                                    placeholder="Enter your name"
                                    className="w-full rounded-lg border border-[#e0a94a]/25 bg-[#0a1a28]/60 px-4 py-2.5 text-sm text-[#fdede1] placeholder-[#fdede1]/35 outline-none transition focus:border-[#f2905c] focus:ring-2 focus:ring-[#f2905c]/40"
                                />
                                {firstError(errors, 'name') && (
                                    <p className="mt-1.5 text-xs text-[#f2905c]">
                                        {firstError(errors, 'name')}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-xs font-medium tracking-wide text-[#e0a94a] uppercase"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={(event) =>
                                    updateField('email', event.target.value)
                                }
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-[#e0a94a]/25 bg-[#0a1a28]/60 px-4 py-2.5 text-sm text-[#fdede1] placeholder-[#fdede1]/35 outline-none transition focus:border-[#f2905c] focus:ring-2 focus:ring-[#f2905c]/40"
                            />
                            {(firstError(errors, 'email') ||
                                firstError(errors, 'login')) && (
                                <p className="mt-1.5 text-xs text-[#f2905c]">
                                    {firstError(errors, 'email') ??
                                        firstError(errors, 'login')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-xs font-medium tracking-wide text-[#e0a94a] uppercase"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete={
                                        isRegistering
                                            ? 'new-password'
                                            : 'current-password'
                                    }
                                    value={form.password}
                                    onChange={(event) =>
                                        updateField('password', event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className="w-full rounded-lg border border-[#e0a94a]/25 bg-[#0a1a28]/60 px-4 py-2.5 pr-11 text-sm text-[#fdede1] placeholder-[#fdede1]/35 outline-none transition focus:border-[#f2905c] focus:ring-2 focus:ring-[#f2905c]/40"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#e0a94a]/70 hover:text-[#f2905c]"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4.5 w-4.5"
                                        >
                                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <path d="M1 1l22 22" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4.5 w-4.5"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {firstError(errors, 'password') && (
                                <p className="mt-1.5 text-xs text-[#f2905c]">
                                    {firstError(errors, 'password')}
                                </p>
                            )}
                        </div>

                        {message && (
                            <p className="rounded-lg border border-[#f2905c]/30 bg-[#f2905c]/10 px-3 py-2 text-xs text-[#fdede1]">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-linear-to-r from-[#f2905c] to-[#c9a227] py-2.5 text-sm font-semibold text-[#0f2436] shadow-lg transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Please wait...' : title}
                        </button>
                    </form>

                    {/* <button
                        type="button"
                        onClick={switchMode}
                        className="mt-5 w-full text-center text-xs font-medium text-[#f2905c] hover:text-[#e0a94a]"
                    >
                        {isRegistering
                            ? 'Already have an account? Sign in'
                            : 'New user? Create an account'}
                    </button> */}
                </div>
            </div>
        </>
    );
}
