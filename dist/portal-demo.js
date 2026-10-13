import { useSyncExternalStore, useEffect } from 'react';
import { z } from 'zod';

// src/portal.ts
function createPortalEnrollmentController(adapter) {
  let state = {
    phase: "idle",
    definition: null,
    qualified: null,
    method: null,
    contact: { firstName: "", lastName: "", email: "" },
    answers: {},
    marketingConsent: false,
    fieldErrors: {},
    error: null,
    resendAt: 0
  };
  const listeners = /* @__PURE__ */ new Set();
  const update = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const load = async () => {
    if (state.phase !== "idle" && state.phase !== "load_error") return;
    update({ phase: "loading", error: null });
    try {
      update({ definition: await adapter.load(), phase: "editing" });
    } catch {
      update({
        phase: "load_error",
        error: "We could not load this opportunity. Please try again."
      });
    }
  };
  const submit = async () => {
    if (state.phase !== "editing" || !state.definition) return;
    const fieldErrors = {};
    const contact = {
      firstName: state.contact.firstName.trim(),
      lastName: state.contact.lastName.trim(),
      email: state.contact.email.trim()
    };
    if (!contact.firstName) fieldErrors.firstName = "Enter your first name.";
    if (!contact.lastName) fieldErrors.lastName = "Enter your last name.";
    if (!z.string().email().safeParse(contact.email).success)
      fieldErrors.email = "Enter a valid email address.";
    for (const question of state.definition.questions) {
      const answer = state.answers[question.id]?.trim();
      if (question.required && !answer)
        fieldErrors[question.id] = "Please answer this question.";
      else if (answer && question.type === "select" && !question.options?.includes(answer))
        fieldErrors[question.id] = "Choose one of the available options.";
    }
    update({ fieldErrors, contact, error: null });
    if (Object.keys(fieldErrors).length) return;
    update({ phase: "saving" });
    try {
      const result = await adapter.saveIntake({
        contact: { ...contact },
        answers: { ...state.answers },
        marketingConsent: state.marketingConsent
      });
      update({ phase: "choose_method", qualified: result.qualified });
    } catch {
      update({
        phase: "editing",
        error: "Your details could not be saved. Your answers are still here; please try again."
      });
    }
  };
  const signUp = async (password) => {
    if (state.phase !== "choose_method" || !state.definition?.methods.includes("email"))
      return;
    if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      update({
        fieldErrors: {
          password: "Use 10+ characters with uppercase, lowercase, a number and a special character."
        }
      });
      return;
    }
    update({
      phase: "requesting",
      method: "email",
      error: null,
      fieldErrors: {}
    });
    try {
      const result = await adapter.signUp(password);
      update(
        result.kind === "sign_in_required" ? { phase: "sign_in_required" } : { resendAt: result.resendAt, phase: "email_pending" }
      );
    } catch {
      update({
        phase: "choose_method",
        error: "We could not create your account. Please try again."
      });
    }
  };
  const resendEmail = async () => {
    if (state.phase !== "email_pending" || Date.now() < state.resendAt) return;
    update({ phase: "requesting", error: null });
    try {
      update({ ...await adapter.resendEmail(), phase: "email_pending" });
    } catch {
      update({
        phase: "email_pending",
        error: "We could not resend your confirmation email. Please try again."
      });
    }
  };
  const startOAuth = async (provider) => {
    if (state.phase !== "choose_method" || !state.definition?.methods.includes(provider))
      return;
    update({ phase: "requesting", method: provider, error: null });
    try {
      await adapter.startOAuth(provider);
      update({ phase: "provider_pending" });
    } catch {
      update({
        phase: "choose_method",
        error: "Sign-in could not be started. Try again or use email."
      });
    }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    submit,
    signUp,
    resendEmail,
    startOAuth,
    setContact(key, value) {
      if (state.phase === "editing")
        update({ contact: { ...state.contact, [key]: value } });
    },
    setAnswer(id, value) {
      if (state.phase === "editing" && state.definition?.questions.some((q) => q.id === id))
        update({ answers: { ...state.answers, [id]: value } });
    },
    setMarketingConsent(value) {
      if (state.phase === "editing") update({ marketingConsent: value });
    },
    back() {
      if (state.phase === "choose_method")
        update({ phase: "editing", qualified: null, error: null });
    },
    cancelOAuth() {
      if (state.phase === "provider_pending")
        update({ phase: "choose_method", method: null, error: null });
    }
  };
}
function usePortalEnrollment(controller) {
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  );
  useEffect(() => {
    void controller.load();
  }, [controller]);
  return { state, actions: controller };
}

