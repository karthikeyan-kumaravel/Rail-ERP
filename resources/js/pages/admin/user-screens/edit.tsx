import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/user-screens';
import UserScreenFormFields from './user-screen-form-fields';
import type { UserScreenFormData } from './user-screen-form-fields';

type MainScreenOption = { id: number; screen_name: string };

type EditUserScreen = {
    unique_id: string;
    main_screen_id: number | null;
    screen_name: string;
    folder_name: string;
    order_no: number;
    icon: string;
    description: string | null;
    status: boolean;
    can_add: boolean;
    can_update: boolean;
    can_list: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_cancel: boolean;
};

type EditProps = {
    userScreen: EditUserScreen;
    mainScreens: MainScreenOption[];
};

export default function UserScreensEdit({
    userScreen,
    mainScreens,
}: EditProps) {
    const { data, setData, put, processing, errors } =
        useForm<UserScreenFormData>({
            main_screen_id: userScreen.main_screen_id ?? '',
            screen_name: userScreen.screen_name,
            folder_name: userScreen.folder_name,
            order_no: userScreen.order_no,
            icon: userScreen.icon,
            description: userScreen.description ?? '',
            status: userScreen.status ? '1' : '0',
            can_add: userScreen.can_add,
            can_update: userScreen.can_update,
            can_list: userScreen.can_list,
            can_delete: userScreen.can_delete,
            can_view: userScreen.can_view,
            can_cancel: userScreen.can_cancel,
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(userScreen.unique_id));
    };

    return (
        <AdminLayout
            title="Edit User Screen"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / User Screen
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">Edit</span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6"
            >
                <div className="mb-4 flex items-center justify-end">
                    <span className="text-xs font-medium text-[var(--color-accent)]">
                        * Mandatory Fields
                    </span>
                </div>

                <UserScreenFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    mainScreens={mainScreens}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save changes'}
                    </button>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
