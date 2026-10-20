import { HttpClient } from './chunk-VWKW3PRR.js';
import { useSyncExternalStore } from 'react';

// ../sdk/dist/services/offerings.js
var OfferingsService = class {
  http;
  preferences = (p) => this.http.post("/offerings/preferences", p);
  savePreferences = (p) => this.http.post("/offerings/preferences/save", p);
  constructor(http) {
    this.http = http;
  }
  work = (p) => this.http.post("/offerings/work", p);
  detail = (p) => this.http.post("/offerings/detail", p);
  update = (p) => this.http.post("/offerings/update", p);
  customers = (p) => this.http.post("/offerings/customers", p);
  saveCustomer = (p) => this.http.post("/offerings/customers/save", p);
  customerHistory = (p) => this.http.post("/offerings/customers/history", p);
  config = (p) => this.http.post("/offerings/config", p);
  saveConfig = (p) => this.http.post("/offerings/config/save", p);
  locations = (p) => this.http.post("/offerings/locations", p);
  saveProfile = (p) => this.http.post("/offerings/locations/save", p);
  manual = (p) => this.http.post("/offerings/manual", p);
  preview = (p) => this.http.post("/offerings/preview", p);
  publicLocations = (p) => this.http.post("/offerings/public/locations", p);
  publicLocation = (p) => this.http.post("/offerings/public/location", p);
  publicOfferings = (p) => this.http.post("/offerings/public/offerings", p);
  resolve = (p) => this.http.post("/offerings/public/resolve", p);
  submit = (p) => this.http.post("/offerings/public/submit", p);
};

