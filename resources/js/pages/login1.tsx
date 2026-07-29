
import { Head, router, usePage } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    RefreshCw,
    ShieldCheck,
    TrainFront,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEventHandler, MouseEvent as ReactMouseEvent } from 'react';
import { store as storeSession } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { PreferencesProvider } from '@/lib/use-preferences';

type FormErrors = Record<string, string | undefined>;
type PageProps = {
    hcaptchaSiteKey?: string | null;
    captchaImageUrl?: string | null;
    logoUrl?: string | null;
    trainBackgroundUrl?: string | null;
};

const firstError = (errors: FormErrors, field: string) => errors[field];

type Particle = { left: number; size: number; duration: number; delay: number };
type Bird = { top: number; duration: number; delay: number; scale: number };
type Cloud = {
    top: number;
    left: number;
    width: number;
    duration: number;
    delay: number;
};

/**
 * Fixed presets rather than Math.random() — keeps the scene stable across
 * re-renders (no re-shuffling on every state update) and avoids any
 * client/server markup mismatch if this page is ever server-rendered.
 */
const PARTICLES: Particle[] = [
    { left: 4, size: 3, duration: 9, delay: 0 },
    { left: 12, size: 2, duration: 11, delay: 1.4 },
    { left: 21, size: 4, duration: 8.5, delay: 2.8 },
    { left: 30, size: 2, duration: 10.5, delay: 0.6 },
    { left: 38, size: 3, duration: 12, delay: 3.5 },
    { left: 47, size: 2, duration: 9.5, delay: 1.9 },
    { left: 55, size: 4, duration: 11.5, delay: 0.2 },
    { left: 63, size: 3, duration: 8, delay: 2.2 },
    { left: 71, size: 2, duration: 10, delay: 4.1 },
    { left: 79, size: 3, duration: 12.5, delay: 1.1 },
    { left: 87, size: 2, duration: 9, delay: 3 },
    { left: 94, size: 4, duration: 11, delay: 0.9 },
];

const BIRDS: Bird[] = [
    { top: 12, duration: 16, delay: 0, scale: 1 },
    { top: 20, duration: 21, delay: 3, scale: 0.75 },
    { top: 9, duration: 19, delay: 7, scale: 0.6 },
    { top: 16, duration: 24, delay: 11, scale: 0.85 },
];

const CLOUDS: Cloud[] = [
    { top: 8, left: 6, width: 220, duration: 34, delay: 0 },
    { top: 14, left: 55, width: 160, duration: 42, delay: 4 },
    { top: 5, left: 74, width: 190, duration: 38, delay: 9 },
];

