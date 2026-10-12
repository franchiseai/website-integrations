import { z } from 'zod';
import { getCountries, getCountryCallingCode, isPossiblePhoneNumber } from 'libphonenumber-js';
import { useSyncExternalStore, useEffect } from 'react';

// ../sdk/dist/types/auth.js
var AuthErrorCode;
(function(AuthErrorCode2) {
  AuthErrorCode2["MISSING_TOKEN"] = "missing-token";
  AuthErrorCode2["INVALID_TOKEN"] = "invalid-token";
  AuthErrorCode2["EXPIRED_TOKEN"] = "expired-token";
  AuthErrorCode2["TOKEN_EXPIRED"] = "token-expired";
  AuthErrorCode2["EMAIL_NOT_VERIFIED"] = "email-not-verified";
  AuthErrorCode2["VERIFICATION_FAILED"] = "verification-failed";
  AuthErrorCode2["ALREADY_VERIFIED"] = "already-verified";
  AuthErrorCode2["USER_NOT_FOUND"] = "user-not-found";
  AuthErrorCode2["ACCOUNT_EXISTS"] = "account-exists";
  AuthErrorCode2["UNVERIFIED_ACCOUNT_EXISTS"] = "unverified-account-exists";
  AuthErrorCode2["EMAIL_TAKEN"] = "email-taken";
  AuthErrorCode2["INVALID_CREDENTIALS"] = "invalid-credentials";
  AuthErrorCode2["SIGNUP_FAILED"] = "signup-failed";
  AuthErrorCode2["PORTAL_ACCESS_REVOKED"] = "portal-access-revoked";
  AuthErrorCode2["RESET_TOKEN_MISSING"] = "reset-token-missing";
  AuthErrorCode2["RESET_TOKEN_INVALID"] = "reset-token-invalid";
  AuthErrorCode2["RESET_TOKEN_EXPIRED"] = "reset-token-expired";
  AuthErrorCode2["RESET_VALIDATION_FAILED"] = "reset-validation-failed";
  AuthErrorCode2["RATE_LIMITED"] = "rate-limited";
  AuthErrorCode2["RESEND_FAILED"] = "resend-failed";
  AuthErrorCode2["SERVER_ERROR"] = "server-error";
  AuthErrorCode2["TWO_FACTOR_REQUIRED"] = "2fa-required";
  AuthErrorCode2["TWO_FACTOR_SETUP_REQUIRED"] = "2fa-setup-required";
})(AuthErrorCode || (AuthErrorCode = {}));
function isAuthError(error) {
  return error && typeof error === "object" && error.isAuthError === true;
}
function isAuthErrorResponse(response) {
  return response && typeof response === "object" && response.success === false && response.code && Object.values(AuthErrorCode).includes(response.code);
}
function createAuthError(code, message, status = 400, data) {
  const error = Object.create(Error.prototype);
  error.name = "AuthError";
  error.message = message;
  error.code = code;
  error.status = status;
  error.data = data;
  error.isAuthError = true;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createAuthError);
  }
  return error;
}

// ../sdk/dist/types/funnel-identity.js
var FUNNEL_REQUIRED_IDENTITY_KEYS = [
  "firstName",
  "lastName",
  "email"
];
var FUNNEL_IDENTITY_FIELD_META = {
  firstName: {
    key: "firstName",
    label: "First name",
    autoComplete: "given-name",
    inputType: "text"
  },
  lastName: {
    key: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    inputType: "text"
  },
  email: {
    key: "email",
    label: "Email",
    autoComplete: "email",
    inputType: "email"
  },
  phone: {
    key: "phone",
    label: "Phone",
    autoComplete: "tel",
    inputType: "tel"
  }
};
var COLUMN_TO_IDENTITY = {
  first_name: "firstName",
  last_name: "lastName",
  email: "email",
  phone: "phone"
};
var LABEL_TO_IDENTITY = {
  "first name": "firstName",
  "your first name": "firstName",
  "last name": "lastName",
  surname: "lastName",
  "your last name": "lastName",
  email: "email",
  "email address": "email",
  "your email": "email",
  "your email address": "email",
  phone: "phone",
  "phone number": "phone",
  "mobile phone": "phone",
  "mobile number": "phone",
  "your phone number": "phone"
};
var OTHER_PERSON_HINTS = [
  "co-applicant",
  "coapplicant",
  "co applicant",
  "partner",
  "spouse",
  "reference",
  "attorney",
  "accountant",
  "bookkeeper",
  "emergency",
  "next of kin",
  "guarantor",
  "employer",
  "manager",
  "broker"
];
var normalizeFunnelLabel = (value) => value.toLowerCase().replace(/[?*:]/g, "").replace(/\s+/g, " ").trim();
var normalizeLabel = normalizeFunnelLabel;
var isAboutOtherPerson = (label) => OTHER_PERSON_HINTS.some((hint) => label.includes(hint));
function funnelFieldIdentityKey(field) {
  const column = field.dataLocation?.split(":").at(-1);
  if (column && column in COLUMN_TO_IDENTITY)
    return COLUMN_TO_IDENTITY[column];
  const label = normalizeLabel(field.question || field.name || "");
  if (label in LABEL_TO_IDENTITY)
    return LABEL_TO_IDENTITY[label];
  if (isAboutOtherPerson(label))
    return null;
  if (field.type === "email")
    return "email";
  if (field.type === "phone")
    return "phone";
  return null;
}
var FUNNEL_CONTACT_BLOCK_FIELDS = FUNNEL_REQUIRED_IDENTITY_KEYS.map((key) => FUNNEL_IDENTITY_FIELD_META[key]);
function funnelSmsConsentAnchorFieldId(fields) {
  return fields.find((field) => field.type === "phone")?.id ?? null;
}

