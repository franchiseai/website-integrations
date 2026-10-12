/** Stable browser-facing shapes, independent of platform database declarations. */
type FieldSubmissionValue = string | number | boolean | string[] | null | undefined;
type QualificationFieldType = 'short-text' | 'long-text' | 'number' | 'currency' | 'date' | 'url' | 'email' | 'phone' | 'multiselect' | 'singleselect' | 'dropdown' | 'boolean';
type ValidatableField = {
    id: string;
    type: QualificationFieldType;
    question?: string | null;
    name?: string | null;
    required?: boolean | null;
    options?: string[] | null;
};
interface CreateFranLiteLeadParams {
    brandId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    netWorth?: string;
    timeframeToLaunch?: string;
    interestedMarkets?: string;
    utmParams?: string;
    smsConsent?: boolean;
}
type CreateFranLiteLeadReturn = {
    status: 'created';
    applicationId: string;
} | {
    status: 'resume_link_sent';
};
interface SubmitFunnelFormParams {
    applicationId: string;
    kind: 'qualifier';
    submissions: {
        fieldId: string;
        value: FieldSubmissionValue;
    }[];
    pageId?: string;
    complete?: boolean;
    smsConsent?: boolean;
}
interface SubmitFunnelFormReturn {
    qualified?: boolean;
}
type QualificationSite = {
    slug: string;
    host?: never;
} | {
    host: string;
    slug?: never;
};
interface QualificationSdk {
    getSiteInfo(site: QualificationSite): Promise<{
        brandId: string;
        name?: string;
        qualifierFormId: string | null;
        smsOptInEnabled?: boolean;
        funnelDoc?: {
            entryStepId: string;
            nodes: {
                id: string;
                config: {
                    type: string;
                };
            }[];
        } | null;
    } | null>;
    getForm(params: QualificationSite & {
        kind: 'qualifier';
    }): Promise<{
        pages: {
            id: string;
            title: string | null;
            subtitle?: string | null;
            fields: (ValidatableField & {
                dataLocation?: string | null;
                description?: string | null;
            })[];
        }[];
    } | null>;
    createLead(params: CreateFranLiteLeadParams): Promise<CreateFranLiteLeadReturn>;
    updateLead(params: {
        applicationId: string;
        updates: {
            firstName: string;
            lastName: string;
            phone?: string;
        };
    }): Promise<unknown>;
    submitForm(params: SubmitFunnelFormParams): Promise<SubmitFunnelFormReturn>;
    saveProgress(params: {
        applicationId: string;
        nodeId: string;
        outcome: 'qualified' | 'not_qualified';
    }): Promise<unknown>;
    resolveEntry(params: {
        applicationId: string;
    }): Promise<{
        entryNodeId: string;
    }>;
}

type QualificationIdentity = {
    firstName: string;
    lastName: string;
    email: string;
};
type QualificationQuestion = ValidatableField & {
    description?: string | null;
    dataLocation?: string | null;
};
type QualificationPage = {
    id: string;
    title: string;
    description?: string | null;
    questions: QualificationQuestion[];
};
type QualificationDefinition = {
    brandId: string;
    nodeId: string;
    title: string;
    hasForm: boolean;
    smsOptInEnabled: boolean;
    pages: QualificationPage[];
};
type QualificationOutcome = 'qualified' | 'not_qualified';
type QualificationNext = {
    nodeId: string;
};
/** Only adapters handle application credentials. Never expose these in URLs or events. */
interface QualificationAdapter {
    load(): Promise<QualificationDefinition>;
    createLead(params: CreateFranLiteLeadParams): Promise<CreateFranLiteLeadReturn>;
    updateLead(applicationId: string, identity: QualificationIdentity, phone?: string): Promise<void>;
    submitPage(params: SubmitFunnelFormParams): Promise<SubmitFunnelFormReturn>;
    complete(applicationId: string, nodeId: string, outcome: QualificationOutcome): Promise<QualificationNext>;
    continue(applicationId: string, identity: QualificationIdentity): Promise<void>;
}
type QualificationPhase = 'idle' | 'loading' | 'load_error' | 'editing' | 'submitting' | 'completion_error' | 'outcome' | 'continuing' | 'complete' | 'resume_link_sent' | 'portal_required';
type QualificationState = {
    phase: QualificationPhase;
    definition: QualificationDefinition | null;
    pageIndex: number;
    identity: QualificationIdentity;
    answers: Record<string, FieldSubmissionValue>;
    identityLocked: boolean;
    smsConsent: boolean;
    fieldErrors: Record<string, string>;
    error: string | null;
    retryAt: number | null;
    outcome: QualificationOutcome | null;
    next: QualificationNext | null;
    portalUrl: string | null;
};
type QualificationEvent = {
    type: 'loaded' | 'lead_created' | 'page_saved' | 'qualified' | 'not_qualified' | 'continuation_requested' | 'resume_link_sent' | 'submission_failed';
    nodeId?: string;
    pageId?: string;
};
interface QualificationController {
    getSnapshot(): QualificationState;
    subscribe(listener: () => void): () => void;
    load(): Promise<void>;
    setIdentity(key: keyof QualificationIdentity, value: string): void;
    setAnswer(fieldId: string, value: FieldSubmissionValue): void;
    setSmsConsent(value: boolean): void;
    back(): void;
    submit(): Promise<void>;
    continue(): Promise<void>;
    useDifferentEmail(): void;
}

export type { FieldSubmissionValue as F, QualificationAdapter as Q, QualificationEvent as a, QualificationController as b, QualificationState as c, QualificationSdk as d, QualificationSite as e, QualificationFieldType as f, QualificationIdentity as g, QualificationQuestion as h, QualificationPage as i, QualificationDefinition as j, QualificationOutcome as k, QualificationNext as l, QualificationPhase as m };