function Login1() {
    const pageProps = usePage<PageProps>().props;
    const hcaptchaSiteKey = pageProps.hcaptchaSiteKey ?? '';
    const captchaImageUrl = pageProps.captchaImageUrl ?? '';
    const logoUrl = pageProps.logoUrl ?? '/images/indian-railways-logo.svg';
    const trainBackgroundUrl =
        pageProps.trainBackgroundUrl ?? '/images/login-bg.jpg';
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaSrc, setCaptchaSrc] = useState('');
    const [form, setForm] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
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

    useEffect(() => {
        if (!hcaptchaSiteKey) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        if (!captchaImageUrl) {
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
        setCaptchaAnswer('');
    };

    useEffect(() => {
        if (!captchaImageUrl) {
            return;
        }

        const base = captchaImageUrl.startsWith('http')
            ? captchaImageUrl
            : window.location.origin +
              (captchaImageUrl.startsWith('/') ? '' : '/') +
              captchaImageUrl;

        // The Date.now() cache-buster is impure, so it can't be computed
        // during render or in a lazy useState initializer — an effect run
        // once on mount (and again if the server-provided URL changes) is
        // the only place left to compute it.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCaptchaSrc(
            `${base}${base.includes('?') ? '&' : '?'}ts=${Date.now()}`,
        );
    }, [captchaImageUrl]);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage('');

        if (!captchaAnswer.trim()) {
            setErrors({
                captcha_answer: 'Please complete the captcha challenge.',
            });
            setProcessing(false);

            return;
        }

        if (hcaptchaSiteKey && !captchaToken) {
            setErrors({
                h_captcha_response: 'Please complete the captcha challenge.',
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
                    setErrors(validationErrors);

                    if (validationErrors.captcha_answer) {
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

    const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
        setPointer({
            x: (event.clientX / window.innerWidth - 0.5) * 2,
            y: (event.clientY / window.innerHeight - 0.5) * 2,
        });
    };

    const handlePointerLeave = () => setPointer({ x: 0, y: 0 });

    return (
        <>
            <Head title="Sign in" />
            <style>{`
                @keyframes login1-kenburns {
                    from { transform: scale(1.06); }
                    to { transform: scale(1.16); }
                }
                @keyframes login1-gradient-pan {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes login1-train-run {
                    from { transform: translateX(-32vw); }
                    to { transform: translateX(132vw); }
                }
                @keyframes login1-track-shine {
                    from { transform: translateX(-120%); }
                    to { transform: translateX(320%); }
                }
                @keyframes login1-cloud-drift {
                    from { transform: translateX(-6vw); }
                    to { transform: translateX(6vw); }
                }
                @keyframes login1-bird-fly {
                    0% { transform: translate(-10vw, 6px); opacity: 0; }
                    8% { opacity: 0.85; }
                    50% { transform: translate(55vw, -20px); }
                    92% { opacity: 0.85; }
                    100% { transform: translate(120vw, 4px); opacity: 0; }
                }
                @keyframes login1-particle-float {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    12% { opacity: 0.85; }
                    88% { opacity: 0.35; }
                    100% { transform: translateY(-110px) scale(0.5); opacity: 0; }
                }
                @keyframes login1-logo-glow {
                    0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-accent) 45%, transparent); }
                    50% { box-shadow: 0 0 0 16px transparent; }
                }
                @keyframes login1-fade-up {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes login1-card-in {
                    from { opacity: 0; transform: translateY(32px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .login1-photo { animation: login1-kenburns 32s ease-in-out infinite alternate; }
                .login1-gradient { background-size: 220% 220%; animation: login1-gradient-pan 16s ease-in-out infinite; }
                .login1-train { animation: login1-train-run 24s linear infinite; }
                .login1-track-shine { animation: login1-track-shine 5.5s linear infinite; }
                .login1-cloud { animation: login1-cloud-drift var(--login1-duration, 36s) ease-in-out infinite alternate; animation-delay: var(--login1-delay, 0s); }
                .login1-bird { animation: login1-bird-fly var(--login1-duration, 18s) linear infinite; animation-delay: var(--login1-delay, 0s); }
                .login1-particle { animation: login1-particle-float var(--login1-duration, 10s) ease-in infinite; animation-delay: var(--login1-delay, 0s); }
                .login1-logo-ring { animation: login1-logo-glow 2.8s ease-in-out infinite; }
                .login1-in { animation: login1-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .login1-card { animation: login1-card-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .login1-scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
                .login1-scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>

            <div
                className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[var(--color-bg)] p-3 sm:p-5 lg:p-6"
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
            >
                {/* Decorative, non-interactive scene — hidden from assistive tech */}
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0 transition-transform duration-300 ease-out"
                        style={{
                            transform: `translate3d(${pointer.x * 6}px, ${pointer.y * 4}px, 0) scale(1.02)`,
                        }}
                    >
                        <div
                            className="login1-photo absolute inset-0 bg-cover bg-center opacity-40 blur-[2px] sm:opacity-50"
                            style={{
                                backgroundImage: `url('${trainBackgroundUrl}')`,
                            }}
                        />
                    </div>

                    <div
                        className="login1-gradient absolute inset-0"
                        style={{
                            backgroundImage:
                                'linear-gradient(120deg, color-mix(in oklab, var(--color-bg) 88%, transparent) 0%, color-mix(in oklab, var(--color-bg) 55%, transparent) 45%, color-mix(in oklab, var(--color-accent) 22%, var(--color-bg)) 100%)',
                        }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.10),_transparent_45%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(0,0,0,0.18),_transparent_55%)]" />

                    {/* Clouds */}
                    <div
                        className="absolute inset-0 hidden transition-transform duration-300 ease-out sm:block"
                        style={{
                            transform: `translate3d(${pointer.x * 16}px, ${pointer.y * 8}px, 0)`,
                        }}
                    >
                        {CLOUDS.map((cloud, index) => (
                            <div
                                key={index}
                                className="login1-cloud absolute rounded-full bg-white/50 blur-2xl"
                                style={
                                    {
                                        top: `${cloud.top}%`,
                                        left: `${cloud.left}%`,
                                        width: `${cloud.width}px`,
                                        height: `${cloud.width * 0.4}px`,
                                        '--login1-duration': `${cloud.duration}s`,
                                        '--login1-delay': `${cloud.delay}s`,
                                    } as React.CSSProperties
                                }
                            />
                        ))}
                    </div>

                    {/* Birds */}
                    <div
                        className="absolute inset-0 hidden transition-transform duration-300 ease-out md:block"
                        style={{
                            transform: `translate3d(${pointer.x * 22}px, ${pointer.y * 10}px, 0)`,
                        }}
                    >
                        {BIRDS.map((bird, index) => (
                            <div
                                key={index}
                                className="login1-bird absolute h-3 w-6 text-[var(--color-ink)]/40"
                                style={
                                    {
                                        top: `${bird.top}%`,
                                        left: 0,
                                        transform: `scale(${bird.scale})`,
                                        '--login1-duration': `${bird.duration}s`,
                                        '--login1-delay': `${bird.delay}s`,
                                    } as React.CSSProperties
                                }
                            >
                                <svg
                                    viewBox="0 0 24 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.6}
                                    strokeLinecap="round"
                                >
                                    <path d="M1 8c3-6 6-6 11-1 5-5 8-5 11 1" />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Track */}
                    <div className="absolute inset-x-0 bottom-[16%] h-10">
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--color-ink)]/25" />
                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--color-ink)]/25" />
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0px,var(--color-ink)_6px,transparent_6px,transparent_26px)] opacity-20" />
                        <div className="login1-track-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    </div>

                    {/* Train silhouette, running along the track */}
                    <div
                        className="absolute bottom-[16.6%] h-14 w-72 text-[var(--color-ink)]/70 transition-transform duration-300 ease-out sm:h-16 sm:w-80"
                        style={{
                            transform: `translate3d(0, ${pointer.y * 4}px, 0)`,
                        }}
                    >
                        <div className="login1-train h-full w-full">
                            <svg
                                viewBox="0 0 300 70"
                                className="h-full w-full"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M10 55h280v-4H10zM24 50V28c0-8 6-14 14-14h214c14 0 26 8 32 20l8 16H16z"
                                    fill="currentColor"
                                />
                                <rect
                                    x="46"
                                    y="24"
                                    width="30"
                                    height="16"
                                    rx="3"
                                    fill="var(--color-bg)"
                                    opacity="0.85"
                                />
                                <rect
                                    x="86"
                                    y="24"
                                    width="30"
                                    height="16"
                                    rx="3"
                                    fill="var(--color-bg)"
                                    opacity="0.85"
                                />
                                <rect
                                    x="126"
                                    y="24"
                                    width="30"
                                    height="16"
                                    rx="3"
                                    fill="var(--color-bg)"
                                    opacity="0.85"
                                />
                                <rect
                                    x="166"
                                    y="24"
                                    width="30"
                                    height="16"
                                    rx="3"
                                    fill="var(--color-bg)"
                                    opacity="0.85"
                                />
                                <rect
                                    x="206"
                                    y="24"
                                    width="26"
                                    height="16"
                                    rx="3"
                                    fill="var(--color-bg)"
                                    opacity="0.85"
                                />
                                <circle
                                    cx="46"
                                    cy="58"
                                    r="8"
                                    fill="currentColor"
                                />
                                <circle
                                    cx="90"
                                    cy="58"
                                    r="8"
                                    fill="currentColor"
                                />
                                <circle
                                    cx="150"
                                    cy="58"
                                    r="8"
                                    fill="currentColor"
                                />
                                <circle
                                    cx="210"
                                    cy="58"
                                    r="8"
                                    fill="currentColor"
                                />
                                <circle
                                    cx="264"
                                    cy="58"
                                    r="8"
                                    fill="currentColor"
                                />
                                <path
                                    d="M232 30l14-14h20c8 0 14 6 14 14v4h-48z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute inset-0">
                        {PARTICLES.map((particle, index) => (
                            <div
                                key={index}
                                className="login1-particle absolute rounded-full bg-[var(--color-accent)]"
                                style={
                                    {
                                        left: `${particle.left}%`,
                                        bottom: '14%',
                                        width: `${particle.size}px`,
                                        height: `${particle.size}px`,
                                        '--login1-duration': `${particle.duration}s`,
                                        '--login1-delay': `${particle.delay}s`,
                                    } as React.CSSProperties
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* Login card */}
                <div className="login1-card relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-[var(--color-gold)]/25 bg-[var(--color-surface)]/70 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:max-h-[calc(100dvh-2.5rem)] lg:max-h-[calc(100dvh-3rem)]">
                    <div className="h-1.5 w-full shrink-0 bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_33%,#ffffff_33%,#ffffff_66%,#128807_66%,#128807_100%)]" />

                    <div className="login1-scrollbar-hide overflow-y-auto p-4 sm:p-6 lg:p-7">
                        <div className="login1-in mb-3 text-center sm:mb-4">
                            <div className="relative mx-auto mb-2 h-12 w-12 sm:mb-3 sm:h-16 sm:w-16">
                                <span className="login1-logo-ring absolute inset-0 rounded-full" />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 shadow-lg ring-4 ring-[var(--color-accent)]/25 sm:h-16 sm:w-16 sm:p-2.5">
                                    <img
                                        src={logoUrl}
                                        alt="Indian Railways"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </div>

                            <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] text-[var(--color-gold)] uppercase">
                                <TrainFront className="h-3.5 w-3.5" />
                                Ministry of Railways
                            </div>
                            <h1 className="text-xl font-semibold text-[var(--color-ink)] sm:text-2xl">
                                Rail ERP
                            </h1>
                            <p className="mt-1 text-xs text-[var(--color-accent)]/90 sm:text-sm">
                                Sign in to continue your journey
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-2.5 sm:space-y-3.5"
                        >
                            <div
                                className="login1-in"
                                style={{ animationDelay: '80ms' }}
                            >
                                <label
                                    htmlFor="email"
                                    className="mb-1 block text-xs font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase"
                                >
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-gold)]/70" />
                                    <input
                                        id="email"
                                        type="text"
                                        autoComplete="username"
                                        value={form.email}
                                        onChange={(event) =>
                                            updateField(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your username or email"
                                        className="w-full rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 py-2.5 pr-4 pl-10 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                    />
                                </div>
                                {(firstError(errors, 'email') ||
                                    firstError(errors, 'login')) && (
                                    <p className="mt-1.5 text-xs font-bold text-red-600">
                                        {firstError(errors, 'email') ??
                                            firstError(errors, 'login')}
                                    </p>
                                )}
                            </div>

                            <div
                                className="login1-in"
                                style={{ animationDelay: '140ms' }}
                            >
                                <label
                                    htmlFor="password"
                                    className="mb-1 block text-xs font-medium tracking-[0.2em] text-[var(--color-gold)] uppercase"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-gold)]/70" />
                                    <input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={(event) =>
                                            updateField(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 py-2.5 pr-11 pl-10 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        title={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-gold)]/70 transition hover:text-[var(--color-accent)]"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4.5 w-4.5" />
                                        ) : (
                                            <Eye className="h-4.5 w-4.5" />
                                        )}
                                    </button>
                                </div>
                                {firstError(errors, 'password') && (
                                    <p className="mt-1.5 text-xs font-bold text-red-600">
                                        {firstError(errors, 'password')}
                                    </p>
                                )}
                            </div>

                            <div
                                className="login1-in space-y-1.5 rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-surface-soft)]/70 p-2.5 transition focus-within:border-[var(--color-accent)]/40 hover:border-[var(--color-accent)]/30 sm:p-3"
                                style={{ animationDelay: '200ms' }}
                            >
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-[var(--color-gold)] uppercase">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Security check
                                </div>

                                {captchaSrc ? (
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={captchaSrc}
                                            alt="Captcha"
                                            onError={() => {
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
                                                    aria-label="Refresh captcha"
                                                    title="Refresh captcha"
                                                    className="group flex items-center gap-1 rounded-md bg-[var(--color-accent)]/10 px-2 py-1 text-[11px] font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20 focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:outline-none"
                                                >
                                                    <RefreshCw className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
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
                                            className="mt-2 w-full rounded-xl border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40"
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

                            <label
                                className="login1-in flex items-center gap-2 text-sm text-[var(--color-ink)]/75"
                                style={{ animationDelay: '240ms' }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.remember}
                                    onChange={(event) =>
                                        updateField(
                                            'remember',
                                            event.target.checked,
                                        )
                                    }
                                    style={{
                                        accentColor: 'var(--color-accent)',
                                    }}
                                    className="h-4 w-4 rounded border-[var(--color-gold)]/30 bg-[var(--color-surface-soft)]/70"
                                />
                                Remember me
                            </label>

                            {message && (
                                <p className="rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-ink)]">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="login1-in group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] py-2.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:brightness-110 active:scale-[0.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ animationDelay: '300ms' }}
                            >
                                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                                <span className="relative inline-flex items-center justify-center gap-2">
                                    <TrainFront className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                                    {processing ? 'Please wait...' : 'Sign in'}
                                </span>
                            </button>

                            <p className="hidden text-center text-xs text-[var(--color-ink)]/55 sm:block [@media(max-height:700px)]:hidden">
                                Authorised railway personnel only · Protected by
                                CAPTCHA verification
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Login1Page() {
    return (
        <PreferencesProvider>
            <Login1 />
        </PreferencesProvider>
    );
}
