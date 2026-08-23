import type { StringKey } from '@/lib/i18n';
import type { ApplicationStatus } from '@/types';

export const STATUS_LABEL: Record<ApplicationStatus, StringKey> = {
  discovered: 'stDiscovered',
  preparing: 'stPreparing',
  ready: 'stReady',
  submitted: 'stSubmitted',
  under_review: 'stUnderReview',
  additional_information_required: 'stAddInfo',
  approved: 'stApproved',
  rejected: 'stRejected',
  completed: 'stCompleted',
};

export const STATUS_TONE: Record<ApplicationStatus, 'grey' | 'navy' | 'leaf' | 'amber' | 'alert'> = {
  discovered: 'grey',
  preparing: 'navy',
  ready: 'leaf',
  submitted: 'navy',
  under_review: 'amber',
  additional_information_required: 'amber',
  approved: 'leaf',
  rejected: 'alert',
  completed: 'leaf',
};

interface Advance {
  status: ApplicationStatus;
  labelKey: StringKey;
}

/** The status changes offered from each status — the user drives these. */
export const ADVANCE: Record<ApplicationStatus, Advance[]> = {
  discovered: [
    { status: 'ready', labelKey: 'actMarkReady' },
    { status: 'submitted', labelKey: 'actMarkSubmitted' },
  ],
  preparing: [
    { status: 'ready', labelKey: 'actMarkReady' },
    { status: 'submitted', labelKey: 'actMarkSubmitted' },
  ],
  ready: [{ status: 'submitted', labelKey: 'actMarkSubmitted' }],
  submitted: [
    { status: 'under_review', labelKey: 'actMarkUnderReview' },
    { status: 'approved', labelKey: 'actMarkApproved' },
    { status: 'additional_information_required', labelKey: 'actMarkAddInfo' },
    { status: 'rejected', labelKey: 'actMarkRejected' },
  ],
  under_review: [
    { status: 'approved', labelKey: 'actMarkApproved' },
    { status: 'additional_information_required', labelKey: 'actMarkAddInfo' },
    { status: 'rejected', labelKey: 'actMarkRejected' },
  ],
  additional_information_required: [
    { status: 'submitted', labelKey: 'actMarkSubmitted' },
    { status: 'approved', labelKey: 'actMarkApproved' },
  ],
  approved: [{ status: 'completed', labelKey: 'actMarkCompleted' }],
  rejected: [],
  completed: [],
};

const SUBMITTED_FLOW: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'additional_information_required',
  'approved',
  'completed',
];

export const showsNextSteps = (status: ApplicationStatus): boolean =>
  SUBMITTED_FLOW.includes(status);
