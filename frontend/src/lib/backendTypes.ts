// Utility helpers for working with backend discriminated union types
// These are runtime values that match the TypeScript types from declarations/backend

import type { SOSType, Variant_closed_open_inProgress, FeedbackEntry } from 'declarations/backend';

// Extended definitions to include Supabase fields
export interface ExtendedFeedbackEntry extends Omit<FeedbackEntry, 'timestamp'> {
    id: bigint;
    timestamp: bigint;
}

// SOS Type constants (discriminated union values)
export const SOS_TYPES = {
    medical: { 'medical': null } as SOSType,
    fire: { 'fire': null } as SOSType,
    security: { 'security': null } as SOSType,
    other: { 'other': null } as SOSType,
} as const;

// Status constants (discriminated union values)
export const REPORT_STATUS = {
    open: { 'open': null } as Variant_closed_open_inProgress,
    inProgress: { 'inProgress': null } as Variant_closed_open_inProgress,
    closed: { 'closed': null } as Variant_closed_open_inProgress,
} as const;

// Helper functions to extract the variant key from discriminated unions
export function getSOSTypeKey(sosType: SOSType): string {
    if ('medical' in sosType) return 'medical';
    if ('fire' in sosType) return 'fire';
    if ('security' in sosType) return 'security';
    if ('other' in sosType) return 'other';
    return 'unknown';
}

export function getStatusKey(status: Variant_closed_open_inProgress): string {
    if ('open' in status) return 'open';
    if ('inProgress' in status) return 'inProgress';
    if ('closed' in status) return 'closed';
    return 'unknown';
}

// Helper to create status from string
export function createStatusFromString(status: string): Variant_closed_open_inProgress {
    switch (status.toLowerCase()) {
        case 'open':
            return REPORT_STATUS.open;
        case 'inprogress':
        case 'in progress':
            return REPORT_STATUS.inProgress;
        case 'closed':
            return REPORT_STATUS.closed;
        default:
            return REPORT_STATUS.open;
    }
}

// Helper to get display label for SOS type
export function getSOSTypeLabel(sosType: SOSType): string {
    const key = getSOSTypeKey(sosType);
    switch (key) {
        case 'medical':
            return 'Medical';
        case 'fire':
            return 'Fire';
        case 'security':
            return 'Security';
        case 'other':
            return 'Other';
        default:
            return 'Unknown';
    }
}

// Helper to get display label for status
export function getStatusLabel(status: Variant_closed_open_inProgress): string {
    const key = getStatusKey(status);
    switch (key) {
        case 'open':
            return 'Open';
        case 'inProgress':
            return 'In Progress';
        case 'closed':
            return 'Closed';
        default:
            return 'Unknown';
    }
}
