type OfferingFieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
type OfferingField = {
    id: string;
    label: string;
    type: OfferingFieldType;
    required: boolean;
    options: string[];
    order: number;
};
type OfferingContact = {
    name: string;
    email: string | null;
    phone: string | null;
};
type OfferingAnswers = Record<string, string | number | boolean>;
type OfferingForm = {
    id: string;
    name: string;
    fields: OfferingField[];
};
type OfferingProfile = {
    name: string;
    description: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
};

type OfferingsBrandParams = {
    brandId: string;
};
type OfferingPublicLocation = {
    id: string;
    profile: OfferingProfile;
    intakeEnabled: boolean;
};
type OfferingsAddress = {
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: 'CA' | 'US';
};
type ResolveOfferingParams = OfferingsBrandParams & {
    offeringId: string;
    locationId?: string;
    address?: OfferingsAddress;
};
type OfferingDefinition = {
    offering: {
        id: string;
        name: string;
    };
    locationId: string | null;
    form: OfferingForm;
    version: string;
};
type SubmitOfferingParams = ResolveOfferingParams & {
    version: string;
    idempotencyKey: string;
    contact: OfferingContact;
    answers: OfferingAnswers;
};
type OfferingReceipt = {
    receiptId: string;
    status: 'received';
};

interface OfferingsAdapter {
    locations(): Promise<OfferingPublicLocation[]>;
    offerings(): Promise<{
        id: string;
        name: string;
    }[]>;
    resolve(input: Omit<ResolveOfferingParams, 'brandId'>): Promise<OfferingDefinition>;
    submit(input: Omit<SubmitOfferingParams, 'brandId'>): Promise<OfferingReceipt>;
}
declare function createLiveOfferingsAdapter({ apiBaseUrl, brandId, }: {
    apiBaseUrl: string;
    brandId: string;
}): OfferingsAdapter;
type OfferingsState = {
    phase: 'idle' | 'loading' | 'editing' | 'resolving' | 'submitting' | 'received' | 'error';
    locations: OfferingPublicLocation[];
    offerings: {
        id: string;
        name: string;
    }[];
    definition: OfferingDefinition | null;
    contact: OfferingContact;
    answers: OfferingAnswers;
    errors: Record<string, string>;
    error: string | null;
    receipt: OfferingReceipt | null;
    retryPending: boolean;
    errorCode: string | null;
    changedFields: string[];
};
declare function createOfferingsController(adapter: OfferingsAdapter, options?: {
    newId?: () => string;
}): {
    getSnapshot: () => OfferingsState;
    subscribe: (listener: () => void) => () => void;
    load(): Promise<void>;
    choose(input: Omit<ResolveOfferingParams, "brandId">): Promise<void>;
    contact(contact: OfferingContact): void;
    answer(id: string, value: string | number | boolean): void;
    submit(): Promise<void>;
    reloadForm(): Promise<void>;
    newEnquiry(): void;
};
type OfferingsController = ReturnType<typeof createOfferingsController>;
declare function useOfferings(controller: OfferingsController): OfferingsState;

export { type OfferingAnswers, type OfferingContact, type OfferingDefinition, type OfferingField, type OfferingPublicLocation, type OfferingReceipt, type OfferingsAdapter, type OfferingsAddress, type OfferingsController, type OfferingsState, createLiveOfferingsAdapter, createOfferingsController, useOfferings };