// ../sdk/dist/types/funnel.js
var FUNNEL_SMS_CONSENT_COPY = "I agree to receive marketing and informational text messages (such as franchise opportunities, offers, and updates about my inquiry) at the number provided. Consent is not a condition of any purchase. Message and data rates may apply. Message frequency varies. Reply STOP to opt out at any time.";
var MAX_RETRY_AFTER_SECONDS = 3600;
var parseRetryAfter = (header) => {
  if (!header || !/^\s*\d{1,7}\s*$/.test(header))
    return void 0;
  return Math.min(Number(header.trim()), MAX_RETRY_AFTER_SECONDS);
};
var StatusCodeSchema = z.union([
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(409),
  z.literal(418),
  z.literal(429),
  z.literal(500),
  z.literal(502),
  z.literal(503),
  z.literal(504)
]);
var ErrorMessages = {
  400: "The request was invalid. Please check your input and try again.",
  401: "You are not authorized. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A conflict occurred. The resource may have been modified.",
  418: "The server refuses to brew coffee because it is a teapot.",
  429: "Too many requests. Please try again later.",
  500: "An unexpected error occurred. Please try again later.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "The service is unavailable. Please try again later.",
  504: "The server timed out. Please try again later."
};
var getErrorMessage = (error) => {
  if (isAuthError(error)) {
    return error.message;
  }
  if (!(error && typeof error === "object" && "status" in error)) {
    return ErrorMessages[500];
  }
  const result = StatusCodeSchema.safeParse(error.status);
  if (result.success) {
    return ErrorMessages[result.data];
  }
  return ErrorMessages[500];
};
var FsaiError = class _FsaiError extends Error {
  success = false;
  status;
  message;
  stack;
  data;
  retryAfterSeconds;
  /** Per-field rejections, when the server refused a form submission. */
  fieldErrors;
  constructor(error) {
    super(error.message);
    this.name = "FsaiError";
    this.status = error.status;
    this.message = error.message;
    this.stack = error.stack;
    this.data = error.data;
    this.retryAfterSeconds = error.retryAfterSeconds;
    this.fieldErrors = error.fieldErrors;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _FsaiError);
    }
  }
  toJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      stack: this.stack || void 0,
      data: this.data,
      fieldErrors: this.fieldErrors
    };
  }
};
var fieldErrorsFrom = (error) => {
  if (typeof error !== "object" || error === null)
    return {};
  const source = error;
  const errors = source.fieldErrors ?? source.data?.fieldErrors;
  if (!errors?.length)
    return {};
  const byField = {};
  for (const entry of errors)
    byField[entry.fieldId] ??= entry.message;
  return byField;
};
var isRateLimitError = (error) => typeof error === "object" && error !== null && "status" in error && error.status === 429;
var getRetryAfterSeconds = (error) => typeof error === "object" && error !== null && "retryAfterSeconds" in error && typeof error.retryAfterSeconds === "number" ? error.retryAfterSeconds : void 0;
var getAuthErrorRedirectUrl = (error) => {
  if (isAuthError(error)) {
    return error.data?.redirectUrl;
  }
  return void 0;
};
var getAuthErrorCode = (error) => {
  if (isAuthError(error)) {
    return error.code;
  }
  return void 0;
};
({
  [AuthErrorCode.MISSING_TOKEN]: "Verification link is invalid or missing. Please try signing up again.",
  [AuthErrorCode.INVALID_TOKEN]: "Verification link has expired or is invalid. Please try signing up again.",
  [AuthErrorCode.VERIFICATION_FAILED]: "Email verification failed. Please try again or contact support.",
  [AuthErrorCode.EXPIRED_TOKEN]: "Verification link has expired. Please request a new verification email.",
  [AuthErrorCode.ALREADY_VERIFIED]: "Your email has already been verified. You can log in now.",
  [AuthErrorCode.ACCOUNT_EXISTS]: "An account with this email already exists. Please sign in instead.",
  [AuthErrorCode.UNVERIFIED_ACCOUNT_EXISTS]: "An unverified account exists with this email. Please check your inbox for the verification email, or use Forgot Password to set a new password.",
  [AuthErrorCode.SERVER_ERROR]: "Something went wrong on our end. Please try again.",
  [AuthErrorCode.RATE_LIMITED]: "Too many attempts. Please wait a moment before trying again.",
  [AuthErrorCode.EMAIL_TAKEN]: "This email is already registered. Try signing in instead.",
  [AuthErrorCode.SIGNUP_FAILED]: "Account creation failed. Please try again or contact support.",
  [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid email or password. Please check your credentials and try again.",
  [AuthErrorCode.RESEND_FAILED]: "Failed to resend verification email. Please try again.",
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: "Please verify your email address before signing in. Check your inbox for the verification link.",
  [AuthErrorCode.RESET_TOKEN_MISSING]: "Password reset link is missing or invalid. Please request a new password reset.",
  [AuthErrorCode.RESET_TOKEN_INVALID]: "Password reset link has expired or is invalid. Please request a new password reset.",
  [AuthErrorCode.RESET_TOKEN_EXPIRED]: "Password reset link has expired. Please request a new password reset.",
  [AuthErrorCode.RESET_VALIDATION_FAILED]: "Unable to validate password reset request. Please try again.",
  [AuthErrorCode.USER_NOT_FOUND]: "User not found",
  [AuthErrorCode.TOKEN_EXPIRED]: "This token has expired",
  [AuthErrorCode.TWO_FACTOR_REQUIRED]: "Two-factor authentication is required. Please enter your verification code.",
  [AuthErrorCode.TWO_FACTOR_SETUP_REQUIRED]: "Your organization requires two-factor authentication. Please set it up to continue.",
  [AuthErrorCode.PORTAL_ACCESS_REVOKED]: "This portal is not available. Contact the brand for more information."
});
var PHONE_COUNTRY_PRIORITY = [
  "US",
  "CA",
  "GB",
  "AU",
  "MX",
  "DE",
  "FR",
  "NL"
];
var regionDisplayNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
var getPhoneCountryName = (country) => {
  try {
    return regionDisplayNames?.of(country) ?? country;
  } catch {
    return country;
  }
};
var sortPhoneCountries = (countries) => {
  const prioritySet = new Set(PHONE_COUNTRY_PRIORITY);
  return [
    ...PHONE_COUNTRY_PRIORITY.filter((country) => countries.includes(country)),
    ...countries.filter((country) => !prioritySet.has(country)).sort((left, right) => left.localeCompare(right))
  ];
};
sortPhoneCountries(getCountries()).map((country) => {
  const callingCode = getCountryCallingCode(country);
  const name = getPhoneCountryName(country);
  return {
    country,
    callingCode,
    name,
    label: `${name} (+${callingCode})`,
    searchLabel: `${name} ${country} +${callingCode} ${callingCode}`
  };
});
var isPossibleInternationalPhone = (value) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) {
    return false;
  }
  return isPossiblePhoneNumber(trimmed);
};
var fieldTypeSchema = z.enum([
  "number",
  "boolean",
  "short-text",
  "long-text",
  "currency",
  "date",
  "url",
  "email",
  "phone",
  "multiselect",
  "singleselect",
  "dropdown"
]);
var SerializedFormFieldSubmissionSchema = z.object({
  displayName: z.string(),
  type: fieldTypeSchema,
  isArray: z.boolean(),
  value: z.union([z.string(), z.number(), z.boolean()])
});
z.object({
  question: z.string().nullable(),
  type: fieldTypeSchema,
  options: z.array(z.string()).optional()
});
z.record(SerializedFormFieldSubmissionSchema);
var createValidationMap = (validation) => validation;
var formValidations = createValidationMap({
  required: {
    required: "This field is required"
  },
  maxLength: (maxLength, fieldName) => ({
    maxLength: {
      value: maxLength,
      message: `${fieldName} must be fewer than ${maxLength} characters`
    }
  }),
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Email address is invalid"
    }
  },
  password: {
    minLength: {
      value: 6,
      message: "Password needs to contain at least 6 characters"
    }
  },
  phone: {
    pattern: {
      // Matches international phone numbers:
      // - Optional + at start
      // - Optional country code
      // - Area codes and numbers
      // - Allows spaces, dashes, and parentheses as separators
      value: /^\+?[\d\s()-]{6,20}$/,
      message: "Please enter a valid phone number"
    }
  },
  url: {
    pattern: {
      // Matches URLs with:
      // - Optional protocol (http://, https://, ftp://)
      // - Domain name with optional www
      // - Optional port number
      // - Optional path, query parameters, and fragment
      value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*(\?[\w=&]*)?$/,
      message: "Please enter a valid URL"
    }
  },
  domain: {
    pattern: {
      value: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid domain"
    }
  },
  slug: {
    pattern: {
      value: /^[a-z0-9-]+$/,
      message: "Only lowercase letters, numbers, and hyphens are allowed"
    }
  },
  locationStoreId: {
    pattern: {
      value: /^[a-zA-Z0-9]{1,16}$/,
      message: "Store ID is invalid (1-16 alphanumeric characters)"
    }
  }
});

