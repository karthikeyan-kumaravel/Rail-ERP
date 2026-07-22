import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/users';
import UserFormFields from './user-form-fields';
import type { UserFormData } from './user-form-fields';

type UserType = { id: number; name: string };

type EditUser = {
    unique_id: string;
    name: string;
    username: string | null;
    email: string;
    mobile_no: string | null;
    user_type_id: number | null;
};

type EditProps = {
    user: EditUser;
    userTypes: UserType[];
};

export default function UsersEdit({ user, userTypes }: EditProps) {
    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name,
        username: user.username ?? '',
        email: user.email,
        mobile_no: user.mobile_no ?? '',
        user_type_id: user.user_type_id ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(user.unique_id));
    };

    return (
        <AdminLayout
            title="Edit User"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / User Creation
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        Edit
                    </span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6"
            >
                <UserFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    userTypes={userTypes}
                    passwordRequired={false}
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
