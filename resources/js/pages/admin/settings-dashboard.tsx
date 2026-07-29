import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { ChevronRightIcon, IconChip } from '@/lib/icons';
import { index as activitiesIndex } from '@/routes/admin/activities';
import { index as banksIndex } from '@/routes/admin/banks';
import { index as citiesIndex } from '@/routes/admin/cities';
import { index as customersIndex } from '@/routes/admin/customers';
import { index as departmentsIndex } from '@/routes/admin/departments';
import { index as districtsIndex } from '@/routes/admin/districts';
import { index as divisionsIndex } from '@/routes/admin/divisions';
import { index as engineerTypesIndex } from '@/routes/admin/engineer-types';
import { index as engineersIndex } from '@/routes/admin/engineers';
import { index as projectsIndex } from '@/routes/admin/projects';
import { index as scheduleNamesIndex } from '@/routes/admin/schedule-names';
import { index as scheduleTypesIndex } from '@/routes/admin/schedule-types';
import { index as statesIndex } from '@/routes/admin/states';
import { index as stationsIndex } from '@/routes/admin/stations';
import { index as unitsIndex } from '@/routes/admin/units';
import { index as vendorsIndex } from '@/routes/admin/vendors';
import { index as zonesIndex } from '@/routes/admin/zones';

const modules = [
    {
        title: 'State',
        description: 'Manage states used across the application.',
        icon: 'map',
        href: statesIndex.url(),
    },
    {
        title: 'District',
        description: 'Manage districts under each state.',
        icon: 'map',
        href: districtsIndex.url(),
    },
    {
        title: 'City',
        description: 'Manage cities under each district.',
        icon: 'map',
        href: citiesIndex.url(),
    },
    {
        title: 'Zone',
        description: 'Manage railway zones.',
        icon: 'building',
        href: zonesIndex.url(),
    },
    {
        title: 'Division',
        description: 'Manage divisions under each zone.',
        icon: 'building',
        href: divisionsIndex.url(),
    },
    {
        title: 'Station',
        description: 'Manage railway stations.',
        icon: 'train',
        href: stationsIndex.url(),
    },
    {
        title: 'Customer',
        description: 'Manage customer master records.',
        icon: 'user',
        href: customersIndex.url(),
    },
    {
        title: 'Vendor',
        description: 'Manage vendor master records.',
        icon: 'building',
        href: vendorsIndex.url(),
    },
    {
        title: 'Bank',
        description: 'Manage bank master records.',
        icon: 'bank',
        href: banksIndex.url(),
    },
    {
        title: 'Activities',
        description: 'Manage project activity types.',
        icon: 'list',
        href: activitiesIndex.url(),
    },
    {
        title: 'Engineer Types',
        description: 'Manage engineer type categories.',
        icon: 'user',
        href: engineerTypesIndex.url(),
    },
    {
        title: 'Unit Creation',
        description: 'Manage measurement units.',
        icon: 'grid',
        href: unitsIndex.url(),
    },
    {
        title: 'Department',
        description: 'Manage departments.',
        icon: 'building',
        href: departmentsIndex.url(),
    },
    {
        title: 'Project Creation',
        description: 'Manage project master records.',
        icon: 'folder',
        href: projectsIndex.url(),
    },
    {
        title: 'Schedule Name',
        description: 'Manage schedule names.',
        icon: 'list',
        href: scheduleNamesIndex.url(),
    },
    {
        title: 'Schedule Type',
        description: 'Manage schedule types.',
        icon: 'list',
        href: scheduleTypesIndex.url(),
    },
    {
        title: 'Engineer Master',
        description: 'Manage engineer master records.',
        icon: 'users',
        href: engineersIndex.url(),
    },
];

export default function SettingsDashboard() {
    return (
        <AdminLayout
            title="Settings Dashboard"
            header={
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-ink)]">
                        Settings Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                        Manage master data used across the application.
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
