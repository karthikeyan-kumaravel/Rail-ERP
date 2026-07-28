import {
    Award,
    BadgeCheck,
    BarChart3,
    Bell,
    Briefcase,
    Building2,
    Calculator,
    Calendar,
    ChartGantt,
    ClipboardCheck,
    ClipboardList,
    CreditCard,
    File,
    FileCheck2,
    FileSignature,
    FileSpreadsheet,
    FileText,
    Folder as FolderLucide,
    FolderKanban,
    Gavel,
    HardHat,
    Home as HomeLucide,
    Key as KeyLucide,
    Landmark,
    LayoutDashboard,
    LayoutGrid,
    LineChart,
    List as ListLucide,
    Map as MapLucide,
    Megaphone,
    Monitor,
    Package,
    Percent,
    PiggyBank,
    Receipt,
    ReceiptText,
    ScrollText,
    Settings as SettingsLucide,
    ShieldAlert,
    ShieldCheck,
    ShieldEllipsis,
    ShoppingCart,
    Store,
    TrainFront,
    TrainTrack,
    TrendingUp,
    Truck,
    User as UserLucide,
    UserCheck,
    Users as UsersLucide,
    Wallet,
    Warehouse,
    Waypoints,
    Wrench,
    MapPin,
} from 'lucide-react';
import type { SVGProps } from 'react';

export type IconProps = { className?: string };

const svg = (props: SVGProps<SVGSVGElement>) => ({
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
});

export const RailIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="4" y="3" width="16" height="13" rx="2" />
        <path d="M4 11h16" />
        <path d="M8 16l-2 4" />
        <path d="M16 16l2 4" />
        <circle cx="8" cy="13.5" r="0.5" fill="currentColor" />
        <circle cx="16" cy="13.5" r="0.5" fill="currentColor" />
    </svg>
);

export const HomeIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
);

export const AdminIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="m9.5 12 1.8 1.8L14.5 10" />
    </svg>
);

export const UsersIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const UserIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const ScreenIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
    </svg>
);

export const FolderIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
);

export const ListIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
    </svg>
);

export const SettingsIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
);

export const KeyIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="m10.5 12.5 8-8" />
        <path d="M15.5 7.5 18 10" />
        <path d="M18.5 4.5 21 7" />
    </svg>
);

export const GridIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

export const MapIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
    </svg>
);

export const BuildingIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
        <path d="M10 21v-4h4v4" />
    </svg>
);

export const TrainIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="5" y="3" width="14" height="12" rx="3" />
        <path d="M5 11h14" />
        <circle cx="8.5" cy="15.5" r="0.5" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="0.5" fill="currentColor" />
        <path d="m8 19-2 2M16 19l2 2" />
    </svg>
);

export const ChevronDownIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const ChevronRightIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className, 'aria-hidden': true, focusable: false })}>
        <path d="m9 6 6 6-6 6" />
    </svg>
);

export const PanelCollapseIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
        <path d="m14 10-2 2 2 2" />
    </svg>
);

export const MenuIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
    </svg>
);

export const XIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
    </svg>
);

export const LogoutIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </svg>
);

export const BellIcon = ({ className = 'h-5 w-5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

export const PencilIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className, 'aria-hidden': true, focusable: false })}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
);

export const TrashIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className, 'aria-hidden': true, focusable: false })}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
    </svg>
);

export const DocumentIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className, 'aria-hidden': true, focusable: false })}>
        <path d="M14 3v5a1 1 0 0 0 1 1h5" />
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M9 13h6M9 17h6" />
    </svg>
);

export const EyeIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <path d="M1 1l22 22" />
    </svg>
);

export const SunIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
);

export const MoonIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
);

export const MonitorIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
    </svg>
);

export const PaletteIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M12 3a9 8 0 0 0 0 16c1.1 0 2-.82 2-1.83 0-.48-.2-.92-.52-1.26-.32-.34-.52-.78-.52-1.28 0-1 .9-1.83 2-1.83h1.9c1.72 0 3.12-1.31 3.12-2.92C19.98 6.42 16.42 3 12 3Z" />
        <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const CheckIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="m5 12 5 5L20 7" />
    </svg>
);

export const RefreshIcon = ({ className = 'h-4 w-4' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M21 12a9 9 0 0 1-15.3 6.4M3 12a9 9 0 0 1 15.3-6.4" />
        <path d="M21 4v5h-5M3 20v-5h5" />
    </svg>
);

export const SidebarIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
    </svg>
);

export const LayoutTopIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
    </svg>
);

