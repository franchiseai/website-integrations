// src/demo.ts
var DEMO_SCENARIOS = [
  { value: "qualified", label: "Qualified" },
  { value: "not_qualified", label: "Needs a conversation" },
  { value: "returning", label: "Returning applicant" },
  { value: "submission_error", label: "Save fails once" },
  { value: "progress_error", label: "Progress fails once" },
  { value: "unavailable", label: "Loading fails once" }
];
var DEMO_QUALIFICATION = {
  brandId: "demo-brand",
  nodeId: "qualifier",
  title: "Your next chapter",
  hasForm: true,
  smsOptInEnabled: true,
  pages: [
    {
      id: "ambition",
      title: "First, the big picture.",
      description: "Tell us a little about you and where you\u2019d like to grow.",
      questions: [
        {
          id: "market",
          type: "short-text",
          question: "Where would you like to open?",
          required: true
        },
        {
          id: "timing",
          type: "singleselect",
          question: "What\u2019s your timeline?",
          required: true,
          options: ["Within 6 months", "6\u201312 months", "Just exploring"]
        }
      ]
    },
    {
      id: "fit",
      title: "Let\u2019s find your fit.",
      description: "A few details to help us start the right conversation.",
      questions: [
        {
          id: "investment",
          type: "singleselect",
          question: "Capital available to invest",
          required: true,
          options: ["$100k\u2013$250k", "$250k\u2013$500k", "$500k+"]
        },
        {
          id: "experience",
          type: "singleselect",
          question: "Have you owned a business before?",
          required: true,
          options: ["Yes, I have", "This would be my first"]
        },
        {
          id: "phone",
          type: "phone",
          question: "Phone number",
          required: false,
          dataLocation: "lead:phone"
        }
      ]
    }
  ]
};
function createDemoQualificationAdapter(options = {}) {
  const scenario = options.scenario ?? "qualified";
  let failed = false;
  const pause = () => new Promise((resolve) => setTimeout(resolve, options.delayMs ?? 450));
  return {
    async load() {
      await pause();
      if (scenario === "unavailable" && !failed) {
        failed = true;
        throw new Error("Demo load failure");
      }
      return DEMO_QUALIFICATION;
    },
    async createLead() {
      await pause();
      return scenario === "returning" ? { status: "resume_link_sent" } : { status: "created", applicationId: "demo-application" };
    },
    async updateLead() {
      await pause();
    },
    async submitPage({ complete }) {
      await pause();
      if (scenario === "submission_error" && !failed) {
        failed = true;
        throw new Error("Demo save failure");
      }
      return complete ? { qualified: scenario !== "not_qualified" } : {};
    },
    async complete() {
      await pause();
      if (scenario === "progress_error" && !failed) {
        failed = true;
        throw new Error("Demo progress failure");
      }
      return {
        nodeId: scenario === "not_qualified" ? "pending-resources" : "application"
      };
    },
    async continue() {
      await pause();
    }
  };
}

export { DEMO_QUALIFICATION, DEMO_SCENARIOS, createDemoQualificationAdapter };
