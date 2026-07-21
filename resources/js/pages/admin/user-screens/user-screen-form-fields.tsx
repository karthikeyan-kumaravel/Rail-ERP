import IconPicker from '@/lib/icon-picker';

export type UserScreenFormData = {
    main_screen_id: number | '';
    screen_name: string;
    folder_name: string;
    order_no: number | '';
    icon: string;
    description: string;
    status: '1' | '0';
    can_add: boolean;
    can_update: boolean;
    can_list: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_cancel: boolean;
};

type MainScreenOption = { id: number; screen_name: string };

type UserScreenFormFieldsProps = {
    data: UserScreenFormData;
    setData: <K extends keyof UserScreenFormData>(
        key: K,
        value: UserScreenFormData[K],
    ) => void;
    errors: Partial<Record<keyof UserScreenFormData, string>>;
    mainScreens: MainScreenOption[];
};

const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass =
    'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

const actionFields: {
    key:
        | 'can_add'
        | 'can_update'
        | 'can_list'
        | 'can_delete'
        | 'can_view'
        | 'can_cancel';
    label: string;
}[] = [
    { key: 'can_add', label: 'Add' },
    { key: 'can_update', label: 'Update' },
    { key: 'can_list', label: 'List' },
    { key: 'can_delete', label: 'Delete' },
    { key: 'can_view', label: 'View' },
    { key: 'can_cancel', label: 'Cancel' },
];

export default function UserScreenFormFields({
    data,
    setData,
    errors,
    mainScreens,
}: UserScreenFormFieldsProps) {
    const allChecked = actionFields.every((field) => data[field.key]);

    const toggleAll = (checked: boolean) => {
        actionFields.forEach((field) => setData(field.key, checked));
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label htmlFor="main_screen_id" className={labelClass}>
                        Main Screen
                    </label>
                    <select
                        id="main_screen_id"
                        value={data.main_screen_id}
                        onChange={(event) =>
                            setData(
                                'main_screen_id',
                                event.target.value
                                    ? Number(event.target.value)
                                    : '',
                            )
                        }
                        className={inputClass}
                    >
                        <option value="">— Top level (Main Menu) —</option>
                        {mainScreens.map((mainScreen) => (
                            <option key={mainScreen.id} value={mainScreen.id}>
                                {mainScreen.screen_name}
                            </option>
                        ))}
                    </select>
                    {errors.main_screen_id && (
                        <p className={errorClass}>{errors.main_screen_id}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="screen_name" className={labelClass}>
                        Screen Name
                    </label>
                    <input
                        id="screen_name"
                        type="text"
                        value={data.screen_name}
                        onChange={(event) =>
                            setData('screen_name', event.target.value)
                        }
                        placeholder="e.g. User Type"
                        className={inputClass}
                    />
                    {errors.screen_name && (
                        <p className={errorClass}>{errors.screen_name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="folder_name" className={labelClass}>
                        Folder Name
                    </label>
                    <input
                        id="folder_name"
                        type="text"
                        value={data.folder_name}
                        onChange={(event) =>
                            setData('folder_name', event.target.value)
                        }
                        placeholder="e.g. user-types"
                        className={inputClass}
                    />
                    {errors.folder_name && (
                        <p className={errorClass}>{errors.folder_name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="order_no" className={labelClass}>
                        Order No
                    </label>
                    <input
                        id="order_no"
                        type="number"
                        min={0}
                        value={data.order_no}
                        onChange={(event) =>
                            setData(
                                'order_no',
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="e.g. 1"
                        className={inputClass}
                    />
                    {errors.order_no && (
                        <p className={errorClass}>{errors.order_no}</p>
                    )}
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label htmlFor="icon" className={labelClass}>
                        Icon
                    </label>
                    <IconPicker
                        id="icon"
                        value={data.icon}
                        onChange={(value) => setData('icon', value)}
                    />
                    {errors.icon && <p className={errorClass}>{errors.icon}</p>}
                </div>

                <div className="lg:col-span-2">
                    <label htmlFor="description" className={labelClass}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={1}
                        value={data.description}
                        onChange={(event) =>
                            setData('description', event.target.value)
                        }
                        placeholder="Optional description"
                        className={inputClass}
                    />
                    {errors.description && (
                        <p className={errorClass}>{errors.description}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="status" className={labelClass}>
                        Status
                    </label>
                    <select
                        id="status"
                        value={data.status}
                        onChange={(event) =>
                            setData(
                                'status',
                                event.target.value === '1' ? '1' : '0',
                            )
                        }
                        className={inputClass}
                    >
                        <option value="1">Active</option>
                        <option value="0">In active</option>
                    </select>
                    {errors.status && (
                        <p className={errorClass}>{errors.status}</p>
                    )}
                </div>
            </div>

            <div>
                <span className={labelClass}>Actions</span>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                        <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={(event) =>
                                toggleAll(event.target.checked)
                            }
                            className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
                        />
                        All
                    </label>
                    {actionFields.map((field) => (
                        <label
                            key={field.key}
                            className="flex items-center gap-2 text-sm text-[var(--color-ink)]"
                        >
                            <input
                                type="checkbox"
                                checked={data[field.key]}
                                onChange={(event) =>
                                    setData(field.key, event.target.checked)
                                }
                                className="h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40"
                            />
                            {field.label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
