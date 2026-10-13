import { useEffect, useRef, useState } from 'react';
import {
  createDemoPortalEnrollmentAdapter,
  createPortalEnrollmentController,
  usePortalEnrollment,
  PORTAL_SCENARIOS,
} from '@franchiseai/website-integrations/experimental/portal';
import type {
  PortalDemoResult,
  PortalDemoScenario,
} from '@franchiseai/website-integrations/experimental/portal';
import './portal.css';

export function PortalStudio() {
  const [scenario, setScenario] = useState<PortalDemoScenario>('new');
  const [revision, setRevision] = useState(0);
  const [theme, setTheme] = useState<'paper' | 'night'>('paper');
  return (
    <>
      <div className="studio-toolbar portal-toolbar">
        <strong>
          Portal enrollment <span className="prototype-tag">EXPERIMENTAL</span>
        </strong>
        <div className="design-switch" role="group" aria-label="Portal design">
          <button
            aria-pressed={theme === 'paper'}
            onClick={() => setTheme('paper')}
          >
            Paper
          </button>
          <button
            aria-pressed={theme === 'night'}
            onClick={() => setTheme('night')}
          >
            Midnight
          </button>
        </div>
        <div className="studio-settings">
          <label htmlFor="portal-scenario">Scenario</label>
          <select
            id="portal-scenario"
            value={scenario}
            onChange={(event) => {
              const found = PORTAL_SCENARIOS.find(
                (item) => item.value === event.target.value
              );
              if (found) setScenario(found.value);
            }}
          >
            {PORTAL_SCENARIOS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            className="reset-button"
            onClick={() => setRevision((value) => value + 1)}
          >
            Reset ↺
          </button>
        </div>
      </div>
      <PortalExperience
        key={`${scenario}-${revision}`}
        scenario={scenario}
        theme={theme}
      />
    </>
  );
}

function PortalExperience({
  scenario,
  theme,
}: {
  scenario: PortalDemoScenario;
  theme: 'paper' | 'night';
}) {
  const [demo] = useState(() =>
    createDemoPortalEnrollmentAdapter({ scenario })
  );
  const [controller] = useState(() =>
    createPortalEnrollmentController(demo.adapter)
  );
  const { state, actions } = usePortalEnrollment(controller);
  const [password, setPassword] = useState('');
  const [inbox, setInbox] = useState(false);
  const [preview, setPreview] = useState<PortalDemoResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    heading.current?.focus();
  }, [state.phase, preview?.kind, inbox]);
  const waiting = state.phase === 'saving' || state.phase === 'requesting';
  const cooldown = Math.max(0, Math.ceil((state.resendAt - now) / 1000));
  const provider = state.method === 'google' ? 'Google' : 'LinkedIn';
  const verify = async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    try {
      setPreview(await demo.simulateVerification());
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  };
  const fallback = () => {
    setPreview(null);
    actions.cancelOAuth();
  };
  const title =
    preview?.kind === 'ready'
      ? `${preview.returning ? 'Welcome back' : 'Welcome aboard'}, ${preview.firstName}.`
      : preview?.kind === 'mismatch'
        ? 'Let’s keep your details together.'
        : preview?.kind === 'expired'
          ? 'This link has expired.'
          : preview?.kind === 'revoked'
            ? 'Please contact the brand.'
            : state.phase === 'sign_in_required'
              ? 'Your application is waiting.'
              : state.phase === 'email_pending' ||
                  (state.phase === 'requesting' && state.resendAt > 0)
                ? 'Your next chapter is in your inbox.'
                : state.phase === 'provider_pending'
                  ? `Continue with ${provider}.`
                  : state.phase === 'choose_method' ||
                      state.phase === 'requesting'
                    ? 'Make it yours.'
                    : 'A little about your next chapter.';

  return (
    <div className={`portal-demo portal-${theme}`}>
      <header className="portal-brand-nav">
        <a href="#portal-start" aria-label="Northstar home">
          northstar<span>✳</span>
        </a>
        <span>NEIGHBOURHOOD COFFEE / INDEPENDENT SPIRIT</span>
        <a href="https://franchiseai.github.io/website-integrations/portal.html">
          Integration guide ↗
        </a>
      </header>
      <main id="portal-start" className="portal-layout">
        <section
          className="portal-story"
          aria-label="Northstar franchise opportunity"
        >
          <span className="portal-eyebrow">GOOD THINGS START SOMEWHERE</span>
          <h1>
            Find your
            <br />
            <em>own north.</em>
          </h1>
          <p>
            A familiar face. A favourite corner.
            <br />A coffee shop that feels like yours.
            <br />
            Let’s make it happen, together.
          </p>
          <div
            className="portal-compass"
            aria-label="Illustrated compass pointing toward your next chapter"
            role="img"
          >
            <span className="compass-north">N</span>
            <div className="compass-ring">
              <span>✳</span>
            </div>
            <span className="compass-caption">
              A NEW DIRECTION
              <br />
              WITH GOOD COMPANY.
            </span>
          </div>
          <ol className="portal-journey" aria-label="Application journey">
            <li>
              <b>01</b>
              <span>
                Your introduction<small>Here, on our website</small>
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                Your account<small>Password or Google / LinkedIn</small>
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                Your application<small>Continue in the Northstar Portal</small>
              </span>
            </li>
          </ol>
        </section>
        <section className="portal-card" aria-label="Portal enrollment">
          <div className="portal-card-top">
            <span>
              {preview?.kind === 'ready'
                ? 'HOSTED PORTAL · SIMULATED DESTINATION'
                : 'YOUR INTRODUCTION'}
            </span>
            <span>↗</span>
          </div>
          <div className="portal-card-body">
            <h2 ref={heading} tabIndex={-1}>
              {title}
            </h2>
            {preview?.kind === 'ready' ? (
              <>
                <p>
                  Your{' '}
                  {preview.method === 'email'
                    ? preview.returning
                      ? 'identity is confirmed through Portal login'
                      : 'email is confirmed'
                    : `${preview.method === 'google' ? 'Google' : 'LinkedIn'} identity is confirmed`}
                  . This is where the real flow would open the main Portal.
                </p>
                <div className="portal-arrival">
                  <span className="portal-eyebrow">
                    NORTHSTAR APPLICANT PORTAL
                  </span>
                  <h3>
                    {preview.returning
                      ? 'Continue your application'
                      : 'Your application starts here'}
                  </h3>
                  <p>
                    {preview.email}
                    <br />
                    Your preferred area: {preview.market}
                  </p>
                  <div className="portal-task">
                    <span>✓</span>
                    <div>
                      Introduction received
                      <small>Your submitted details carried through.</small>
                    </div>
                  </div>
                  <div className="portal-task">
                    <span>02</span>
                    <div>
                      Meet your next chapter
                      <small>
                        Application, documents and next steps live in the main
                        Portal.
                      </small>
                    </div>
                  </div>
                </div>
                <p className="portal-small">
                  Destination preview only. No account, application or session
                  was created. Reset the demo to try another journey.
                </p>
              </>
            ) : preview?.kind === 'mismatch' ? (
              <>
                <p>
                  Your provider returned a different email. We won’t attach your
                  introduction to that account automatically.
                </p>
                <dl className="portal-identities">
                  <dt>Your introduction</dt>
                  <dd>{preview.enteredEmail}</dd>
                  <dt>Provider account (simulated)</dt>
                  <dd>{preview.providerEmail}</dd>
                </dl>
                <button className="portal-primary" onClick={fallback}>
                  Use email and password instead
                </button>
                <button className="portal-text-button" onClick={fallback}>
                  Back to sign-in options
                </button>
                <p className="portal-small">
                  In the live flow, you could choose the matching provider
                  account or prove ownership of your original email. Existing
                  accounts are never silently merged.
                </p>
              </>
            ) : preview?.kind === 'revoked' ? (
              <>
                <p>
                  This Portal is not available for this applicant. Contact the
                  brand for help.
                </p>
                <p className="portal-small">
                  Demo access check. No private account status was looked up.
                </p>
              </>
            ) : preview?.kind === 'expired' ? (
              <>
                <p>
                  Your introduction is still saved for this demo. Request a
                  fresh confirmation email to continue.
                </p>
                <button
                  className="portal-primary"
                  disabled={cooldown > 0 || waiting}
                  onClick={async () => {
                    await actions.resendEmail();
                    if (
                      actions.getSnapshot().phase === 'email_pending' &&
                      !actions.getSnapshot().error
                    ) {
                      setPreview(null);
                      setInbox(true);
                    }
                  }}
                >
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Send a fresh confirmation'}
                </button>
              </>
            ) : state.phase === 'idle' || state.phase === 'loading' ? (
              <p role="status">Getting your introduction ready…</p>
            ) : state.phase === 'load_error' ? (
              <button
                className="portal-primary"
                onClick={() => void actions.load()}
              >
                Try loading again
              </button>
            ) : state.phase === 'editing' || state.phase === 'saving' ? (
              <>
                <p>
                  Tell us a little about yourself. Then choose how you’d like to
                  create your account.
                </p>
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void actions.submit();
                  }}
                >
                  <fieldset disabled={waiting} className="portal-fields">
                    <legend className="portal-sr-only">Your details</legend>
                    <div className="portal-name-row">
                      {(['firstName', 'lastName'] as const).map((key) => (
                        <div key={key} className="portal-field">
                          <label htmlFor={`portal-${key}`}>
                            {key === 'firstName' ? 'First name' : 'Last name'}
                          </label>
                          <input
                            id={`portal-${key}`}
                            autoComplete={
                              key === 'firstName' ? 'given-name' : 'family-name'
                            }
                            value={state.contact[key]}
                            required
                            onChange={(e) =>
                              actions.setContact(key, e.target.value)
                            }
                            aria-invalid={!!state.fieldErrors[key]}
                            aria-describedby={
                              state.fieldErrors[key]
                                ? `error-${key}`
                                : undefined
                            }
                          />
                          {state.fieldErrors[key] && (
                            <span
                              className="portal-field-error"
                              id={`error-${key}`}
                            >
                              {state.fieldErrors[key]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="portal-field">
                      <label htmlFor="portal-email">Email address</label>
                      <input
                        id="portal-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={state.contact.email}
                        onChange={(e) =>
                          actions.setContact('email', e.target.value)
                        }
                        aria-invalid={!!state.fieldErrors.email}
                        aria-describedby={
                          state.fieldErrors.email ? 'error-email' : undefined
                        }
                      />
                      {state.fieldErrors.email && (
                        <span className="portal-field-error" id="error-email">
                          {state.fieldErrors.email}
                        </span>
                      )}
                    </div>
                    {state.definition?.questions.map((q) => (
                      <div key={q.id} className="portal-field">
                        <label htmlFor={`portal-${q.id}`}>{q.label}</label>
                        {q.type === 'select' ? (
                          <select
                            id={`portal-${q.id}`}
                            required={q.required}
                            value={state.answers[q.id] ?? ''}
                            onChange={(e) =>
                              actions.setAnswer(q.id, e.target.value)
                            }
                            aria-invalid={!!state.fieldErrors[q.id]}
                            aria-describedby={
                              state.fieldErrors[q.id]
                                ? `error-${q.id}`
                                : undefined
                            }
                          >
                            <option value="">Choose an option</option>
                            {q.options?.map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`portal-${q.id}`}
                            required={q.required}
                            value={state.answers[q.id] ?? ''}
                            onChange={(e) =>
                              actions.setAnswer(q.id, e.target.value)
                            }
                            aria-invalid={!!state.fieldErrors[q.id]}
                            aria-describedby={
                              state.fieldErrors[q.id]
                                ? `error-${q.id}`
                                : undefined
                            }
                          />
                        )}
                        {state.fieldErrors[q.id] && (
                          <span
                            className="portal-field-error"
                            id={`error-${q.id}`}
                          >
                            {state.fieldErrors[q.id]}
                          </span>
                        )}
                      </div>
                    ))}
                    <label className="portal-consent">
                      <input
                        type="checkbox"
                        checked={state.marketingConsent}
                        onChange={(e) =>
                          actions.setMarketingConsent(e.target.checked)
                        }
                      />
                      <span>
                        Keep me updated about Northstar opportunities.{' '}
                        <small>
                          Optional. You can continue without opting in.
                        </small>
                      </span>
                    </label>
                  </fieldset>
                  <button className="portal-primary" disabled={waiting}>
                    {waiting ? 'Saving…' : 'Choose how to continue'}
                    <span aria-hidden="true">↗</span>
                  </button>
                </form>
              </>
            ) : state.phase === 'choose_method' ||
              (state.phase === 'requesting' && state.resendAt === 0) ? (
              <>
                <p>
                  {state.qualified === false
                    ? 'There’s more to explore together. You can still create an account and continue the conversation.'
                    : 'Your introduction is ready. Create your account to continue in the Northstar Portal.'}
                </p>
                <div className="portal-account-email">
                  {state.contact.email}
                </div>
                <div className="portal-provider-buttons">
                  {(['google', 'linkedin'] as const)
                    .filter((method) =>
                      state.definition?.methods.includes(method)
                    )
                    .map((method) => (
                      <button
                        key={method}
                        disabled={waiting}
                        onClick={() => {
                          setPassword('');
                          void actions.startOAuth(method);
                        }}
                      >
                        <b aria-hidden="true">
                          {method === 'google' ? 'G' : 'in'}
                        </b>
                        Continue with{' '}
                        {method === 'google' ? 'Google' : 'LinkedIn'}
                        <span aria-hidden="true">↗</span>
                      </button>
                    ))}
                </div>
                <div className="portal-divider">
                  or create an account with email
                </div>
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    const submitted = password;
                    setPassword('');
                    void actions.signUp(submitted);
                  }}
                >
                  <label htmlFor="portal-password">
                    Create a password
                    <input
                      id="portal-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      disabled={waiting}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby="portal-password-help"
                      aria-invalid={!!state.fieldErrors.password}
                    />
                  </label>
                  <p id="portal-password-help" className="portal-small">
                    10+ characters, with uppercase, lowercase, a number and a
                    special character. Use a made-up password for this demo.
                  </p>
                  {state.fieldErrors.password && (
                    <p className="portal-field-error" role="alert">
                      {state.fieldErrors.password}
                    </p>
                  )}
                  <button className="portal-primary" disabled={waiting}>
                    {waiting
                      ? 'Preparing your next step…'
                      : 'Create account & send confirmation'}
                    <span aria-hidden="true">↗</span>
                  </button>
                </form>
                <button
                  className="portal-text-button"
                  disabled={waiting}
                  onClick={() => {
                    setPassword('');
                    actions.back();
                  }}
                >
                  Edit my details
                </button>
                <p className="portal-small">
                  Already have an account? The live integration will offer a
                  link to sign in at the main Portal.
                </p>
              </>
            ) : state.phase === 'sign_in_required' ? (
              <>
                <p>
                  Continue by signing in at the main Northstar Portal. Your
                  existing account and password stay unchanged.
                </p>
                <aside
                  className="portal-simulator"
                  aria-label="Hosted login simulator"
                >
                  <span className="portal-eyebrow">
                    DEMO CONTROL · HOSTED LOGIN
                  </span>
                  <p>
                    The live flow would open the brand’s canonical login page.
                    It would require your existing password or linked provider
                    account.
                  </p>
                  <button
                    className="portal-primary"
                    disabled={verifying}
                    onClick={() => void verify()}
                  >
                    Simulate successful Portal login
                  </button>
                </aside>
              </>
            ) : state.phase === 'provider_pending' ? (
              <>
                <p>
                  The live flow leaves this website for {provider}, then opens
                  your application in the main Portal. No extra password or
                  confirmation email is needed when the provider verifies the
                  matching address.
                </p>
                <aside
                  className="portal-simulator"
                  aria-label="Provider simulator"
                >
                  <span className="portal-eyebrow">
                    DEMO CONTROL · NOT A REAL PROVIDER SCREEN
                  </span>
                  <h3>{provider} handoff</h3>
                  <p>
                    No provider connection is made. Simulate a verified response
                    to preview the next step.
                  </p>
                  <button
                    className="portal-primary"
                    disabled={verifying}
                    onClick={() => void verify()}
                  >
                    {verifying ? 'Checking…' : `Simulate ${provider} return`}
                  </button>
                  <button
                    className="portal-text-button"
                    disabled={verifying}
                    onClick={() => actions.cancelOAuth()}
                  >
                    Cancel and return to options
                  </button>
                </aside>
              </>
            ) : (
              <>
                <p>
                  Check <strong>{state.contact.email}</strong> for your
                  confirmation link. It will open your application in the
                  Northstar Portal, with your introduction carried through.
                </p>
                <p className="portal-small">
                  No email was sent. This prototype stores nothing outside this
                  page.
                </p>
                <button
                  className="portal-primary"
                  onClick={() => setInbox(true)}
                >
                  Open demo inbox <span aria-hidden="true">↗</span>
                </button>
                <button
                  className="portal-text-button"
                  disabled={cooldown > 0 || waiting}
                  onClick={() => void actions.resendEmail()}
                >
                  {waiting
                    ? 'Resending…'
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend confirmation'}
                </button>
                {inbox && (
                  <aside
                    className="portal-simulator"
                    aria-label="Demo confirmation email"
                  >
                    <span className="portal-eyebrow">
                      DEMO INBOX · EMAIL PREVIEW
                    </span>
                    <p className="portal-mail-from">
                      Northstar → {state.contact.email}
                    </p>
                    <h3>Your next chapter starts here.</h3>
                    <p>
                      Confirm your email to continue your application. Your
                      password is never included in this email.
                    </p>
                    <button
                      className="portal-primary"
                      disabled={verifying}
                      onClick={() => void verify()}
                    >
                      {verifying
                        ? 'Opening…'
                        : 'Simulate confirmation → Portal'}
                    </button>
                  </aside>
                )}
              </>
            )}
            {state.error && (
              <p className="portal-error" role="alert">
                {state.error}
              </p>
            )}
          </div>
          <div className="portal-card-bottom">
            <span>✳</span> Your ambition. A little direction. Something good.
          </div>
        </section>
      </main>
      <footer className="portal-footer">
        <span>Northstar is a fictional brand.</span>
        <span>
          Prototype only · No emails, provider connections, accounts or live
          sessions.
        </span>
      </footer>
    </div>
  );
}
