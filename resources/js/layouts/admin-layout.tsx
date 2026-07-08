import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { dashboard } from '@/routes';
import { index as usersIndex } from '@/routes/admin/users';

const RailIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="4" y="3" width="16" height="13" rx="2" />
        <path d="M4 11h16" />
        <path d="M8 16l-2 4" />
        <path d="M16 16l2 4" />
        <circle cx="8" cy="13.5" r="0.5" fill="currentColor" />
        <circle cx="16" cy="13.5" r="0.5" fill="currentColor" />
    </svg>
);

const HomeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
);

const AdminIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="m9.5 12 1.8 1.8L14.5 10" />
    </svg>
);

const ChevronDownIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const PanelCollapseIcon = ({
    className = 'h-4 w-4',
}: {
    className?: string;
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        <path d="m14 10-2 2 2 2" />
    </svg>
);

const LogoutIcon = ({ className = 'h-4.5 w-4.5' }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </svg>
);

const adminSubItems = [
    { label: 'Users', href: usersIndex.url() },
    { label: 'User screen', href: '#' },
    { label: 'User type', href: '/admin/user-types' },
    { label: 'User permission', href: '#' },
];

type AdminLayoutProps = {
    children: ReactNode;
    title: string;
    header?: ReactNode;
    withBackgroundImage?: boolean;
};

export default function AdminLayout({
    children,
    title,
    header,
    withBackgroundImage = false,
}: AdminLayoutProps) {
    const { props, url: currentUrl } = usePage();
    const { auth } = props;
    const currentPath = currentUrl.split('?')[0];
    const isAdminSection = currentPath.startsWith('/admin');

    const [collapsed, setCollapsed] = useState(false);
    const [adminOpen, setAdminOpen] = useState(isAdminSection);

    const logout = () => {
        router.post('/logout');
    };

    const initials = auth.user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    const navLinkClass =
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition';

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen bg-[#0f2436] text-[#fdede1]">
                <aside
                    className={`flex flex-col border-r border-[#e0a94a]/15 bg-[#0a1a28] transition-all duration-200 ${
                        collapsed ? 'w-19' : 'w-64'
                    }`}
                >
                    <div className="flex items-center justify-between gap-2 px-4 py-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#f2905c] to-[#c9a227] text-[#0f2436] shadow-lg">
                                <RailIcon className="h-5 w-5" />
                            </div>
                            {!collapsed && (
                                <span className="truncate text-lg font-semibold text-[#fdede1]">
                                    Rail ERP
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCollapsed((value) => !value)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#e0a94a]/25 text-[#e0a94a]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                        >
                            <PanelCollapseIcon />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                        <Link
                            href={dashboard.url()}
                            className={`${navLinkClass} ${
                                currentPath === '/dashboard'
                                    ? 'bg-linear-to-r from-[#f2905c] to-[#c9a227] text-[#0f2436] shadow-lg'
                                    : 'text-[#fdede1]/85 hover:bg-[#16324a] hover:text-[#fdede1]'
                            }`}
                        >
                            <HomeIcon />
                            {!collapsed && <span>Home</span>}
                        </Link>

                        <div>
                            <button
                                type="button"
                                onClick={() => setAdminOpen((value) => !value)}
                                className={`${navLinkClass} w-full justify-between text-[#fdede1]/85 hover:bg-[#16324a] hover:text-[#fdede1]`}
                            >
                                <span className="flex items-center gap-3">
                                    <AdminIcon />
                                    {!collapsed && <span>Admin</span>}
                                </span>
                                {!collapsed && (
                                    <ChevronDownIcon
                                        className={`h-4 w-4 transition-transform ${
                                            adminOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                )}
                            </button>

                            {!collapsed && adminOpen && (
                                <div className="mt-1 ml-4.5 space-y-0.5 border-l border-[#e0a94a]/20 pl-4">
                                    {adminSubItems.map((item) =>
                                        item.href === '#' ? (
                                            <span
                                                key={item.label}
                                                className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-[#fdede1]/40"
                                            >
                                                {item.label}
                                            </span>
                                        ) : (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className={`block rounded-md px-3 py-2 text-sm transition ${
                                                    currentPath.startsWith(
                                                        item.href,
                                                    )
                                                        ? 'bg-[#16324a] text-[#fdede1]'
                                                        : 'text-[#fdede1]/70 hover:bg-[#16324a] hover:text-[#fdede1]'
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>

                    <div className="border-t border-[#e0a94a]/15 px-3 py-4">
                        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#f2905c] to-[#c9a227] text-sm font-semibold text-[#0f2436]">
                                {initials}
                            </div>
                            {!collapsed && (
                                <>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[#fdede1]">
                                            {auth.user.name}
                                        </p>
                                        <p className="truncate text-xs text-[#fdede1]/55">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        title="Log out"
                                        className="shrink-0 text-[#e0a94a]/70 transition hover:text-[#f2905c]"
                                    >
                                        <LogoutIcon />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </aside>

                <div
                    className={`relative flex flex-1 flex-col ${withBackgroundImage ? 'bg-cover bg-center' : ''}`}
                    style={
                        withBackgroundImage
                            ? { backgroundImage: "url('/images/login-bg.jpg')" }
                            : undefined
                    }
                >
                    {withBackgroundImage && (
                        <div className="absolute inset-0 bg-linear-to-br from-[#0f2436]/90 via-[#16324a]/70 to-[#3a2410]/80" />
                    )}
                    {header && (
                        <header
                            className={`relative border-b border-[#e0a94a]/15 px-8 py-5 ${withBackgroundImage ? 'backdrop-blur-sm' : ''}`}
                        >
                            {header}
                        </header>
                    )}
                    <main className="relative flex-1 p-6">{children}</main>
                </div>
            </div>
        </>
    );
}
