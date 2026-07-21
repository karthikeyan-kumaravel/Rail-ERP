import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'orange' | 'blue' | 'green' | 'purple' | 'red';
export type BackgroundStyle = 'solid' | 'gradient' | 'glass';
export type GradientPreset =
    | 'orange'
    | 'blue'
    | 'green'
    | 'purple'
    | 'red'
    | 'sunset'
    | 'ocean'
    | 'forest'
    | 'midnight'
    | 'custom';
export type SidebarStyle = 'compact' | 'expanded';
export type HeaderStyle = 'sticky' | 'static';
export type FontSize = 'small' | 'medium' | 'large';
export type BorderRadius = 'small' | 'medium' | 'large';

export type Preferences = {
    theme: ThemeMode;
    accent: AccentColor;
    backgroundStyle: BackgroundStyle;
    gradientPreset: GradientPreset;
    customGradient: { from: string; to: string };
    sidebarStyle: SidebarStyle;
    headerStyle: HeaderStyle;
    fontSize: FontSize;
    borderRadius: BorderRadius;
    animations: boolean;
};

export const PREFERENCES_STORAGE_KEY = 'rail-erp-preferences';

export const DEFAULT_PREFERENCES: Preferences = {
    theme: 'system',
    accent: 'orange',
    backgroundStyle: 'solid',
    gradientPreset: 'orange',
    customGradient: { from: '#f2905c', to: '#c9a227' },
    sidebarStyle: 'expanded',
    headerStyle: 'static',
    fontSize: 'medium',
    borderRadius: 'medium',
    animations: true,
};

function resolveSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
    return mode === 'system' ? resolveSystemTheme() : mode;
}

export function applyPreferences(preferences: Preferences): void {
    const root = document.documentElement;
    const resolvedTheme = resolveTheme(preferences.theme);

    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', preferences.accent);
    root.setAttribute('data-bg-style', preferences.backgroundStyle);
    root.setAttribute('data-gradient', preferences.gradientPreset);
    root.setAttribute('data-font-size', preferences.fontSize);
    root.setAttribute('data-radius', preferences.borderRadius);
    root.setAttribute(
        'data-animations',
        preferences.animations ? 'on' : 'off',
    );
    root.style.colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    if (preferences.gradientPreset === 'custom') {
        root.style.setProperty(
            '--gradient-from',
            preferences.customGradient.from,
        );
        root.style.setProperty('--gradient-to', preferences.customGradient.to);
    } else {
        root.style.removeProperty('--gradient-from');
        root.style.removeProperty('--gradient-to');
    }
}

function readStoredPreferences(): Preferences {
    if (typeof window === 'undefined') {
        return DEFAULT_PREFERENCES;
    }

    try {
        const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);

        if (!stored) {
            return DEFAULT_PREFERENCES;
        }

        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

type PreferencesContextValue = {
    preferences: Preferences;
    updatePreference: <K extends keyof Preferences>(
        key: K,
        value: Preferences[K],
    ) => void;
    resetPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(
    null,
);

/**
 * Single shared source of truth for appearance preferences. Every consumer
 * (the Appearance panel, the sidebar/header layout) must read through the
 * same instance — otherwise settings that drive React state (sidebar/header
 * style) rather than a global DOM attribute silently desync between
 * components.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(() =>
        readStoredPreferences(),
    );

    useEffect(() => {
        applyPreferences(preferences);
        window.localStorage.setItem(
            PREFERENCES_STORAGE_KEY,
            JSON.stringify(preferences),
        );
    }, [preferences]);

    useEffect(() => {
        if (preferences.theme !== 'system') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyPreferences(preferences);

        media.addEventListener('change', handleChange);

        return () => media.removeEventListener('change', handleChange);
    }, [preferences]);

    const updatePreference = useCallback(
        <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
            setPreferences((current) => ({ ...current, [key]: value }));
        },
        [],
    );

    const resetPreferences = useCallback(() => {
        setPreferences(DEFAULT_PREFERENCES);
    }, []);

    return (
        <PreferencesContext.Provider
            value={{ preferences, updatePreference, resetPreferences }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences(): PreferencesContextValue {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error(
            'usePreferences must be used within a <PreferencesProvider>',
        );
    }

    return context;
}