// ../sdk/dist/utils/fieldValidation.js
function isAnswerEmpty(value) {
  if (value == null)
    return true;
  if (typeof value === "string")
    return value.trim() === "";
  if (Array.isArray(value))
    return value.length === 0;
  return false;
}
function fieldLabel(field) {
  const asked = field.question?.trim();
  if (asked)
    return asked;
  const name = field.name?.trim();
  if (!name)
    return "This field";
  const words = name.replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim().split(" ").map((word) => word === word.toUpperCase() ? word : word.toLowerCase());
  const [first, ...rest] = words;
  if (!first)
    return "This field";
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ");
}
var EMAIL = formValidations.email.pattern.value;
var PHONE_SHAPE = formValidations.phone.pattern.value;
function toNumber(value) {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : null;
  if (typeof value !== "string")
    return null;
  const cleaned = value.replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-")
    return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
function isValidPhoneAnswer(value) {
  const text = value.trim();
  if (text.startsWith("+")) {
    return isPossibleInternationalPhone(text);
  }
  const digits = text.replace(/\D/g, "");
  return PHONE_SHAPE.test(text) && digits.length >= 7 && digits.length <= 15;
}
function isValidUrl(value) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}
function validateFieldAnswer(field, value) {
  const errors = [];
  const label = fieldLabel(field);
  const fail = (code, message) => errors.push({ fieldId: field.id, code, message });
  if (isAnswerEmpty(value)) {
    if (field.required)
      fail("required", `${label} is required.`);
    return errors;
  }
  const options = field.options ?? [];
  switch (field.type) {
    case "email":
      if (typeof value !== "string" || !EMAIL.test(value.trim())) {
        fail("type", `${label} must be a valid email address.`);
      }
      break;
    case "url":
      if (typeof value !== "string" || !isValidUrl(value.trim())) {
        fail("type", `${label} must be a valid web address.`);
      }
      break;
    case "phone": {
      const text = typeof value === "string" ? value.trim() : "";
      if (!isValidPhoneAnswer(text)) {
        fail("type", `${label} must be a valid phone number.`);
      }
      break;
    }
    case "number":
    case "currency": {
      const numeric = toNumber(value);
      if (numeric === null) {
        fail("type", `${label} must be a number.`);
        break;
      }
      if (field.type === "currency" && numeric < 0) {
        fail("min", `${label} cannot be negative.`);
      }
      break;
    }
    case "date": {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text || Number.isNaN(new Date(text).getTime())) {
        fail("type", `${label} must be a valid date.`);
      }
      break;
    }
    case "boolean":
      if (typeof value !== "boolean") {
        fail("type", `${label} must be yes or no.`);
      }
      break;
    case "singleselect":
    case "dropdown": {
      if (typeof value !== "string") {
        fail("type", `${label} must be one of the available choices.`);
        break;
      }
      if (options.length > 0 && !options.includes(value)) {
        fail("option", `${label} must be one of the available choices.`);
      }
      break;
    }
    case "multiselect": {
      if (!Array.isArray(value)) {
        fail("type", `${label} must be a list of choices.`);
        break;
      }
      if (options.length > 0 && value.some((entry) => !options.includes(entry))) {
        fail("option", `${label} must only contain available choices.`);
      }
      break;
    }
    case "short-text":
    case "long-text":
      if (typeof value !== "string") {
        fail("type", `${label} must be text.`);
      }
      break;
  }
  return errors;
}
function validateFieldAnswers(fields, values) {
  return fields.flatMap((field) => validateFieldAnswer(field, values[field.id]));
}
function validateFunnelIdentity(identity) {
  const errors = {};
  if (!identity.firstName?.trim())
    errors.firstName = "First name is required.";
  if (!identity.lastName?.trim())
    errors.lastName = "Last name is required.";
  const email = identity.email?.trim() ?? "";
  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  const phone = identity.phone?.trim();
  if (phone && !isValidPhoneAnswer(phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  return errors;
}

// ../sdk/dist/http-client.js
var HttpClient = class {
  allowStoredToken;
  baseUrl;
  accessToken;
  sessionType;
  brandId;
  useCookieAuth;
  platform;
  timezone;
  constructor(baseUrl, accessToken = "", sessionType = "agent", useCookieAuth = true, brandId, platform, timezone, allowStoredToken = true) {
    this.allowStoredToken = allowStoredToken;
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.sessionType = sessionType;
    this.brandId = brandId;
    this.useCookieAuth = useCookieAuth;
    this.platform = platform;
    this.timezone = timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
  }
  createHeaders(accessToken, contentType) {
    const headers = {};
    if (!this.useCookieAuth) {
      let token = accessToken ?? this.accessToken;
      if (this.allowStoredToken && !token && typeof localStorage !== "undefined") {
        const storedToken = localStorage.getItem("fsai.session_token");
        if (storedToken) {
          token = storedToken;
          this.accessToken = storedToken;
        }
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    headers["X-Session-Type"] = this.sessionType;
    headers["X-Timezone"] = this.timezone;
    if (this.brandId) {
      headers["X-Brand-Id"] = this.brandId;
    }
    if (this.platform && this.platform !== "web") {
      headers["X-App-Platform"] = this.platform;
    }
    return headers;
  }
  /**
   * Auth + context headers for transports that bypass createFetchOptions
   * (e.g. the AI SDK `useChat` streaming request). Mirrors createHeaders;
   * the transport sets its own Content-Type.
   */
  getStreamHeaders() {
    return this.createHeaders();
  }
  createFetchOptions(method, body, accessToken, contentType, signal) {
    const options = {
      method,
      headers: this.createHeaders(accessToken, contentType),
      credentials: this.useCookieAuth ? "include" : "omit"
      // Include cookies for auth
    };
    if (body !== void 0) {
      options.body = body;
    }
    if (signal) {
      options.signal = signal;
    }
    return options;
  }
  async parseResponse(response) {
    let data;
    const contentType = response.headers.get("Content-Type") || "";
    const contentLength = response.headers.get("Content-Length");
    const retryAfterSeconds = parseRetryAfter(response.headers.get("Retry-After"));
    if (response.status === 204 || contentLength === "0") {
      if (!response.ok) {
        throw new FsaiError({
          message: getErrorMessage(response),
          success: false,
          status: response.status,
          stack: void 0,
          retryAfterSeconds
        });
      }
      return void 0;
    }
    try {
      if (contentType.includes("application/zip") || contentType.includes("application/pdf") || contentType.includes("application/vnd.openxmlformats") || contentType.includes("application/vnd.oasis.opendocument") || contentType.includes("text/markdown")) {
        data = await response.blob();
      } else {
        data = await response.json();
      }
    } catch {
      if (response.ok) {
        return void 0;
      }
      throw new FsaiError({
        message: getErrorMessage(response),
        success: false,
        status: response.status,
        stack: void 0,
        retryAfterSeconds
      });
    }
    if (!response.ok) {
      if (isAuthErrorResponse(data)) {
        throw createAuthError(data.code, data.message, data.status, data.data);
      }
      throw new FsaiError({
        success: false,
        status: response.status,
        message: getErrorMessage(response),
        stack: data?.stack,
        data,
        // Beside the message, so a surface can mark the offending questions.
        fieldErrors: data?.fieldErrors,
        retryAfterSeconds
      });
    }
    return data;
  }
  async get(url, options) {
    const fetchOptions = this.createFetchOptions("GET", void 0, options?.accessToken, void 0, options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    return this.parseResponse(response);
  }
  /**
   * Get request that returns both data and response headers.
   * Useful for endpoints that return metadata in headers (e.g., export warnings).
   */
  async getWithHeaders(url, options) {
    const fetchOptions = this.createFetchOptions("GET", void 0, options?.accessToken, void 0, options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    const data = await this.parseResponse(response);
    return { data, headers: response.headers };
  }
  async post(url, body, content_type = "application/json", accessToken, options) {
    const isJson = content_type === "application/json";
    const formattedBody = isJson ? JSON.stringify(body) : body;
    const contentTypeHeader = isJson ? "application/json" : void 0;
    const fetchOptions = this.createFetchOptions("POST", formattedBody, accessToken, contentTypeHeader, options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    return this.parseResponse(response);
  }
  async put(url, body, content_type = "application/json", accessToken, options) {
    const isJson = content_type === "application/json";
    const formattedBody = isJson ? JSON.stringify(body) : body;
    const contentTypeHeader = isJson ? "application/json" : void 0;
    const fetchOptions = this.createFetchOptions("PUT", formattedBody, accessToken, contentTypeHeader, options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    return this.parseResponse(response);
  }
  async delete(url, accessToken, options) {
    const fetchOptions = this.createFetchOptions("DELETE", void 0, accessToken, void 0, options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    return this.parseResponse(response);
  }
  async patch(url, body, accessToken, options) {
    const fetchOptions = this.createFetchOptions("PATCH", JSON.stringify(body), accessToken, "application/json", options?.signal);
    const response = await fetch(`${this.baseUrl}${url}`, fetchOptions);
    return this.parseResponse(response);
  }
};

// ../sdk/dist/services/qualification.js
var QualificationService = class {
  httpClient;
  baseRoute = "/funnel";
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  createLead = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/leads`, params);
  };
  updateLead = async ({ applicationId, updates }) => {
    return this.httpClient.patch(`${this.baseRoute}/leads/${applicationId}`, {
      updates
    });
  };
  /** Fetch the site's configured qualifier/application form (scoped by host). */
  getForm = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/form`, params);
  };
  /** Submit a qualifier/application form's answers for an application. */
  submitForm = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/submissions`, params);
  };
  /**
   * Record a completed step (fire-and-forget from the engine) so the lead's
   * funnel position survives the browser. Idempotent per consecutive event.
   */
  saveProgress = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/progress`, params);
  };
  /** Resolve the node a returning lead should land on (server-side replay). */
  resolveEntry = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/entry`, params);
  };
  /**
   * Resolve which brand a host serves. Pass `window.location.hostname`; returns
   * the brand's site info, or `null` when no Funnel site is configured.
   */
  getSiteInfo = async (params) => {
    return this.httpClient.post(`${this.baseRoute}/site-info`, params);
  };
};

// src/controller.ts
function createQualificationController(options) {
  const { adapter } = options;
  const listeners = /* @__PURE__ */ new Set();
  let applicationId = null;
  let pendingOutcome = null;
  let state = {
    phase: "idle",
    definition: null,
    pageIndex: 0,
    identity: { firstName: "", lastName: "", email: "" },
    answers: {},
    identityLocked: false,
    smsConsent: false,
    fieldErrors: {},
    error: null,
    retryAt: null,
    outcome: null,
    next: null,
    portalUrl: null
  };
  const publish = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const emit = (type) => {
    try {
      options.onEvent?.({
        type,
        nodeId: state.definition?.nodeId,
        pageId: state.definition?.pages[state.pageIndex]?.id
      });
    } catch {
    }
  };
  const editable = () => state.phase === "editing" && !pendingOutcome;
  const clearFieldError = (key) => {
    const errors = { ...state.fieldErrors };
    delete errors[key];
    return errors;
  };
  const fail = (error, phase) => {
    if (getAuthErrorCode(error) === AuthErrorCode.ACCOUNT_EXISTS) {
      const url = getAuthErrorRedirectUrl(error);
      publish({
        phase: "portal_required",
        error: null,
        portalUrl: url && /^https?:\/\//.test(url) ? url : null
      });
      return;
    }
    const limited = isRateLimitError(error);
    publish({
      phase,
      fieldErrors: fieldErrorsFrom(error),
      retryAt: limited ? Date.now() + (getRetryAfterSeconds(error) ?? 60) * 1e3 : null,
      error: limited ? "Too many attempts. Please wait a moment before trying again." : "We couldn\u2019t save your progress. Please try again."
    });
    emit("submission_failed");
  };
  const retryBlocked = () => state.retryAt !== null && Date.now() < state.retryAt;
  const controller = {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async load() {
      if (state.phase !== "idle" && state.phase !== "load_error") return;
      if (retryBlocked()) return;
      publish({ phase: "loading", error: null });
      try {
        const definition = await adapter.load();
        if (!definition.pages.length)
          throw new Error("Missing qualification pages");
        publish({ definition, phase: "editing", retryAt: null });
        emit("loaded");
      } catch (error) {
        fail(error, "load_error");
      }
    },
    setIdentity(key, value) {
      if (!editable() || state.identityLocked && key === "email") return;
      publish({
        identity: { ...state.identity, [key]: value },
        fieldErrors: clearFieldError(key),
        error: null
      });
    },
    setAnswer(fieldId, value) {
      if (!editable()) return;
      const question = state.definition?.pages[state.pageIndex]?.questions.find(
        (field) => field.id === fieldId
      );
      if (!question) return;
      publish({
        answers: { ...state.answers, [fieldId]: value },
        fieldErrors: clearFieldError(fieldId),
        error: null,
        ...question.type === "phone" ? { smsConsent: false } : {}
      });
    },
    setSmsConsent(value) {
      if (editable()) publish({ smsConsent: value });
    },
    back() {
      if (editable() && state.pageIndex > 0)
        publish({
          pageIndex: state.pageIndex - 1,
          fieldErrors: {},
          error: null,
          smsConsent: false
        });
    },
    async submit() {
      if (state.phase !== "editing" && state.phase !== "completion_error" || retryBlocked())
        return;
      const definition = state.definition;
      const page = definition?.pages[state.pageIndex];
      if (!definition || !page) return;
      if (!pendingOutcome) {
        const fieldErrors = {};
        Object.assign(fieldErrors, validateFunnelIdentity(state.identity));
        for (const error of validateFieldAnswers(page.questions, state.answers))
          fieldErrors[error.fieldId] ??= error.message;
        if (Object.keys(fieldErrors).length) {
          publish({ fieldErrors });
          return;
        }
      }
      publish({
        phase: "submitting",
        error: null,
        fieldErrors: {},
        retryAt: null
      });
      try {
        if (!pendingOutcome) {
          const identity = {
            firstName: state.identity.firstName.trim(),
            lastName: state.identity.lastName.trim(),
            email: state.identity.email.trim()
          };
          const phoneField = definition.pages.flatMap((item) => item.questions).find((field) => funnelFieldIdentityKey(field) === "phone");
          const phoneValue = phoneField ? state.answers[phoneField.id] : void 0;
          const phone = typeof phoneValue === "string" ? phoneValue.trim() : void 0;
          if (!applicationId) {
            const result2 = await adapter.createLead({
              brandId: definition.brandId,
              ...identity,
              phone,
              utmParams: options.attribution ? JSON.stringify(options.attribution) : void 0
            });
            if (result2.status === "resume_link_sent") {
              publish({ phase: "resume_link_sent" });
              emit("resume_link_sent");
              return;
            }
            applicationId = result2.applicationId;
            publish({ identityLocked: true, identity });
            emit("lead_created");
          } else {
            await adapter.updateLead(applicationId, identity, phone);
          }
          const lastPage = state.pageIndex === definition.pages.length - 1;
          const anchor = funnelSmsConsentAnchorFieldId(page.questions);
          const result = definition.hasForm ? await adapter.submitPage({
            applicationId,
            kind: "qualifier",
            pageId: page.id,
            complete: lastPage,
            submissions: page.questions.flatMap(
              (field) => field.id in state.answers ? [
                {
                  fieldId: field.id,
                  value: isAnswerEmpty(state.answers[field.id]) ? null : state.answers[field.id]
                }
              ] : []
            ),
            ...anchor && definition.smsOptInEnabled ? { smsConsent: state.smsConsent } : {}
          }) : {};
          emit("page_saved");
          if (!lastPage) {
            publish({
              phase: "editing",
              pageIndex: state.pageIndex + 1,
              smsConsent: false
            });
            return;
          }
          pendingOutcome = result.qualified === false ? "not_qualified" : "qualified";
        }
        if (!applicationId) throw new Error("Missing application");
        const next = await adapter.complete(
          applicationId,
          definition.nodeId,
          pendingOutcome
        );
        publish({ phase: "outcome", outcome: pendingOutcome, next });
        emit(pendingOutcome);
      } catch (error) {
        fail(error, pendingOutcome ? "completion_error" : "editing");
      }
    },
    async continue() {
      if (state.phase !== "outcome" || !applicationId || retryBlocked()) return;
      publish({ phase: "continuing", error: null });
      try {
        await adapter.continue(applicationId, state.identity);
        publish({ phase: "complete", retryAt: null });
        emit("continuation_requested");
      } catch (error) {
        fail(error, "outcome");
      }
    },
    useDifferentEmail() {
      if (state.phase !== "resume_link_sent" && state.phase !== "portal_required")
        return;
      publish({ phase: "editing", pageIndex: 0, error: null, portalUrl: null });
    }
  };
  return controller;
}
function useQualification(controller) {
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

// src/sdk-adapter.ts
function createSdkQualificationAdapter(options) {
  const { funnel } = options;
  let definition = null;
  return {
    async load() {
      const site = await funnel.getSiteInfo(options.site);
      if (!site?.funnelDoc) throw new Error("A published funnel is required");
      const entry = site.funnelDoc.nodes.find(
        (node) => node.id === site.funnelDoc?.entryStepId
      );
      if (entry?.config.type !== "qualifier")
        throw new Error("This prototype requires a qualifier entry step");
      const form = site.qualifierFormId ? await funnel.getForm({ ...options.site, kind: "qualifier" }) : null;
      if (site.qualifierFormId && !form?.pages.length)
        throw new Error("Configured qualifier form is unavailable");
      definition = {
        brandId: site.brandId,
        nodeId: entry.id,
        title: site.name ?? "Franchise enquiry",
        hasForm: Boolean(form),
        smsOptInEnabled: Boolean(site.smsOptInEnabled),
        pages: form ? form.pages.map((page) => ({
          id: page.id,
          title: page.title || "A little about you",
          description: page.subtitle,
          questions: page.fields.map((field) => ({
            id: field.id,
            type: field.type,
            question: field.question,
            name: field.name,
            required: field.required,
            options: field.options,
            dataLocation: field.dataLocation,
            description: field.description
          }))
        })) : [{ id: "contact", title: "Let\u2019s get acquainted", questions: [] }]
      };
      return definition;
    },
    createLead: (params) => funnel.createLead(params),
    async updateLead(applicationId, identity, phone) {
      await funnel.updateLead({
        applicationId,
        updates: {
          firstName: identity.firstName,
          lastName: identity.lastName,
          ...phone ? { phone } : {}
        }
      });
    },
    submitPage: (params) => funnel.submitForm(params),
    async complete(applicationId, nodeId, outcome) {
      await funnel.saveProgress({ applicationId, nodeId, outcome });
      const entry = await funnel.resolveEntry({ applicationId });
      return { nodeId: entry.entryNodeId };
    },
    async continue(_applicationId, identity) {
      if (!definition) throw new Error("Load the site first");
      const result = await funnel.createLead({
        brandId: definition.brandId,
        ...identity
      });
      if (result.status !== "resume_link_sent")
        throw new Error("Unable to request continuation");
    }
  };
}

// src/presentation.ts
var FUNNEL_CONTACT_BLOCK_FIELDS2 = FUNNEL_CONTACT_BLOCK_FIELDS;
var FUNNEL_SMS_CONSENT_COPY2 = FUNNEL_SMS_CONSENT_COPY;
function funnelSmsConsentAnchorFieldId2(fields) {
  return funnelSmsConsentAnchorFieldId(fields);
}

// src/attribution.ts
var ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid"
];
function readQualificationAttribution(search) {
  const params = new URLSearchParams(search);
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }
  return attribution;
}

// src/live-adapter.ts
function createLiveQualificationAdapter(options) {
  const url = new URL(options.apiBaseUrl);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash)
    throw new Error(
      "Provide an HTTP(S) API base URL without credentials, query or fragment"
    );
  if (!("slug" in options.site ? options.site.slug : options.site.host)?.trim())
    throw new Error("Provide a published funnel slug or host");
  return createSdkQualificationAdapter({
    funnel: new QualificationService(
      new HttpClient(
        url.href.replace(/\/$/, ""),
        "",
        "applicant",
        false,
        void 0,
        "web",
        void 0,
        false
      )
    ),
    site: options.site
  });
}

export { FUNNEL_CONTACT_BLOCK_FIELDS2 as FUNNEL_CONTACT_BLOCK_FIELDS, FUNNEL_SMS_CONSENT_COPY2 as FUNNEL_SMS_CONSENT_COPY, createLiveQualificationAdapter, createQualificationController, createSdkQualificationAdapter, funnelSmsConsentAnchorFieldId2 as funnelSmsConsentAnchorFieldId, readQualificationAttribution, useQualification };