// src/portal-demo.ts
var PORTAL_SCENARIOS = [
  { value: "new", label: "New applicant" },
  { value: "returning", label: "Returning applicant" },
  { value: "mismatch", label: "Provider email differs" },
  { value: "expired", label: "Expired email link" },
  { value: "revoked", label: "Portal access unavailable" },
  { value: "save_error", label: "Save fails once" },
  { value: "email_error", label: "Account request fails once" },
  { value: "not_qualified", label: "Needs a conversation" }
];
function createDemoPortalEnrollmentAdapter(options = {}) {
  const scenario = options.scenario ?? "new";
  let intake = null;
  let method = null;
  let savedOnce = false;
  let emailFailedOnce = false;
  let expiredOnce = false;
  let emailExpired = false;
  let redeemed = false;
  let resendAt = 0;
  const wait = () => new Promise((resolve) => setTimeout(resolve, options.delayMs ?? 300));
  const adapter = {
    async load() {
      await wait();
      return {
        brandName: "Northstar",
        methods: ["email", "google", "linkedin"],
        questions: [
          {
            id: "market",
            label: "Where would you like to open?",
            type: "text",
            required: true
          },
          {
            id: "timing",
            label: "When are you thinking?",
            type: "select",
            required: true,
            options: ["Exploring my options", "Within 6 months", "6\u201312 months"]
          }
        ]
      };
    },
    async saveIntake(value) {
      await wait();
      if (scenario === "save_error" && !savedOnce) {
        savedOnce = true;
        throw new Error("Demo save failure");
      }
      intake = {
        ...value,
        contact: { ...value.contact },
        answers: { ...value.answers }
      };
      method = null;
      redeemed = false;
      return { qualified: scenario !== "not_qualified" };
    },
    async signUp(_password) {
      if (!intake || Date.now() < resendAt)
        throw new Error("Demo request not ready");
      await wait();
      if (scenario === "email_error" && !emailFailedOnce) {
        emailFailedOnce = true;
        throw new Error("Demo email failure");
      }
      method = "email";
      redeemed = false;
      emailExpired = false;
      resendAt = Date.now() + (options.cooldownMs ?? 1e4);
      return scenario === "returning" ? { kind: "sign_in_required" } : { kind: "verification_pending", resendAt };
    },
    async resendEmail() {
      if (method !== "email") throw new Error("Create an account first");
      const result = await adapter.signUp("");
      if (result.kind !== "verification_pending")
        throw new Error("Sign in at the Portal");
      return { resendAt: result.resendAt };
    },
    async startOAuth(provider) {
      if (!intake) throw new Error("Save intake first");
      await wait();
      method = provider;
      redeemed = false;
    }
  };
  return {
    adapter,
    /** Does not verify identity, send email, contact providers or create a session. */
    async simulateVerification() {
      await wait();
      if (!intake || !method)
        throw new Error("Start an email or provider handoff first");
      if (redeemed) return { kind: "expired" };
      if (method === "email" && (emailExpired || scenario === "expired" && !expiredOnce)) {
        expiredOnce = true;
        emailExpired = true;
        return { kind: "expired" };
      }
      if (scenario === "revoked") return { kind: "revoked" };
      if (scenario === "mismatch" && method !== "email")
        return {
          kind: "mismatch",
          enteredEmail: intake.contact.email,
          providerEmail: "different.person@example.com"
        };
      redeemed = true;
      return {
        kind: "ready",
        email: intake.contact.email,
        firstName: intake.contact.firstName,
        market: intake.answers.market ?? "",
        returning: scenario === "returning",
        method
      };
    }
  };
}

export { PORTAL_SCENARIOS, createDemoPortalEnrollmentAdapter, createPortalEnrollmentController, usePortalEnrollment };