export const TypeIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M4 7V4h16v3" />
        <path d="M12 4v16M9 20h6" />
    </svg>
);

export const SquareIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
);

export const SparklesIcon = ({ className = 'h-4.5 w-4.5' }: IconProps) => (
    <svg {...svg({ className })}>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
);

/**
 * The full catalog of selectable screen/menu icons, rendered with Lucide.
 * Every key here must be mirrored exactly in `UserScreen::ICONS`
 * (app/Models/UserScreen.php) since that's the server-side `Rule::in(...)`
 * allow-list for the `icon` column — add/rename keys in both places together.
 */
export const ICONS = {
    home: HomeLucide,
    admin: ShieldCheck,
    users: UsersLucide,
    user: UserLucide,
    screen: Monitor,
    folder: FolderLucide,
    list: ListLucide,
    settings: SettingsLucide,
    key: KeyLucide,
    grid: LayoutGrid,
    map: MapLucide,
    building: Building2,
    train: TrainFront,
    station: MapPin,
    railway: Waypoints,
    track: TrainTrack,
    tender: Megaphone,
    bid: Gavel,
    boq: FileSpreadsheet,
    'bank-guarantee': BadgeCheck,
    loa: FileSignature,
    'work-order': FileCheck2,
    project: FolderKanban,
    'gantt-chart': ChartGantt,
    procurement: ShoppingCart,
    'purchase-order': ClipboardList,
    'material-supply': Truck,
    inspection: ClipboardCheck,
    inventory: Package,
    warehouse: Warehouse,
    'labour-management': HardHat,
    'daily-progress': TrendingUp,
    billing: ReceiptText,
    'bill-management': FileText,
    payment: CreditCard,
    'payment-tracker': Wallet,
    finance: PiggyBank,
    'cash-flow': LineChart,
    bank: Landmark,
    budget: Calculator,
    invoice: Receipt,
    tax: Percent,
    engineer: Wrench,
    contractor: Briefcase,
    vendor: Store,
    customer: UserCheck,
    document: File,
    reports: BarChart3,
    dashboard: LayoutDashboard,
    administration: ShieldEllipsis,
    notifications: Bell,
    calendar: Calendar,
    safety: ShieldAlert,
    quality: Award,
    compliance: ScrollText,
} as const;

export type IconKey = keyof typeof ICONS;

/**
 * Groups every IconKey into a labeled category for the searchable icon
 * picker (resources/js/lib/icon-picker.tsx). Purely a UI-organization
 * concern — it has no bearing on validation or storage.
 */
export const ICON_CATEGORIES: { label: string; icons: IconKey[] }[] = [
    {
        label: 'Overview & Navigation',
        icons: [
            'dashboard',
            'reports',
            'screen',
            'grid',
            'list',
            'folder',
            'home',
        ],
    },
    {
        label: 'Railway Infrastructure',
        icons: ['station', 'railway', 'track', 'train', 'map', 'building'],
    },
    {
        label: 'Tendering & Contracts',
        icons: ['tender', 'bid', 'boq', 'bank-guarantee', 'loa', 'work-order'],
    },
    {
        label: 'Project Execution',
        icons: [
            'project',
            'gantt-chart',
            'daily-progress',
            'inspection',
            'quality',
            'safety',
            'compliance',
        ],
    },
    {
        label: 'Procurement & Supply',
        icons: [
            'procurement',
            'purchase-order',
            'material-supply',
            'inventory',
            'warehouse',
        ],
    },
    {
        label: 'Finance & Billing',
        icons: [
            'billing',
            'bill-management',
            'payment',
            'payment-tracker',
            'finance',
            'cash-flow',
            'bank',
            'budget',
            'invoice',
            'tax',
        ],
    },
    {
        label: 'People & Access',
        icons: [
            'engineer',
            'contractor',
            'vendor',
            'customer',
            'labour-management',
            'users',
            'user',
            'admin',
            'administration',
            'key',
            'settings',
            'notifications',
            'calendar',
            'document',
        ],
    },
];

