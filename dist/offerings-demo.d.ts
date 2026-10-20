import { OfferingsAdapter } from './offerings.js';

type OfferingsDemoScenario = 'standard' | 'retry' | 'form_changed' | 'location_disabled' | 'ambiguous_territory' | 'unmatched_address';
declare const OFFERINGS_DEMO_SCENARIOS: OfferingsDemoScenario[];
declare function createDemoOfferingsAdapter({ industry, scenario, }?: {
    industry?: 'property' | 'catering';
    scenario?: OfferingsDemoScenario;
}): OfferingsAdapter;

export { OFFERINGS_DEMO_SCENARIOS, type OfferingsDemoScenario, createDemoOfferingsAdapter };
