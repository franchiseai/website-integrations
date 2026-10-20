// src/offerings-demo.ts
var OFFERINGS_DEMO_SCENARIOS = [
  "standard",
  "retry",
  "form_changed",
  "location_disabled",
  "ambiguous_territory",
  "unmatched_address"
];
function createDemoOfferingsAdapter({
  industry = "property",
  scenario = "standard"
} = {}) {
  const offering = industry === "property" ? { id: "property", name: "Property management" } : { id: "catering", name: "Catering" };
  const locations = [
    "Toronto Central",
    "Mississauga"
  ].map((name, index) => ({
    id: `location-${index + 1}`,
    intakeEnabled: true,
    profile: {
      name,
      description: "Local team",
      address1: index ? "100 City Centre Drive" : "100 King Street",
      address2: "",
      city: index ? "Mississauga" : "Toronto",
      state: "ON",
      postalCode: "M5H 1J9",
      country: "CA",
      phone: "+14165550123",
      email: "hello@example.ca",
      website: "https://example.ca"
    }
  }));
  let revision = 1, fail = true;
  const receipts = /* @__PURE__ */ new Map();
  return {
    locations: async () => locations.map((l) => ({
      ...l,
      intakeEnabled: scenario !== "location_disabled"
    })),
    offerings: async () => [offering],
    resolve: async (input) => {
      if (input.locationId && scenario === "location_disabled")
        throw Object.assign(
          new Error("LOCATION_UNAVAILABLE: choose another location"),
          { data: { code: "LOCATION_UNAVAILABLE" } }
        );
      const definition = {
        offering,
        locationId: input.locationId ?? (scenario === "ambiguous_territory" || scenario === "unmatched_address" ? null : "location-1"),
        version: String(revision),
        form: {
          id: "shared-form",
          name: "Tell us about your request",
          fields: industry === "property" ? [
            {
              id: "property-type",
              label: "Property type",
              type: "select",
              required: true,
              options: ["Condominium", "Detached home", "Multi-unit"],
              order: 0
            },
            {
              id: "address",
              label: "Property address",
              type: "text",
              required: true,
              options: [],
              order: 1
            }
          ] : [
            {
              id: "guests",
              label: "Number of guests",
              type: "number",
              required: true,
              options: [],
              order: 0
            },
            {
              id: "date",
              label: "Preferred event date",
              type: "date",
              required: true,
              options: [],
              order: 1
            }
          ]
        }
      };
      if (revision > 1)
        definition.form.fields.push({
          id: "details",
          label: "Additional details",
          type: "textarea",
          required: true,
          options: [],
          order: 2
        });
      return definition;
    },
    submit: async (input) => {
      const payload = JSON.stringify(input), existing = receipts.get(input.idempotencyKey);
      if (existing) {
        if (existing.payload !== payload)
          throw new Error("IDEMPOTENCY_CONFLICT");
        return existing.receipt;
      }
      if (scenario === "location_disabled")
        throw new Error("LOCATION_UNAVAILABLE");
      if (scenario === "form_changed" && revision === 1) {
        revision = 2;
        throw Object.assign(
          new Error(
            "OFFERING_CHANGED: reload the form and review your answers"
          ),
          { data: { code: "OFFERING_CHANGED" } }
        );
      }
      if (input.version !== String(revision))
        throw new Error("OFFERING_CHANGED");
      const receipt = {
        receiptId: `receipt-${receipts.size + 1}`,
        status: "received"
      };
      receipts.set(input.idempotencyKey, { payload, receipt });
      if (scenario === "retry" && fail) {
        fail = false;
        throw new Error(
          "Response lost after acceptance. Retry the same submission."
        );
      }
      return receipt;
    }
  };
}

export { OFFERINGS_DEMO_SCENARIOS, createDemoOfferingsAdapter };
