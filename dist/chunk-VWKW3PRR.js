import { z } from 'zod';

// ../sdk/dist/utils/error.js

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

// ../sdk/dist/utils/error.js
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
var OTHER_ORGANISATION_REASON = "other-organisation";
z.object({
  reason: z.literal(OTHER_ORGANISATION_REASON),
  organisationId: z.string()
});
var ORGANISATION_HINT_HEADER = "X-Organisation-Hint";
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

// ../sdk/dist/utils/organisationHints.js
var listeners = /* @__PURE__ */ new Set();
var reportOrganisationHint = (hint) => {
  listeners.forEach((listener) => listener(hint));
};

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
  /**
   * The organisation the dashboard is working in. Sent so the backend answers
   * brand permissions and the brand list within it; left out, it combines
   * every organisation of the person's.
   */
  organisationId;
  constructor(baseUrl, accessToken = "", sessionType = "agent", useCookieAuth = true, brandId, platform, timezone, organisationId, allowStoredToken = true) {
    this.allowStoredToken = allowStoredToken;
    this.baseUrl = baseUrl;
    this.organisationId = organisationId;
    this.accessToken = accessToken;
    this.sessionType = sessionType;
    this.brandId = brandId;
    this.useCookieAuth = useCookieAuth;
    this.platform = platform;
    this.timezone = timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
  }
  /**
   * The bearer token for token auth: the one set on the client, else the one
   * stored at sign-in (OAuth redirect, cold start), which is then kept.
   */
  resolveAccessToken() {
    if (this.accessToken)
      return this.accessToken;
    if (!this.allowStoredToken || typeof localStorage === "undefined")
      return null;
    const storedToken = localStorage.getItem("fsai.session_token");
    if (storedToken)
      this.accessToken = storedToken;
    return storedToken;
  }
  createHeaders(accessToken, contentType) {
    const headers = {};
    if (!this.useCookieAuth) {
      const token = accessToken || this.resolveAccessToken();
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
    if (this.organisationId) {
      headers["X-Organisation-Id"] = this.organisationId;
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
    const organisationHint = response.headers.get(ORGANISATION_HINT_HEADER);
    if (response.ok && organisationHint) {
      reportOrganisationHint({
        organisationId: organisationHint,
        url: response.url
      });
    }
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

export { AuthErrorCode, HttpClient, fieldErrorsFrom, getAuthErrorCode, getAuthErrorRedirectUrl, getRetryAfterSeconds, isRateLimitError };
