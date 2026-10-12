import { j as QualificationDefinition, Q as QualificationAdapter } from './types-N019xNht.js';

type DemoScenario = 'qualified' | 'not_qualified' | 'returning' | 'submission_error' | 'progress_error' | 'unavailable';
declare const DEMO_SCENARIOS: {
    value: DemoScenario;
    label: string;
}[];
declare const DEMO_QUALIFICATION: QualificationDefinition;
/** Network-free fixtures: scenario, never visitor answers, determines the demo decision. */
declare function createDemoQualificationAdapter(options?: {
    scenario?: DemoScenario;
    delayMs?: number;
}): QualificationAdapter;

export { DEMO_QUALIFICATION, DEMO_SCENARIOS, type DemoScenario, createDemoQualificationAdapter };
