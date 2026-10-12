import { Q as QualificationAdapter, a as QualificationEvent, b as QualificationController, c as QualificationState, d as QualificationSdk, e as QualificationSite } from './types-N019xNht.js';
export { F as FieldSubmissionValue, j as QualificationDefinition, f as QualificationFieldType, g as QualificationIdentity, l as QualificationNext, k as QualificationOutcome, i as QualificationPage, m as QualificationPhase, h as QualificationQuestion } from './types-N019xNht.js';

declare const ATTRIBUTION_KEYS: readonly ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
type QualificationAttribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;
/** Supply the host page's query string explicitly; never collect arbitrary URL parameters. */
declare function readQualificationAttribution(search: string): QualificationAttribution;

declare function createQualificationController(options: {
    adapter: QualificationAdapter;
    attribution?: QualificationAttribution;
    onEvent?: (event: QualificationEvent) => void;
}): QualificationController;

/** Create the controller once per form instance, outside render or with useState. */
declare function useQualification(controller: QualificationController): {
    state: QualificationState;
    actions: QualificationController;
};

/** Pass the public SDK's funnel service, never an admin API key. */
declare function createSdkQualificationAdapter(options: {
    funnel: QualificationSdk;
    site: QualificationSite;
}): QualificationAdapter;

declare const FUNNEL_CONTACT_BLOCK_FIELDS: {
    key: 'firstName' | 'lastName' | 'email' | 'phone';
    label: string;
    autoComplete: string;
    inputType: 'text' | 'email' | 'tel';
}[];
declare const FUNNEL_SMS_CONSENT_COPY: string;
declare function funnelSmsConsentAnchorFieldId(fields: readonly {
    id: string;
    type: string;
}[]): string | null;

/** Public, no-cookie SDK transport; no platform credentials are needed. */
declare function createLiveQualificationAdapter(options: {
    apiBaseUrl: string;
    site: QualificationSite;
}): QualificationAdapter;

export { FUNNEL_CONTACT_BLOCK_FIELDS, FUNNEL_SMS_CONSENT_COPY, QualificationAdapter, type QualificationAttribution, QualificationController, QualificationEvent, QualificationSdk, QualificationSite, QualificationState, createLiveQualificationAdapter, createQualificationController, createSdkQualificationAdapter, funnelSmsConsentAnchorFieldId, readQualificationAttribution, useQualification };
