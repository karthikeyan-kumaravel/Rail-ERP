import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            flash: {
                success: string | null;
                error: string | null;
            };
            [key: string]: unknown;
        };
    }
}

declare global {
    type HCaptchaRenderOptions = {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
    };

    interface Window {
        hcaptcha?: {
            render: (
                container: HTMLElement,
                options: HCaptchaRenderOptions,
            ) => string;
            reset: (widgetId?: string) => void;
            getResponse: (widgetId?: string) => string;
        };
    }
}
