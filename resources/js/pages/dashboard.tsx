import { usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AdminLayout
            title="Dashboard"
            header={
                <h1 className="text-xl font-semibold text-[#fdede1]">
                    Dashboard
                </h1>
            }
        >
            <div className="flex h-full flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-semibold">
                    Welcome, {auth.user.name}
                </h1>
            </div>
        </AdminLayout>
    );
}
