import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type Bank = {
    unique_id: string;
    name: string;
    branch_name?: string | null;
    ifsc_code?: string | null;
    account_number?: string | null;
    account_holder_name?: string | null;
    account_type?: string | null;
    bank_address?: string | null;
    pincode?: string | null;
    contact_number?: string | null;
    email?: string | null;
    active_status: boolean;
};

type Props = {
    bank: Bank;
};

export default function Show({ bank }: Props) {
    return (
        <AdminLayout>
            <Head title={`Bank - ${bank.name}`} />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Bank Details</h1>

                    <Link
                        href="/admin/banks"
                        className="rounded bg-gray-600 px-4 py-2 text-white"
                    >
                        Back
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="font-medium">Bank Name</label>
                            <p>{bank.name || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Branch Name</label>
                            <p>{bank.branch_name || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">IFSC Code</label>
                            <p>{bank.ifsc_code || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">
                                Account Number
                            </label>
                            <p>{bank.account_number || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">
                                Account Holder Name
                            </label>
                            <p>{bank.account_holder_name || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Account Type</label>
                            <p>{bank.account_type || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Bank Address</label>
                            <p>{bank.bank_address || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Pincode</label>
                            <p>{bank.pincode || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">
                                Contact Number
                            </label>
                            <p>{bank.contact_number || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Email</label>
                            <p>{bank.email || '-'}</p>
                        </div>

                        <div>
                            <label className="font-medium">Status</label>
                            <p>{bank.active_status ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
