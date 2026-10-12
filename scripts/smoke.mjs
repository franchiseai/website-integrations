import assert from 'node:assert/strict';
import {
  createQualificationController,
  createLiveQualificationAdapter,
  FUNNEL_CONTACT_BLOCK_FIELDS,
} from '../dist/index.js';
import { createDemoQualificationAdapter } from '../dist/demo.js';
assert.equal(typeof createLiveQualificationAdapter, 'function');
assert.equal(FUNNEL_CONTACT_BLOCK_FIELDS.length, 3);
const controller = createQualificationController({
  adapter: createDemoQualificationAdapter({ delayMs: 0 }),
});
await controller.load();
assert.equal(controller.getSnapshot().phase, 'editing');
controller.setIdentity('firstName', 'Demo');
controller.setIdentity('lastName', 'Applicant');
controller.setIdentity('email', 'demo@example.com');
controller.setAnswer('market', 'London');
controller.setAnswer('timing', 'Within 6 months');
await controller.submit();
assert.equal(controller.getSnapshot().pageIndex, 1);
controller.setAnswer('investment', '$250k–$500k');
controller.setAnswer('experience', 'This would be my first');
await controller.submit();
assert.equal(controller.getSnapshot().outcome, 'qualified');
await controller.continue();
assert.equal(controller.getSnapshot().phase, 'complete');
console.log('Packed integration: demo qualification and continuation passed.');