const ICON_LABELS: Record<IconKey, string> = {
    home: 'Home',
    admin: 'Admin / Shield',
    users: 'Users (group)',
    user: 'User (single)',
    screen: 'Screen / Monitor',
    folder: 'Folder',
    list: 'List',
    settings: 'Settings / Gear',
    key: 'Key / Permission',
    grid: 'Grid',
    map: 'Map / Location',
    building: 'Building / Division',
    train: 'Train',
    station: 'Station',
    railway: 'Railway',
    track: 'Track',
    tender: 'Tender',
    bid: 'Bid',
    boq: 'BOQ (Bill of Quantities)',
    'bank-guarantee': 'Bank Guarantee (BG)',
    loa: 'Letter of Acceptance (LOA)',
    'work-order': 'Work Order',
    project: 'Project',
    'gantt-chart': 'Gantt Chart',
    procurement: 'Procurement',
    'purchase-order': 'Purchase Order',
    'material-supply': 'Material Supply',
    inspection: 'Inspection',
    inventory: 'Inventory',
    warehouse: 'Warehouse',
    'labour-management': 'Labour Management',
    'daily-progress': 'Daily Progress',
    billing: 'Billing',
    'bill-management': 'Bill Management',
    payment: 'Payment',
    'payment-tracker': 'Payment Tracker',
    finance: 'Finance',
    'cash-flow': 'Cash Flow',
    bank: 'Bank',
    budget: 'Budget',
    invoice: 'Invoice',
    tax: 'Tax',
    engineer: 'Engineer',
    contractor: 'Contractor',
    vendor: 'Vendor',
    customer: 'Customer',
    document: 'Document',
    reports: 'Reports',
    dashboard: 'Dashboard',
    administration: 'Administration',
    notifications: 'Notifications',
    calendar: 'Calendar',
    safety: 'Safety',
    quality: 'Quality',
    compliance: 'Compliance',
};

export const ICON_OPTIONS: { value: IconKey; label: string }[] = (
    Object.keys(ICON_LABELS) as IconKey[]
).map((value) => ({ value, label: ICON_LABELS[value] }));

export function getIconLabel(name: string): string {
    return ICON_LABELS[name as IconKey] ?? name;
}

export function DynamicIcon({
    name,
    className = 'h-5 w-5',
}: {
    name: string;
    className?: string;
}) {
    const Icon = ICONS[name as IconKey] ?? LayoutGrid;

    return <Icon className={className} />;
}

/**
 * Fixed, semantic per-icon colors used for colorful icon chips (sidebar nav
 * and the icon picker). Independent of the Accent Color preference (which
 * instead drives the sidebar background/active states) so every item keeps
 * a distinct, recognizable hue.
 */
export const ICON_COLORS: Record<IconKey, string> = {
    home: '#60a5fa',
    admin: '#a78bfa',
    users: '#34d399',
    user: '#fb923c',
    screen: '#38bdf8',
    folder: '#fbbf24',
    list: '#94a3b8',
    settings: '#f472b6',
    key: '#facc15',
    grid: '#c084fc',
    map: '#f87171',
    building: '#22d3ee',
    train: '#fb7185',
    station: '#0ea5e9',
    railway: '#6366f1',
    track: '#14b8a6',
    tender: '#f59e0b',
    bid: '#ea580c',
    boq: '#84cc16',
    'bank-guarantee': '#10b981',
    loa: '#06b6d4',
    'work-order': '#3b82f6',
    project: '#8b5cf6',
    'gantt-chart': '#d946ef',
    procurement: '#f97316',
    'purchase-order': '#eab308',
    'material-supply': '#22c55e',
    inspection: '#0d9488',
    inventory: '#a855f7',
    warehouse: '#78716c',
    'labour-management': '#ca8a04',
    'daily-progress': '#2dd4bf',
    billing: '#ec4899',
    'bill-management': '#f43f5e',
    payment: '#4f46e5',
    'payment-tracker': '#0891b2',
    finance: '#16a34a',
    'cash-flow': '#65a30d',
    bank: '#7c3aed',
    budget: '#db2777',
    invoice: '#fca5a5',
    tax: '#dc2626',
    engineer: '#b45309',
    contractor: '#6b7280',
    vendor: '#0f766e',
    customer: '#059669',
    document: '#64748b',
    reports: '#2563eb',
    dashboard: '#4338ca',
    administration: '#9333ea',
    notifications: '#fde047',
    calendar: '#0284c7',
    safety: '#ef4444',
    quality: '#15803d',
    compliance: '#4b5563',
};

export function getIconColor(name: string): string {
    return ICON_COLORS[name as IconKey] ?? ICON_COLORS.grid;
}

export function IconChip({
    name,
    className = 'h-8 w-8',
    iconClassName = 'h-4 w-4',
}: {
    name: string;
    className?: string;
    iconClassName?: string;
}) {
    const color = getIconColor(name);

    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-lg ${className}`}
            style={{ backgroundColor: `${color}1f`, color }}
        >
            <DynamicIcon name={name} className={iconClassName} />
        </span>
    );
}
