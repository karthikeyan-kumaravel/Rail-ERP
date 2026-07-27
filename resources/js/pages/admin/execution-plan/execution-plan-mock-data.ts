export type PhaseId =
    | 'mobilization'
    | 'design'
    | 'procurement'
    | 'civil'
    | 'installation'
    | 'testing'
    | 'billing'
    | 'handover';

export type Phase = {
    id: PhaseId;
    name: string;
    barClass: string;
    badgeClass: string;
};

export const PHASES: Phase[] = [
    {
        id: 'mobilization',
        name: 'Mobilization',
        barClass: 'bg-purple-600',
        badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
    },
    {
        id: 'design',
        name: 'Design',
        barClass: 'bg-teal-600',
        badgeClass: 'border-teal-200 bg-teal-50 text-teal-700',
    },
    {
        id: 'procurement',
        name: 'Procurement',
        barClass: 'bg-amber-700',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
        id: 'civil',
        name: 'Civil Works',
        barClass: 'bg-slate-700',
        badgeClass: 'border-slate-200 bg-slate-50 text-slate-600',
    },
    {
        id: 'installation',
        name: 'Installation',
        barClass: 'bg-blue-600',
        badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
        id: 'testing',
        name: 'Testing & Commissioning',
        barClass: 'bg-emerald-600',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    {
        id: 'billing',
        name: 'Billing',
        barClass: 'bg-orange-500',
        badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
    },
    {
        id: 'handover',
        name: 'Handover',
        barClass: 'bg-rose-600',
        badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
    },
];

export type GanttTask = {
    id: string;
    phaseId: PhaseId;
    name: string;
    startMonth: number;
    durationMonths: number;
    percentComplete: number;
};

export const TOTAL_MONTHS = 18;
export const TODAY_ELAPSED_MONTHS = 19;

export const GANTT_TASKS: GanttTask[] = [
    {
        id: 'mob-loa-signing',
        phaseId: 'mobilization',
        name: 'LOA Signing & Site Mobilization',
        startMonth: 1,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'mob-bg-submission',
        phaseId: 'mobilization',
        name: 'BG Submission & Mob. Advance Receipt',
        startMonth: 1,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'mob-site-office',
        phaseId: 'mobilization',
        name: 'Site Office Setup & Team Deployment',
        startMonth: 1,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'design-survey',
        phaseId: 'design',
        name: 'Topographic Survey — All 20 Stations',
        startMonth: 1,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'design-ga-drawing',
        phaseId: 'design',
        name: 'GA Drawing Preparation & Submission',
        startMonth: 2,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'design-approval',
        phaseId: 'design',
        name: 'Drawing Approval from Railway (DRM)',
        startMonth: 3,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'proc-cameras-ups',
        phaseId: 'procurement',
        name: 'PO Placement — Cameras & UPS',
        startMonth: 2,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'proc-ofc-hdpe',
        phaseId: 'procurement',
        name: 'PO Placement — OFC & HDPE Pipe',
        startMonth: 2,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'proc-nvr-switch-rack',
        phaseId: 'procurement',
        name: 'PO Placement — NVR, Switch, Rack',
        startMonth: 2,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'proc-inspection',
        phaseId: 'procurement',
        name: 'RDSO / RITES Inspection',
        startMonth: 3,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'proc-material-delivery',
        phaseId: 'procurement',
        name: 'Material Delivery to Site Stores',
        startMonth: 4,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'civil-hdpe-laying',
        phaseId: 'civil',
        name: 'HDPE Pipe Laying — All Stations',
        startMonth: 5,
        durationMonths: 5,
        percentComplete: 0,
    },
    {
        id: 'civil-cable-tray',
        phaseId: 'civil',
        name: 'Cable Tray & Conduit Work',
        startMonth: 5,
        durationMonths: 4,
        percentComplete: 0,
    },
    {
        id: 'civil-pole-foundation',
        phaseId: 'civil',
        name: 'Pole Foundation & Erection',
        startMonth: 5,
        durationMonths: 4,
        percentComplete: 0,
    },
    {
        id: 'install-ofc',
        phaseId: 'installation',
        name: 'OFC Laying, Splicing & Testing',
        startMonth: 5,
        durationMonths: 5,
        percentComplete: 0,
    },
    {
        id: 'install-ups',
        phaseId: 'installation',
        name: 'UPS Installation & Power Connections',
        startMonth: 6,
        durationMonths: 5,
        percentComplete: 0,
    },
    {
        id: 'install-rack-nvr',
        phaseId: 'installation',
        name: 'Network Rack, Switch & NVR Setup',
        startMonth: 7,
        durationMonths: 5,
        percentComplete: 0,
    },
    {
        id: 'install-camera',
        phaseId: 'installation',
        name: 'IP Camera Installation — All Stations',
        startMonth: 7,
        durationMonths: 6,
        percentComplete: 0,
    },
    {
        id: 'test-station',
        phaseId: 'testing',
        name: 'Individual Station Testing',
        startMonth: 11,
        durationMonths: 3,
        percentComplete: 0,
    },
    {
        id: 'test-network',
        phaseId: 'testing',
        name: 'End-to-End Network Integration Testing',
        startMonth: 12,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'test-sat',
        phaseId: 'testing',
        name: 'Site Acceptance Test (SAT) with Railway',
        startMonth: 13,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'billing-ra',
        phaseId: 'billing',
        name: 'Running Account Bills (RA Billing)',
        startMonth: 3,
        durationMonths: 13,
        percentComplete: 0,
    },
    {
        id: 'billing-final',
        phaseId: 'billing',
        name: 'Final Bill Submission',
        startMonth: 16,
        durationMonths: 1,
        percentComplete: 0,
    },
    {
        id: 'handover-asbuilt',
        phaseId: 'handover',
        name: 'As-Built Drawings & O&M Manual',
        startMonth: 14,
        durationMonths: 3,
        percentComplete: 0,
    },
    {
        id: 'handover-training',
        phaseId: 'handover',
        name: 'Client Training & Knowledge Transfer',
        startMonth: 16,
        durationMonths: 2,
        percentComplete: 0,
    },
    {
        id: 'handover-completion',
        phaseId: 'handover',
        name: 'Formal Handover & Completion Certificate',
        startMonth: 17,
        durationMonths: 2,
        percentComplete: 0,
    },
];

export type ChecklistItem = {
    id: string;
    label: string;
    checked: boolean;
};

export const PRE_START_CHECKLIST: ChecklistItem[] = [
    {
        id: 'loa-scope',
        label: 'Receive LOA & verify scope, value, completion period',
        checked: false,
    },
    {
        id: 'bank-account',
        label: 'Open dedicated project bank account',
        checked: false,
    },
    {
        id: 'pbg',
        label: 'Submit Performance Bank Guarantee (PBG)',
        checked: false,
    },
    {
        id: 'mob-advance',
        label: 'Collect Mobilization Advance (if applicable)',
        checked: false,
    },
    {
        id: 'appoint-team',
        label: 'Appoint Project Manager, Site Engineer, Billing Engineer',
        checked: false,
    },
    {
        id: 'drm-registration',
        label: 'Register with local Railway division (DRM office)',
        checked: false,
    },
    {
        id: 'site-access',
        label: 'Obtain site access permissions & safety clearances',
        checked: false,
    },
    {
        id: 'site-office',
        label: 'Set up project site office at Ranchi / key station',
        checked: false,
    },
    {
        id: 'survey-deployment',
        label: 'Initiate survey team deployment to all 20 stations',
        checked: false,
    },
    {
        id: 'inspectors',
        label: 'Engage RDSO/RITES approved inspectors for procurement',
        checked: false,
    },
    {
        id: 'rfqs',
        label: 'Float RFQs / finalize OEM vendor agreements',
        checked: false,
    },
    {
        id: 'micro-schedule',
        label: 'Prepare micro-level execution schedule (this Gantt)',
        checked: false,
    },
];

export type MilestoneStatus =
    'Past' | 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';

export type Milestone = {
    id: string;
    month: number;
    targetDate: string;
    milestone: string;
    phaseId: PhaseId;
    status: MilestoneStatus;
};

export const MILESTONES: Milestone[] = [
    {
        id: 'm1',
        month: 1,
        targetDate: 'Apr 2024',
        milestone: 'Mob. advance received + POs placed',
        phaseId: 'mobilization',
        status: 'Past',
    },
    {
        id: 'm3',
        month: 3,
        targetDate: 'Jun 2024',
        milestone: 'Drawing approval from Railway (DRM)',
        phaseId: 'design',
        status: 'Past',
    },
    {
        id: 'm4',
        month: 4,
        targetDate: 'Jul 2024',
        milestone: 'All material delivery to site stores',
        phaseId: 'procurement',
        status: 'Past',
    },
    {
        id: 'm6',
        month: 6,
        targetDate: 'Sept 2024',
        milestone: '50% HDPE & civil work completed',
        phaseId: 'civil',
        status: 'Past',
    },
    {
        id: 'm8',
        month: 8,
        targetDate: 'Nov 2024',
        milestone: 'First 5 stations fully installed',
        phaseId: 'installation',
        status: 'Past',
    },
    {
        id: 'm12',
        month: 12,
        targetDate: 'Mar 2025',
        milestone: 'All 20 stations installation done',
        phaseId: 'installation',
        status: 'Past',
    },
    {
        id: 'm14',
        month: 14,
        targetDate: 'May 2025',
        milestone: 'End-to-end testing complete',
        phaseId: 'testing',
        status: 'Past',
    },
    {
        id: 'm16',
        month: 16,
        targetDate: 'Jul 2025',
        milestone: 'SAT passed — Railway acceptance',
        phaseId: 'testing',
        status: 'Past',
    },
    {
        id: 'm17',
        month: 17,
        targetDate: 'Aug 2025',
        milestone: 'Final bill submitted',
        phaseId: 'billing',
        status: 'Past',
    },
    {
        id: 'm18',
        month: 18,
        targetDate: 'Sept 2025',
        milestone: 'Project handover & completion cert.',
        phaseId: 'handover',
        status: 'Past',
    },
];

export const PROJECT_INFO = {
    projectNo: 'RAILWAY/RAN/2024/001',
    startDate: '2024-04-01',
    endDate: '2025-10-01',
    duration: '18 months',
};

/**
 * Schedule Progress and Plan vs Schedule are time-elapsed-vs-plan figures,
 * not derived from task completion — the project is already well past its
 * originally planned 18-month window, so these are carried as fixed values
 * alongside the rest of the mock data rather than computed from
 * GANTT_TASKS.
 */
export const SCHEDULE_PROGRESS_PERCENT = 100;
export const SCHEDULE_PROGRESS_SUBTITLE = 'M27 of M18';
export const PLAN_VS_SCHEDULE_LABEL = 'Review';
