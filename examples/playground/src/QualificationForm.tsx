import { useEffect, useId, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  FUNNEL_CONTACT_BLOCK_FIELDS,
  FUNNEL_SMS_CONSENT_COPY,
  funnelSmsConsentAnchorFieldId,
} from '@franchiseai/website-integrations';
import type {
  QualificationController,
  QualificationQuestion,
  QualificationState,
} from '@franchiseai/website-integrations';

type Props = {
  state: QualificationState;
  actions: QualificationController;
  design: 'table' | 'pulse';
};

// This file belongs to the example website. The integration supplies no markup.
export function QualificationForm({ state, actions, design }: Props) {
  const prefix = useId();
  const region = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const page = state.definition?.pages[state.pageIndex];
  const busy = state.phase === 'submitting' || state.phase === 'continuing';
  const pageCount = state.definition?.pages.length ?? 2;
  useEffect(() => {
    if (
      state.phase === 'outcome' ||
      state.phase === 'complete' ||
      state.phase === 'resume_link_sent' ||
      state.pageIndex > 0
    )
      title.current?.focus({ preventScroll: true });
  }, [state.pageIndex, state.phase]);
  useEffect(() => {
    const invalid = region.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    );
    const target = invalid?.matches('input, select, textarea')
      ? invalid
      : invalid?.querySelector<HTMLElement>('input');
    target?.focus();
  }, [state.fieldErrors]);

  const labelFor = (question: QualificationQuestion) =>
    question.question || question.name || 'Your answer';
  const errorFor = (id: string) => state.fieldErrors[id];
  const hint = (id: string) =>
    errorFor(id) ? `${prefix}-${id}-error` : undefined;
  const error = (id: string) =>
    errorFor(id) ? (
      <span className="field-error" id={hint(id)}>
        {errorFor(id)}
      </span>
    ) : null;
  const renderQuestion = (question: QualificationQuestion): ReactNode => {
    const id = `${prefix}-${question.id}`;
    const answer = state.answers[question.id];
    const label = labelFor(question);
    const stringValue =
      typeof answer === 'string' || typeof answer === 'number'
        ? String(answer)
        : '';
    const choices = question.options ?? [];
    const common = {
      id,
      'aria-invalid': Boolean(errorFor(question.id)),
      'aria-describedby': hint(question.id),
      required: Boolean(question.required),
      disabled: busy,
    };
    if (
      question.type === 'singleselect' ||
      question.type === 'multiselect' ||
      question.type === 'boolean'
    ) {
      const options = question.type === 'boolean' ? ['Yes', 'No'] : choices;
      return (
        <fieldset
          className="question choices"
          aria-describedby={hint(question.id)}
          aria-invalid={Boolean(errorFor(question.id))}
          disabled={busy}
        >
          <legend>
            {label}
            {question.required ? <span aria-hidden="true"> *</span> : null}
          </legend>
          <div className="choice-options">
            {options.map((option) => {
              const checked =
                question.type === 'multiselect'
                  ? Array.isArray(answer) && answer.includes(option)
                  : question.type === 'boolean'
                    ? answer === (option === 'Yes')
                    : answer === option;
              return (
                <label
                  className={`choice ${checked ? 'selected' : ''}`}
                  key={option}
                >
                  <input
                    type={
                      question.type === 'multiselect' ? 'checkbox' : 'radio'
                    }
                    name={id}
                    value={option}
                    checked={checked}
                    onChange={() =>
                      actions.setAnswer(
                        question.id,
                        question.type === 'multiselect'
                          ? checked
                            ? (Array.isArray(answer) ? answer : []).filter(
                                (item) => item !== option
                              )
                            : [...(Array.isArray(answer) ? answer : []), option]
                          : question.type === 'boolean'
                            ? option === 'Yes'
                            : option
                      )
                    }
                  />
                  <span>{option}</span>
                  <span className="choice-mark" aria-hidden="true">
                    {checked ? '✓' : '+'}
                  </span>
                </label>
              );
            })}
          </div>
          {error(question.id)}
        </fieldset>
      );
    }
    return (
      <div className="question">
        <label htmlFor={id}>
          {label}
          {question.required ? (
            ' *'
          ) : (
            <span className="optional"> optional</span>
          )}
        </label>
        {question.type === 'long-text' ? (
          <textarea
            {...common}
            value={stringValue}
            onChange={(event) =>
              actions.setAnswer(question.id, event.target.value)
            }
          />
        ) : question.type === 'dropdown' ? (
          <select
            {...common}
            value={stringValue}
            onChange={(event) =>
              actions.setAnswer(question.id, event.target.value)
            }
          >
            <option value="">Select an option</option>
            {choices.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            {...common}
            type={
              question.type === 'phone'
                ? 'tel'
                : question.type === 'email'
                  ? 'email'
                  : question.type === 'date'
                    ? 'date'
                    : question.type === 'url'
                      ? 'url'
                      : question.type === 'number'
                        ? 'number'
                        : 'text'
            }
            inputMode={question.type === 'currency' ? 'decimal' : undefined}
            value={stringValue}
            autoComplete={question.type === 'phone' ? 'tel' : undefined}
            placeholder={
              question.id === 'market'
                ? 'City or region'
                : question.type === 'phone'
                  ? '+1 555 123 4567'
                  : undefined
            }
            onChange={(event) =>
              actions.setAnswer(question.id, event.target.value)
            }
          />
        )}
        {error(question.id)}
      </div>
    );
  };
  const feedback = state.error ? (
    <div className="form-error" role="alert">
      {state.error}
    </div>
  ) : null;
  const heading = (text: string) => (
    <h2 ref={title} tabIndex={-1}>
      {text}
    </h2>
  );
  const button = (label: string, action: () => void, secondary = false) => (
    <button
      className={secondary ? 'secondary-action' : 'primary-action'}
      type="button"
      onClick={action}
      disabled={busy}
    >
      {label}
      {!secondary && <span aria-hidden="true">↗</span>}
    </button>
  );
  let content: ReactNode;
  switch (state.phase) {
    case 'idle':
    case 'loading': {
      content = (
        <div className="status-content" role="status">
          <div className="loading-mark" />
          {heading('Getting things ready…')}
          <p>Your next chapter starts here.</p>
        </div>
      );

      break;
    }
    case 'load_error': {
      content = (
        <div className="status-content">
          {heading('We couldn’t load the form.')}
          <p>Please try again in a moment.</p>
          {feedback}
          {button('Try again', () => void actions.load())}
        </div>
      );

      break;
    }
    case 'completion_error': {
      content = (
        <div className="status-content">
          {heading('Your answers are saved.')}
          <p>
            We couldn’t finish saving your place in the application. Try again
            to continue.
          </p>
          {feedback}
          {button('Retry continuation', () => void actions.submit())}
        </div>
      );

      break;
    }
    case 'resume_link_sent':
    case 'complete': {
      content = (
        <div className="status-content">
          <span className="outcome-mark" aria-hidden="true">
            ↗
          </span>
          {heading('Check your inbox.')}
          <p>
            {state.phase === 'complete'
              ? 'Your progress is saved. Continue securely from the link sent to your email.'
              : 'If you already have an application, we’ve sent a secure link to pick up where you left off.'}
          </p>
          <div className="demo-receipt">Demo preview · No email was sent.</div>
          {state.phase === 'resume_link_sent' &&
            button('Use a different email', actions.useDifferentEmail, true)}
        </div>
      );

      break;
    }
    case 'portal_required': {
      content = (
        <div className="status-content">
          {heading('Welcome back.')}
          <p>Continue your existing application in your applicant portal.</p>
          {state.portalUrl && (
            <a className="primary-action" href={state.portalUrl}>
              Go to your portal ↗
            </a>
          )}
          {button('Use a different email', actions.useDifferentEmail, true)}
        </div>
      );

      break;
    }
    case 'outcome':
    case 'continuing': {
      const qualified = state.outcome === 'qualified';
      content = (
        <div className="status-content">
          <span className="outcome-mark" aria-hidden="true">
            {qualified ? '✳' : '↗'}
          </span>
          <div className="eyebrow">
            {qualified ? 'A promising beginning' : 'There’s more to your story'}
          </div>
          {heading(
            qualified
              ? 'This could be your next chapter.'
              : 'Let’s keep the conversation going.'
          )}
          <p>
            {qualified
              ? 'You meet the initial criteria. We’ve saved your details so you can take the next step in your application.'
              : 'You don’t meet the initial criteria just yet. Your answers are saved, and the next step follows the brand’s configured process.'}
          </p>
          {feedback}
          {button(
            busy ? 'Sending…' : 'Email my next step',
            () => void actions.continue()
          )}
          <p className="fine-print">
            We’ll send a secure link to your email address.
          </p>
        </div>
      );

      break;
    }
    default: {
      const submit = (event: FormEvent) => {
        event.preventDefault();
        void actions.submit();
      };
      const anchor = page
        ? funnelSmsConsentAnchorFieldId(page.questions)
        : null;
      content = (
        <>
          <div className="form-progress">
            <span>
              {design === 'pulse' ? 'YOUR GAME PLAN' : 'A little introduction'}
            </span>
            <span>
              0{state.pageIndex + 1} / 0{pageCount}
            </span>
          </div>
          <div
            className="progress-track"
            aria-label={`Step ${state.pageIndex + 1} of ${pageCount}`}
          >
            <span
              style={{ width: `${((state.pageIndex + 1) / pageCount) * 100}%` }}
            />
          </div>
          {heading(page?.title ?? 'Let’s get acquainted.')}
          <p className="form-intro">{page?.description}</p>
          <form noValidate onSubmit={submit} aria-busy={busy}>
            {state.pageIndex === 0 && (
              <div className="contact-fields">
                {FUNNEL_CONTACT_BLOCK_FIELDS.map((field) =>
                  field.key === 'phone' ? null : (
                    <div
                      className={`question contact-${field.key}`}
                      key={field.key}
                    >
                      <label htmlFor={`${prefix}-${field.key}`}>
                        {field.label} *
                      </label>
                      <input
                        id={`${prefix}-${field.key}`}
                        type={field.inputType}
                        autoComplete={field.autoComplete}
                        required
                        value={state.identity[field.key]}
                        readOnly={state.identityLocked && field.key === 'email'}
                        disabled={busy}
                        aria-invalid={Boolean(errorFor(field.key))}
                        aria-describedby={hint(field.key)}
                        onChange={(event) => {
                          if (field.key !== 'phone')
                            actions.setIdentity(field.key, event.target.value);
                        }}
                      />
                      {error(field.key)}
                    </div>
                  )
                )}
              </div>
            )}
            {page?.questions.map((question) => (
              <div key={question.id}>
                {renderQuestion(question)}
                {question.id === anchor &&
                  state.definition?.smsOptInEnabled && (
                    <label className="consent">
                      <input
                        type="checkbox"
                        checked={state.smsConsent}
                        disabled={busy}
                        onChange={(event) =>
                          actions.setSmsConsent(event.target.checked)
                        }
                      />
                      <span>{FUNNEL_SMS_CONSENT_COPY}</span>
                    </label>
                  )}
              </div>
            ))}
            {feedback}
            <div className="form-actions">
              {state.pageIndex > 0 && button('← Back', actions.back, true)}
              <button className="primary-action" type="submit" disabled={busy}>
                {busy
                  ? 'Saving your answers…'
                  : state.pageIndex === pageCount - 1
                    ? 'Find my next step'
                    : 'Continue'}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <p className="fine-print">
              {state.identityLocked
                ? 'Your email is linked to this enquiry. Your answers save as you go.'
                : 'About 2 minutes. No account needed. No commitment.'}
            </p>
          </form>
        </>
      );
    }
  }
  return (
    <div
      ref={region}
      className={`qualification-form ${design}-form`}
      id="enquire"
    >
      {content}
    </div>
  );
}
