import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/users';
import UserFormFields from './user-form-fields';
import type { UserFormData } from './user-form-fields';

type UserType = { id: number; name: string };

type EditUser = {
    id: number;
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
        put(update.url(user.id));
    };

    return (
        <AdminLayout
            title="Edit User"
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[#fdede1]/55 hover:text-[#f2905c]"
                    >
                        Admin / User Creation
                    </Link>
                    <span className="mx-1.5 text-[#fdede1]/40">/</span>
                    <span className="font-semibold text-[#fdede1]">Edit</span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="max-w-3xl rounded-xl border border-[#e0a94a]/15 bg-[#0a1a28] p-6"
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
                        className="rounded-lg bg-linear-to-r from-[#f2905c] to-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0f2436] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save changes'}
                    </button>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[#e0a94a]/25 px-5 py-2.5 text-sm font-semibold text-[#fdede1]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