// src/offerings.ts
function createLiveOfferingsAdapter({
  apiBaseUrl,
  brandId
}) {
  const url = new URL(apiBaseUrl);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.hash || url.search)
    throw new Error(
      "Provide an HTTP(S) API URL without credentials, query or fragment"
    );
  const service = new OfferingsService(
    new HttpClient(
      url.href.replace(/\/$/, ""),
      "",
      "applicant",
      false,
      void 0,
      "web",
      void 0,
      void 0,
      false
    )
  );
  return {
    locations: () => service.publicLocations({ brandId }),
    offerings: () => service.publicOfferings({ brandId }),
    resolve: (p) => service.resolve({ ...p, brandId }),
    submit: (p) => service.submit({ ...p, brandId })
  };
}
function createOfferingsController(adapter, options = {}) {
  const newId = options.newId ?? (() => crypto.randomUUID());
  let key = newId();
  let selection = null;
  let pending = null;
  let inFlight = null;
  let generation = 0;
  let state = {
    phase: "idle",
    locations: [],
    offerings: [],
    definition: null,
    contact: { name: "", email: null, phone: null },
    answers: {},
    errors: {},
    error: null,
    receipt: null,
    retryPending: false,
    errorCode: null,
    changedFields: []
  };
  const errorCode = (error) => {
    if (error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "code" in error.data && typeof error.data.code === "string")
      return error.data.code;
    return null;
  };
  const fieldErrors = (error) => {
    const result = {};
    if (error && typeof error === "object" && "data" in error && error.data && typeof error.data === "object" && "fieldErrors" in error.data && error.data.fieldErrors && typeof error.data.fieldErrors === "object") {
      for (const [key2, value] of Object.entries(error.data.fieldErrors))
        if (typeof value === "string") result[key2] = value;
    }
    return result;
  };
  const listeners = /* @__PURE__ */ new Set();
  const set = (patch) => {
    state = { ...state, ...patch };
    for (const fn of listeners) fn();
  };
  const editable = () => {
    if (inFlight || pending || state.phase === "received")
      throw new Error(
        "Retry the pending submission or explicitly start a new enquiry before editing"
      );
  };
  const controller = {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async load() {
      set({ phase: "loading", error: null });
      try {
        const [locations, offerings] = await Promise.all([
          adapter.locations(),
          adapter.offerings()
        ]);
        set({ locations, offerings, phase: "editing" });
      } catch (error) {
        set({
          phase: "error",
          error: error instanceof Error ? error.message : "Unable to load locations"
        });
      }
    },
    async choose(input) {
      editable();
      selection = input;
      const request = ++generation;
      const previous = state.definition;
      set({
        phase: "resolving",
        error: null,
        errorCode: null,
        definition: null
      });
      try {
        const definition = await adapter.resolve(input);
        if (request !== generation) return;
        const answers = {};
        const changedFields = [];
        for (const [id, value] of Object.entries(state.answers)) {
          const before = previous?.form.fields.find((f) => f.id === id), after = definition.form.fields.find((f) => f.id === id);
          if (before && after && before.type === after.type && (after.type !== "select" || after.options.includes(String(value))))
            answers[id] = value;
          else changedFields.push(before?.label ?? id);
        }
        key = newId();
        set({
          phase: "editing",
          definition,
          answers,
          changedFields,
          errors: {}
        });
      } catch (error) {
        if (request === generation)
          set({
            phase: "error",
            errorCode: errorCode(error),
            error: error instanceof Error ? error.message : "Unable to load this form"
          });
      }
    },
    contact(contact) {
      editable();
      key = newId();
      set({ contact, error: null });
    },
    answer(id, value) {
      editable();
      key = newId();
      set({
        answers: { ...state.answers, [id]: value },
        errors: { ...state.errors, [id]: "" }
      });
    },
    submit() {
      if (inFlight) return inFlight;
      if (state.phase === "received") return Promise.resolve();
      if (!pending) {
        if (!state.definition || !selection) {
          set({ error: "Choose an offering and destination first" });
          return Promise.resolve();
        }
        const errors = {};
        if (!state.contact.name.trim()) errors.name = "Enter your name";
        if (!state.contact.email || !/^\S+@\S+\.\S+$/.test(state.contact.email))
          errors.email = "Enter your email";
        for (const field of state.definition.form.fields) {
          const value = state.answers[field.id];
          if (field.required && (value === void 0 || value === ""))
            errors[field.id] = "Required";
          if (value !== void 0 && value !== "" && field.type === "select" && !field.options.includes(String(value)))
            errors[field.id] = "Choose an available option";
        }
        if (Object.keys(errors).length) {
          set({ errors, error: "Review the highlighted fields" });
          return Promise.resolve();
        }
        pending = {
          ...selection,
          version: state.definition.version,
          idempotencyKey: key,
          contact: { ...state.contact },
          answers: { ...state.answers }
        };
      }
      set({ phase: "submitting", error: null, retryPending: true });
      inFlight = (async () => {
        try {
          const receipt = await adapter.submit(pending);
          pending = null;
          set({ phase: "received", receipt, retryPending: false });
        } catch (error) {
          const code = errorCode(error);
          const refused = !!code && [
            "OFFERING_CHANGED",
            "LOCATION_UNAVAILABLE",
            "OFFERING_UNAVAILABLE",
            "INVALID_ANSWERS"
          ].includes(code);
          if (refused) pending = null;
          set({
            phase: "error",
            errors: fieldErrors(error),
            errorCode: code,
            retryPending: !refused,
            error: error instanceof Error ? error.message : "Submission could not be confirmed. Retry safely using the same request."
          });
        } finally {
          inFlight = null;
        }
      })();
      return inFlight;
    },
    async reloadForm() {
      if (state.errorCode !== "OFFERING_CHANGED")
        throw new Error(
          "Only reload after a confirmed form-change refusal; retry uncertain submissions first"
        );
      if (inFlight) throw new Error("Wait for the current request");
      if (!selection) return;
      pending = null;
      set({ retryPending: false });
      await controller.choose(selection);
    },
    newEnquiry() {
      if (inFlight) throw new Error("Wait for the current request");
      pending = null;
      key = newId();
      generation++;
      set({
        phase: "editing",
        receipt: null,
        retryPending: false,
        definition: null,
        answers: {},
        errors: {},
        error: null,
        errorCode: null,
        changedFields: []
      });
    }
  };
  return controller;
}
function useOfferings(controller) {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot
  );
}

export { createLiveOfferingsAdapter, createOfferingsController, useOfferings };
