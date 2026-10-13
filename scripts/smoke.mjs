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

const { createPortalEnrollmentController, createDemoPortalEnrollmentAdapter } =
  await import('../dist/portal-demo.js');
const portalDemo = createDemoPortalEnrollmentAdapter({ delayMs: 0 });
const portal = createPortalEnrollmentController(portalDemo.adapter);
await portal.load();
portal.setContact('firstName', 'Demo');
portal.setContact('lastName', 'Applicant');
portal.setContact('email', 'demo@example.com');
portal.setAnswer('market', 'London');
portal.setAnswer('timing', 'Within 6 months');
await portal.submit();
await portal.signUp('DemoPassword!42');
assert.equal(portal.getSnapshot().phase, 'email_pending');
assert.equal(
  JSON.stringify(portal.getSnapshot()).includes('DemoPassword!42'),
  false
);
assert.equal((await portalDemo.simulateVerification()).kind, 'ready');
assert.equal(portal.getSnapshot().phase, 'email_pending');
console.log('Repository Portal prototype: password/email simulation passed.');
