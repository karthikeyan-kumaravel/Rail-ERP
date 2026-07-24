import { usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import AlertCard from '@/lib/alert-card';
import type { AlertCardData } from '@/lib/alert-card';

type DashboardProps = {
    alerts: AlertCardData[];
};

export default function Dashboard({ alerts }: DashboardProps) {
    const { auth } = usePage().props;

    return (
        <AdminLayout
            title="Dashboard"
            header={
                <h1 className="text-xl font-semibold text-[var(--color-ink)]">
                    Dashboard
                </h1>
            }
        >
            <div className="flex flex-col gap-6">
                {alerts.length > 0 && (
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}

                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <h1 className="text-2xl font-semibold">
                        Welcome, {auth.user.name}
                    </h1>
                </div>
            </div>
        </AdminLayout>
    );
}
