import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEventHandler } from 'react';
import { store as storeSession } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';

type FormErrors = Record<string, string[]>;
type Mode = 'login' | 'register';
type PageProps = {
    hcaptchaSiteKey?: string | null;
    captchaImageUrl?: string | null;
};

const firstError = (errors: FormErrors, field: string) => errors[field]?.[0];

export default function Login() {
    const { hcaptchaSiteKey = '', captchaImageUrl = '' } =
        usePage<PageProps>().props;
    const [mode, setMode] = useState<Mode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaSrc, setCaptchaSrc] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        remember: false,
    });
    const captchaWidgetId = useRef<string | null>(null);

    const renderCaptcha = () => {
        const container = document.getElementById('login-captcha');

        if (!container || !window.hcaptcha || !hcaptchaSiteKey) {
            return;
        }

        if (captchaWidgetId.current) {
            window.hcaptcha.reset(captchaWidgetId.current);
        }

        captchaWidgetId.current = window.hcaptcha.render(container, {
            sitekey: hcaptchaSiteKey,
            callback: (token) => setCaptchaToken(token),
            'expired-callback': () => setCaptchaToken(''),
        });
    };

    const isRegistering = mode === 'register';
    const title = useMemo(
        () => (isRegistering ? 'Create account' : 'Sign in'),
        [isRegistering],
    );

    useEffect(() => {
        if (!hcaptchaSiteKey) {
            setCaptchaToken('');
            captchaWidgetId.current = null;

            return;
        }

        if (window.hcaptcha) {
            renderCaptcha();

            return;
        }

        const existingScript = document.getElementById('hcaptcha-script');

        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'hcaptcha-script';
            script.src = 'https://js.hcaptcha.com/1/api.js';
            script.async = true;
            script.defer = true;
            script.onload = renderCaptcha;
            document.body.appendChild(script);
        }
    }, [hcaptchaSiteKey]);

    const updateField = (field: keyof typeof form, value: string | boolean) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetCaptcha = () => {
        if (hcaptchaSiteKey) {
            window.hcaptcha?.reset(captchaWidgetId.current ?? undefined);
            setCaptchaToken('');
        }
    };

    const refreshLocalCaptcha = () => {
        if (!captchaImageUrl) return;
        const base = captchaImageUrl.startsWith('http')
            ? captchaImageUrl
            : window.location.origin +
              (captchaImageUrl.startsWith('/') ? '' : '/') +
              captchaImageUrl;

        setCaptchaSrc(
            `${base}${base.includes('?') ? '&' : '?'}ts=${Date.now()}`,
        );
        setCaptchaAnswer('');
    };

    useEffect(() => {
        if (!captchaImageUrl) {
            setCaptchaSrc('');
            return;
        }

        const base = captchaImageUrl.startsWith('http')
            ? captchaImageUrl
            : window.location.origin +
              (captchaImageUrl.startsWith('/') ? '' : '/') +
              captchaImageUrl;

        setCaptchaSrc(
            `${base}${base.includes('?') ? '&' : '?'}ts=${Date.now()}`,
        );
    }, [captchaImageUrl]);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        if (!isRegistering && !captchaAnswer.trim()) {
            setErrors({
                captcha_answer: ['Please complete the captcha challenge.'],
            });
            setProcessing(false);

            return;
        }

        if (!isRegistering && hcaptchaSiteKey && !captchaToken) {
            setErrors({
                h_captcha_response: ['Please complete the captcha challenge.'],
            });
            setProcessing(false);

            return;
        }

        router.post(
            storeSession.url(),
            {
                email: form.email,
                password: form.password,
                remember: form.remember,
                captcha_answer: captchaAnswer,
                ...(hcaptchaSiteKey
                    ? { h_captcha_response: captchaToken }
                    : {}),
            },
            {
                preserveScroll: true,
                onError: (validationErrors) => {
                    const loginErrors = validationErrors as unknown as FormErrors;
                    setErrors(loginErrors);

                    if (loginErrors.captcha_answer) {
                        setMessage('Please check the captcha verification.');
                        refreshLocalCaptcha();
                    } else {
                        setMessage('Please check the form.');
                    }

                    resetCaptcha();
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    return (
        <>
            <Head title={title} />
            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_45%)]" />
                <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--color-gold)]/25 bg-[var(--color-surface)]/85 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative flex flex-col justify-between bg-linear-to-br from-[var(--color-accent)]/20 via-[var(--color-surface)] to-[var(--color-surface-soft)]/90 p-8 lg:p-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center rounded-full border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/80 px-3 py-1.5 text-xs font-semibold tracking-[0.24em] text-[var(--color-gold)] uppercase">
                                Rail ERP
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
                                    Keep your rail network running on schedule.
                                </h1>
                                <p className="max-w-xl text-sm leading-7 text-[var(--color-ink)]/75 sm:text-base">
                                    Manage train schedules, fleet status, crew
                                    coordination, maintenance approvals, and
                                    incident response from one operational
                                    control centre.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/70 p-4">
                                    <p className="text-xl font-semibold text-[var(--color-ink)]">
                                        Live network status
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--color-ink)]/70">
                                        Monitor train movements, assets, and
                                        service exceptions in real time
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/70 p-4">
                                    <p className="text-xl font-semibold text-[var(--color-ink)]">
                                        Inspection-ready
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--color-ink)]/70">
                                        Maintain complete audit trails for
                                        inspections, maintenance, and approvals
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/80 p-4 text-sm text-[var(--color-ink)]/75">
                            <p className="font-semibold text-[var(--color-ink)]">
                                Protected access to rail operations
                            </p>
                            <p className="mt-1">
                                CAPTCHA verification helps protect operational
                                data and restricts access to authorised railway
                                personnel.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-10">
                        <div className="mb-8 text-center lg:text-left">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] shadow-lg lg:mx-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--color-ink)"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-7 w-7"
                                >
                                    <rect
                                        x="4"
                                        y="3"
                                        width="16"
                                        height="13"
                                        rx="2"
                                    />
                                    <path d="M4 11h16" />
                                    <path d="M8 16l-2 4" />
                                    <path d="M16 16l2 4" />
                                    <circle
                                        cx="8"
                                        cy="13.5"
                                        r="0.5"
                                        fill="var(--color-ink)"
                                    />
                                    <circle
                                        cx="16"
                                        cy="13.5"
                                        r="0.5"
                                        fill="var(--color-ink)"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
                                {title}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--color-accent)]/90">
                                {isRegistering
                                    ? 'Create your workspace account'
                                    : 'Sign in to continue your journey'}
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {isRegistering && (
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1.5 block text-xs font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        value={form.name}
                                        onChange={(event) =>
                                            updateField(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your name"
                                        className="w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                    />
                                    {firstError(errors, 'name') && (
                                        <p className="mt-1.5 text-xs font-bold text-red-600">
                                            {firstError(errors, 'name')}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase"
                                >
                                    {isRegistering
                                        ? 'Email'
                                        : 'Username or Email'}
                                </label>
                                <input
                                    id="email"
                                    type={isRegistering ? 'email' : 'text'}
                                    autoComplete={
                                        isRegistering ? 'email' : 'username'
                                    }
                                    value={form.email}
                                    onChange={(event) =>
                                        updateField('email', event.target.value)
                                    }
                                    placeholder={
                                        isRegistering
                                            ? 'Enter your email'
                                            : 'Enter your username or email'
                                    }
                                    className="w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                />
                                {(firstError(errors, 'email') ||
                                    firstError(errors, 'login')) && (
                                    <p className="mt-1.5 text-xs font-bold text-red-600">
                                        {firstError(errors, 'email') ??
                                            firstError(errors, 'login')}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-xs font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        autoComplete={
                                            isRegistering
                                                ? 'new-password'
                                                : 'current-password'
                                        }
                                        value={form.password}
                                        onChange={(event) =>
                                            updateField(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your password"
                                        className="w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-4 py-2.5 pr-11 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-gold)]/70 hover:text-[var(--color-accent)]"
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
                                    <p className="mt-1.5 text-xs font-bold text-red-600">
                                        {firstError(errors, 'password')}
                                    </p>
                                )}
                            </div>

                            {!isRegistering && (
                                <div className="space-y-2 rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/70 p-2.5">
                                    <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--color-gold)] uppercase">
                                        Security check
                                    </div>

                                    {/* Captcha image + refresh (local fallback) */}
                                    {captchaSrc ? (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={captchaSrc}
                                                alt="Captcha"
                                                onError={() => {
                                                    // Hide the broken image and show the simple input fallback
                                                    setCaptchaSrc('');
                                                    setMessage(
                                                        'Captcha image failed to load — please try Refresh or enter the characters manually.',
                                                    );
                                                }}
                                                className="h-9 w-28 rounded-md border border-[var(--color-gold)]/15 bg-white/40 object-fill shadow-sm"
                                            />
                                            <div className="w-36">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            refreshLocalCaptcha
                                                        }
                                                        className="rounded-md bg-[var(--color-accent)]/10 px-2 py-1 text-[11px] font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20 focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:outline-none"
                                                    >
                                                        Refresh
                                                    </button>
                                                </div>
                                                <input
                                                    id="captcha-answer"
                                                    type="text"
                                                    inputMode="text"
                                                    value={captchaAnswer}
                                                    onChange={(event) =>
                                                        setCaptchaAnswer(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter the characters above"
                                                    className="w-full rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-2.5 py-1.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                                />
                                                {firstError(
                                                    errors,
                                                    'captcha_answer',
                                                ) && (
                                                    <p className="mt-2 text-xs font-bold text-red-600">
                                                        {firstError(
                                                            errors,
                                                            'captcha_answer',
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--color-ink)]">
                                                Solve the captcha to continue
                                            </p>
                                            <input
                                                id="captcha-answer"
                                                type="text"
                                                value={captchaAnswer}
                                                onChange={(event) =>
                                                    setCaptchaAnswer(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Enter captcha"
                                                className="mt-2 w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                            />
                                            {firstError(
                                                errors,
                                                'captcha_answer',
                                            ) && (
                                                <p className="mt-2 text-xs font-bold text-red-600">
                                                    {firstError(
                                                        errors,
                                                        'captcha_answer',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* If external hCaptcha configured, render it below without status text */}
                                    {hcaptchaSiteKey && (
                                        <div className="mt-3">
                                            <div
                                                id="login-captcha"
                                                className="flex justify-start"
                                            />
                                            {firstError(
                                                errors,
                                                'h_captcha_response',
                                            ) && (
                                                <p className="mt-2 text-xs font-bold text-red-600">
                                                    {firstError(
                                                        errors,
                                                        'h_captcha_response',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isRegistering && (
                                <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]/75">
                                    <input
                                        type="checkbox"
                                        checked={form.remember}
                                        onChange={(event) =>
                                            updateField(
                                                'remember',
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-[var(--color-gold)]/30 bg-[var(--color-surface-soft)]/70 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                                    />
                                    Remember me
                                </label>
                            )}

                            {message && (
                                <p className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-ink)]">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Please wait...' : title}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
