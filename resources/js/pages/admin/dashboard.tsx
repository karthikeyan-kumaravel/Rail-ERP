import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { ChevronRightIcon, IconChip } from '@/lib/icons';
import { index as userScreensIndex } from '@/routes/admin/user-screens';
import { index as userTypePermissionsIndex } from '@/routes/admin/user-type-permissions';
import { index as userTypesIndex } from '@/routes/admin/user-types';
import { index as usersIndex } from '@/routes/admin/users';

const modules = [
    {
        title: 'Users',
        description: 'Manage application users.',
        icon: 'users',
        href: usersIndex.url(),
    },
    {
        title: 'User Types',
        description: 'Create and manage user roles.',
        icon: 'user',
        href: userTypesIndex.url(),
    },
    {
        title: 'User Screens',
        description: 'Configure accessible screens.',
        icon: 'screen',
        href: userScreensIndex.url(),
    },
    {
        title: 'User Type Permission',
        description: 'Assign permissions to user roles.',
        icon: 'key',
        href: userTypePermissionsIndex.url(),
    },
];

export default function AdminDashboard() {
    return (
        <AdminLayout
            title="Admin Dashboard"
            header={
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-ink)]">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                        Manage users, roles, screens, and permissions.
                    </p>
                </div>
            }
        >
            <div className="flex min-h-full items-center py-6">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="grid grid-cols-1 gap-4">
                        {modules.map((module) => (
                            <Link
                                key={module.title}
                                href={module.href}
                                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)]/40 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                            >
                                <IconChip
                                    name={module.icon}
                                    className="h-12 w-12 rounded-xl transition-transform duration-200 group-hover:scale-105"
                                    iconClassName="h-6 w-6"
                                />
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                                        {module.title}
                                    </h2>
                                    <p className="mt-1 truncate text-sm text-[var(--color-ink)]/60">
                                        {module.description}
                                    </p>
                                </div>
                                <ChevronRightIcon className="h-5 w-5 shrink-0 text-[var(--color-ink)]/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
