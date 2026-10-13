type PortalContact = {
    firstName: string;
    lastName: string;
    email: string;
};
type PortalMethod = 'email' | 'google' | 'linkedin';
type PortalQuestion = {
    id: string;
    label: string;
    type: 'text' | 'select';
    required: boolean;
    options?: string[];
};
type PortalDefinition = {
    brandName: string;
    questions: PortalQuestion[];
    methods: PortalMethod[];
};
type PortalIntake = {
    contact: PortalContact;
    answers: Record<string, string>;
    marketingConsent: boolean;
};
interface PortalEnrollmentAdapter {
    load(): Promise<PortalDefinition>;
    saveIntake(intake: PortalIntake): Promise<{
        qualified: boolean;
    }>;
    signUp(password: string): Promise<{
        kind: 'verification_pending';
        resendAt: number;
    } | {
        kind: 'sign_in_required';
    }>;
    resendEmail(): Promise<{
        resendAt: number;
    }>;
    startOAuth(provider: 'google' | 'linkedin'): Promise<void>;
}
type PortalEnrollmentState = PortalIntake & {
    phase: 'idle' | 'loading' | 'load_error' | 'editing' | 'saving' | 'choose_method' | 'requesting' | 'email_pending' | 'provider_pending' | 'sign_in_required';
    definition: PortalDefinition | null;
    qualified: boolean | null;
    method: PortalMethod | null;
    fieldErrors: Record<string, string>;
    error: string | null;
    resendAt: number;
};
declare function createPortalEnrollmentController(adapter: PortalEnrollmentAdapter): {
    getSnapshot: () => PortalEnrollmentState;
    subscribe(listener: () => void): () => void;
    load: () => Promise<void>;
    submit: () => Promise<void>;
    signUp: (password: string) => Promise<void>;
    resendEmail: () => Promise<void>;
    startOAuth: (provider: "google" | "linkedin") => Promise<void>;
    setContact(key: keyof PortalContact, value: string): void;
    setAnswer(id: string, value: string): void;
    setMarketingConsent(value: boolean): void;
    back(): void;
    cancelOAuth(): void;
};
type PortalEnrollmentController = ReturnType<typeof createPortalEnrollmentController>;
declare function usePortalEnrollment(controller: PortalEnrollmentController): {
    state: PortalEnrollmentState;
    actions: {
        getSnapshot: () => PortalEnrollmentState;
        subscribe(listener: () => void): () => void;
        load: () => Promise<void>;
        submit: () => Promise<void>;
        signUp: (password: string) => Promise<void>;
        resendEmail: () => Promise<void>;
        startOAuth: (provider: "google" | "linkedin") => Promise<void>;
        setContact(key: keyof PortalContact, value: string): void;
        setAnswer(id: string, value: string): void;
        setMarketingConsent(value: boolean): void;
        back(): void;
        cancelOAuth(): void;
    };
};

declare const PORTAL_SCENARIOS: readonly [{
    readonly value: "new";
    readonly label: "New applicant";
}, {
    readonly value: "returning";
    readonly label: "Returning applicant";
}, {
    readonly value: "mismatch";
    readonly label: "Provider email differs";
}, {
    readonly value: "expired";
    readonly label: "Expired email link";
}, {
    readonly value: "revoked";
    readonly label: "Portal access unavailable";
}, {
    readonly value: "save_error";
    readonly label: "Save fails once";
}, {
    readonly value: "email_error";
    readonly label: "Account request fails once";
}, {
    readonly value: "not_qualified";
    readonly label: "Needs a conversation";
}];
type PortalDemoScenario = (typeof PORTAL_SCENARIOS)[number]['value'];
type PortalDemoResult = {
    kind: 'ready';
    email: string;
    firstName: string;
    market: string;
    returning: boolean;
    method: PortalMethod;
} | {
    kind: 'expired';
} | {
    kind: 'revoked';
} | {
    kind: 'mismatch';
    enteredEmail: string;
    providerEmail: string;
};
/** Local simulation only. These controls model a separate email/provider/Portal surface. */
declare function createDemoPortalEnrollmentAdapter(options?: {
    scenario?: PortalDemoScenario;
    delayMs?: number;
    cooldownMs?: number;
}): {
    adapter: PortalEnrollmentAdapter;
    /** Does not verify identity, send email, contact providers or create a session. */
    simulateVerification(): Promise<PortalDemoResult>;
};

export { PORTAL_SCENARIOS, type PortalContact, type PortalDemoResult, type PortalDemoScenario, type PortalEnrollmentAdapter, type PortalEnrollmentController, type PortalEnrollmentState, type PortalMethod, createDemoPortalEnrollmentAdapter, createPortalEnrollmentController, usePortalEnrollment };
