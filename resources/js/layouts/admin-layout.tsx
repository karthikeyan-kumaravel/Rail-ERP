import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppearancePanel from '@/lib/appearance-panel';
import {
    BellIcon,
    ChevronDownIcon,
    IconChip,
    LogoutIcon,
    MenuIcon,
    PanelCollapseIcon,
    RailIcon,
    XIcon,
} from '@/lib/icons';
import { PreferencesProvider, usePreferences } from '@/lib/use-preferences';
import { dashboard, logout } from '@/routes';
import { index as alertsIndex } from '@/routes/admin/alerts';
import type { NavigationItem } from '@/types';

const adminBasePath = `${dashboard.url().replace(/\/dashboard\/?$/, '')}/admin`;

function isAdminItem(
    item: Pick<NavigationItem, 'folder_name' | 'screen_name'>,
): boolean {
    return (
        item.folder_name.toLowerCase() === 'admin' ||
        item.screen_name.trim().toLowerCase() === 'admin'
    );
}

function isSettingsItem(
    item: Pick<NavigationItem, 'folder_name' | 'screen_name'>,
): boolean {
    return item.folder_name.toLowerCase() === 'settings';
}

function adminUrl(folderName: string, screenName?: string): string {
    if (
        folderName.toLowerCase() === 'admin' ||
        screenName?.trim().toLowerCase() === 'admin'
    ) {
        return adminBasePath;
    }

    return `${adminBasePath}/${folderName}`;
}

function isGroupActive(item: NavigationItem, currentPath: string): boolean {
    if (item.children.length === 0) {
        return currentPath.startsWith(adminUrl(item.folder_name));
    }

    return item.children.some((child) => isGroupActive(child, currentPath));
}

function initialOpenGroups(
    items: NavigationItem[],
    currentPath: string,
): Record<string, boolean> {
    return items.reduce<Record<string, boolean>>((open, item) => {
        if (item.children.length === 0) {
            return open;
        }

        return {
            ...open,
            [item.folder_name]: isGroupActive(item, currentPath),
            ...initialOpenGroups(item.children, currentPath),
        };
    }, {});
}

const topLevelLinkClass =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition';

type NavItemProps = {
    item: NavigationItem;
    currentPath: string;
    collapsed: boolean;
    openGroups: Record<string, boolean>;
    onToggleGroup: (folderName: string) => void;
    depth: number;
};

