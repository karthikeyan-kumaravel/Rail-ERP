import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import UserTypeFormFields from './user-type-form-fields';
import type { UserTypeFormData } from './user-type-form-fields';

const userTypesUrl = '/admin/user-types';

export default function UserTypesCreate() {
    const { data, setData, post, processing, errors } =
        useForm<UserTypeFormData>({
            name: '',
            active_status: '1',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(userTypesUrl);
    };

    return (
        <AdminLayout
            title="Add User Type"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={userTypesUrl}
                        className="text-[#fdede1]/55 hover:text-[#f2905c]"
                    >
                        Admin / User Type
                    </Link>
                    <span className="mx-1.5 text-[#fdede1]/40">/</span>
                    <span className="font-semibold text-[#fdede1]">
                        Add New
                    </span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="max-w-3xl rounded-xl border border-[#e0a94a]/20 bg-[#0a1a28]/75 p-6 shadow-2xl backdrop-blur-xl"
            >
                <UserTypeFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[#f2905c] to-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0f2436] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                    <Link
                        href={userTypesUrl}
                        className="rounded-lg border border-[#e0a94a]/25 px-5 py-2.5 text-sm font-semibold text-[#fdede1]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