function NavItem({
    item,
    currentPath,
    collapsed,
    openGroups,
    onToggleGroup,
    depth,
}: NavItemProps) {
    const href = adminUrl(item.folder_name, item.screen_name);
    // Admin and Settings are dashboard links. Their child screens remain
    // available from that dashboard instead of expanding the sidebar.
    const hasChildren =
        item.children.length > 0 && !isAdminItem(item) && !isSettingsItem(item);
    const isOpen = openGroups[item.folder_name] ?? false;
    const childrenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasChildren || !isOpen) {
            return;
        }

        const activeLink = childrenContainerRef.current?.querySelector(
            '[data-active="true"]',
        );

        activeLink?.scrollIntoView({ block: 'nearest' });
    }, [hasChildren, isOpen, currentPath]);

    if (!hasChildren) {
        // Admin/Settings link to their own dashboard at a path that is a
        // prefix of every page beneath it, so only an exact match should
        // count as active — a prefix match would light them up everywhere.
        const isDashboardLink = isAdminItem(item) || isSettingsItem(item);
        const isActive = isDashboardLink
            ? currentPath === href
            : currentPath.startsWith(href);
        const stateClass = isActive
            ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-ink)] shadow-[inset_3px_0_0_0_var(--sidebar-active-border)]'
            : 'text-[var(--sidebar-ink-soft)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-ink)]';
        const className =
            depth === 0
                ? `${topLevelLinkClass} ${stateClass}`
                : `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${stateClass}`;

        return (
            <Link
                href={href}
                data-active={isActive ? 'true' : undefined}
                className={className}
            >
                <IconChip
                    name={item.icon}
                    className={depth === 0 ? 'h-8 w-8' : 'h-7 w-7'}
                    iconClassName={depth === 0 ? 'h-4.5 w-4.5' : 'h-4 w-4'}
                />
                {!collapsed && (
                    <span className="truncate">{item.screen_name}</span>
                )}
            </Link>
        );
    }

    return (
        <div>
            {depth === 0 && !collapsed ? (
                <button
                    type="button"
                    onClick={() => onToggleGroup(item.folder_name)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 pt-4 pb-1.5 text-left text-[10.5px] font-semibold tracking-[0.14em] text-[var(--sidebar-heading)] uppercase transition hover:text-[var(--sidebar-ink-soft)]"
                >
                    <span>{item.screen_name}</span>
                    <ChevronDownIcon
                        className={`h-3.5 w-3.5 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => onToggleGroup(item.folder_name)}
                    className={`${topLevelLinkClass} w-full justify-between text-[var(--sidebar-ink-soft)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-ink)]`}
                >
                    <span className="flex items-center gap-3">
                        <IconChip
                            name={item.icon}
                            className={depth === 0 ? 'h-8 w-8' : 'h-7 w-7'}
                            iconClassName="h-4 w-4"
                        />
                        {!collapsed && <span>{item.screen_name}</span>}
                    </span>
                    {!collapsed && (
                        <ChevronDownIcon
                            className={`h-4 w-4 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                        />
                    )}
                </button>
            )}

            {!collapsed && isOpen && (
                <div
                    ref={childrenContainerRef}
                    className={`mt-0.5 space-y-0.5 ${
                        item.children.length > 7
                            ? 'max-h-72 overflow-y-auto pr-1'
                            : ''
                    }`}
                >
                    {item.children.map((child) => (
                        <NavItem
                            key={child.folder_name}
                            item={child}
                            currentPath={currentPath}
                            collapsed={collapsed}
                            openGroups={openGroups}
                            onToggleGroup={onToggleGroup}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

type AdminLayoutProps = {
    children: ReactNode;
    title: string;
    header?: ReactNode;
    withBackgroundImage?: boolean;
};

export default function AdminLayout(layoutProps: AdminLayoutProps) {
    return (
        <PreferencesProvider>
            <AdminLayoutContent {...layoutProps} />
        </PreferencesProvider>
    );
}

function AdminLayoutContent({ children, title, header }: AdminLayoutProps) {
    const { props, url: currentUrl } = usePage();
    const { auth, navigation, alertsCount } = props;
    const currentPath = currentUrl.split('?')[0];

    const accountsNavigation = useMemo(() => {
        const allowedChildren = new Set([
            'customers',
            'vendors',
            'banks',
            'engineers',
            'engineer-types',
        ]);

        const alertsItem = navigation.find(
            (item) => item.folder_name === 'alerts',
        );

        const settingsItem = navigation.find(
            (item) => item.folder_name === 'settings',
        );

        const subSettingsItem = navigation.find(
            (item) => item.folder_name === 'sub-settings',
        );

        const settingsChildren = [
            ...(settingsItem?.children ?? []),
            ...(subSettingsItem?.children ?? []),
        ].filter((child) => allowedChildren.has(child.folder_name));

        const filteredSettings = settingsItem
            ? {
                  ...settingsItem,
                  children: settingsChildren,
              }
            : null;

        const result: NavigationItem[] = [];

        if (alertsItem) {
            result.push(alertsItem);
        }

        if (filteredSettings && filteredSettings.children.length > 0) {
            result.push(filteredSettings);
        }

        return result;
    }, [navigation]);

    const operationNavigation = useMemo(() => {
        const alertsItem = navigation.find(
            (item) => item.folder_name === 'alerts',
        );

        const settingsItem = navigation.find(
            (item) => item.folder_name === 'settings',
        );

        const subSettingsItem = navigation.find(
            (item) => item.folder_name === 'sub-settings',
        );

        const settingsChildren = [
            ...(settingsItem?.children ?? []),
            ...(subSettingsItem?.children ?? []),
        ];

        const result: NavigationItem[] = [];

        if (alertsItem) {
            result.push(alertsItem);
        }

        if (settingsItem && settingsChildren.length > 0) {
            result.push({
                ...settingsItem,
                screen_name: 'All Settings',
                children: settingsChildren,
            });
        }

        return result;
    }, [navigation]);

    const defaultNavigation = useMemo(() => {
        const settingsItem = navigation.find(
            (item) => item.folder_name === 'settings',
        );

        const subSettingsItem = navigation.find(
            (item) => item.folder_name === 'sub-settings',
        );

        if (!settingsItem) {
            return navigation;
        }

        const mergedSettings: NavigationItem = {
            ...settingsItem,
            children: [
                ...settingsItem.children,
                ...(subSettingsItem?.children ?? []),
            ],
        };

        return navigation
            .filter((item) => item.folder_name !== 'sub-settings')
            .map((item) =>
                item.folder_name === 'settings' ? mergedSettings : item,
            );
    }, [navigation]);

    const isAccountsTeam =
        auth?.isAccountsTeam === true ||
        auth?.role?.toLowerCase().trim() === 'accounts team';

    const isOperationTeam =
        auth?.isOperationTeam === true ||
        auth?.role?.toLowerCase().trim() === 'operation team';

    const displayedNavigation = isAccountsTeam
        ? accountsNavigation
        : isOperationTeam
          ? operationNavigation
          : defaultNavigation;

    const sidebarNavigation = [
        ...displayedNavigation.filter((item) => item.folder_name !== 'alerts'),
        ...displayedNavigation.filter((item) => item.folder_name === 'alerts'),
    ].map((item) =>
        isAdminItem(item) || isSettingsItem(item)
            ? {
                  ...item,
                  // Admin/Settings children belong on their dashboards, never
                  // in the sidebar.
                  children: [],
              }
            : item,
    );

    const { preferences, updatePreference } = usePreferences();
    const collapsed = preferences.sidebarStyle === 'compact';
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        initialOpenGroups(sidebarNavigation, currentPath),
    );
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleGroup = (folderName: string) => {
        setOpenGroups((current) => ({
            ...current,
            [folderName]: !current[folderName],
        }));
    };

    const doLogout = () => {
        router.post(logout.url());
    };

    const initials = auth.user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <>
            <Head title={title} />
            <div className="flex h-dvh overflow-hidden bg-[var(--color-bg)] text-[var(--color-ink)]">
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--sidebar-border)] bg-linear-to-b from-[var(--sidebar-bg-from)] to-[var(--sidebar-bg-to)] text-[var(--sidebar-ink)] transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${collapsed ? 'lg:w-19' : 'lg:w-64'}`}
                >
                    <div className="flex items-center justify-between gap-2 px-4 py-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg">
                                <RailIcon className="h-5 w-5" />
                            </div>
                            {!collapsed && (
                                <span className="truncate text-lg font-semibold text-[var(--sidebar-ink)]">
                                    Rail ERP
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--sidebar-border)] text-[var(--sidebar-ink-soft)] transition hover:border-[var(--color-accent-base)]/60 hover:text-[var(--color-accent-base)] lg:hidden"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/*
                        Anchored to the sidebar's own edge (the <aside> is
                        `fixed`, which already establishes a containing block
                        for this) rather than sharing the header row with the
                        logo — at the collapsed `lg:w-19` width there isn't
                        room for both side by side without overlapping.
                    */}
                    <button
                        type="button"
                        onClick={() =>
                            updatePreference(
                                'sidebarStyle',
                                collapsed ? 'expanded' : 'compact',
                            )
                        }
                        aria-label={
                            collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                        }
                        title={
                            collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                        }
                        className="absolute top-6 -right-3 hidden h-6 w-6 items-center justify-center rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar-base-2)] text-[var(--sidebar-ink-soft)] shadow-md transition hover:border-[var(--color-accent-base)]/60 hover:text-[var(--color-accent-base)] lg:flex"
                    >
                        <PanelCollapseIcon
                            className={`h-3.5 w-3.5 transition-transform ${
                                collapsed ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    <nav
                        className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2"
                        onClick={(event) => {
                            if ((event.target as HTMLElement).closest('a')) {
                                setMobileOpen(false);
                            }
                        }}
                    >
                        {!collapsed && (
                            <p className="px-3 pt-1 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-[var(--sidebar-heading)] uppercase">
                                Overview
                            </p>
                        )}
                        <Link
                            href={dashboard.url()}
                            className={`${topLevelLinkClass} ${
                                currentPath === dashboard.url()
                                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-ink)] shadow-[inset_3px_0_0_0_var(--sidebar-active-border)]'
                                    : 'text-[var(--sidebar-ink-soft)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-ink)]'
                            }`}
                        >
                            <IconChip
                                name="home"
                                className="h-8 w-8"
                                iconClassName="h-4.5 w-4.5"
                            />
                            {!collapsed && <span>Home</span>}
                        </Link>

                        {sidebarNavigation.map((item) => (
                            <NavItem
                                key={item.folder_name}
                                item={item}
                                currentPath={currentPath}
                                collapsed={collapsed}
                                openGroups={openGroups}
                                onToggleGroup={toggleGroup}
                                depth={0}
                            />
                        ))}
                    </nav>
                </aside>

                <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div
                        className={
                            preferences.headerStyle === 'sticky'
                                ? 'sticky top-0 z-30'
                                : 'relative z-30'
                        }
                    >
                        <nav className="relative flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-8">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-ink)]/70 transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-accent)] lg:hidden"
                            >
                                <MenuIcon />
                            </button>
                            <div className="ml-auto flex items-center gap-3">
                                <Link
                                    href={alertsIndex.url()}
                                    title="Alerts & Reminders"
                                    aria-label={
                                        alertsCount
                                            ? `Alerts & Reminders, ${alertsCount} active`
                                            : 'Alerts & Reminders'
                                    }
                                    className="relative shrink-0 text-[var(--color-ink)]/70 transition hover:text-[var(--color-accent)]"
                                >
                                    <BellIcon />
                                    {!!alertsCount && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                                            {alertsCount > 99
                                                ? '99+'
                                                : alertsCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-sm font-semibold text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0 text-right">
                                    <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                                        {auth.user.name}
                                    </p>
                                    <p className="truncate text-xs text-[var(--color-ink)]/55">
                                        {auth.user.email}
                                    </p>
                                </div>
                                <AppearancePanel />
                                <button
                                    type="button"
                                    onClick={doLogout}
                                    title="Log out"
                                    className="shrink-0 text-[var(--color-gold)]/70 transition hover:text-[var(--color-accent)]"
                                >
                                    <LogoutIcon />
                                </button>
                            </div>
                        </nav>
                        {header && (
                            <header className="relative border-b border-[var(--color-border)] px-4 py-5 sm:px-8">
                                {header}
                            </header>
                        )}
                    </div>
                    <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
