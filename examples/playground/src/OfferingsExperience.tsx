import { useEffect, useState } from 'react';
import {
  createOfferingsController,
  useOfferings,
  type OfferingsAddress,
} from '@franchiseai/website-integrations/offerings';
import {
  createDemoOfferingsAdapter,
  OFFERINGS_DEMO_SCENARIOS,
  type OfferingsDemoScenario,
} from '@franchiseai/website-integrations/offerings/demo';
import './offerings.css';
function Journey({
  industry,
  scenario,
}: {
  industry: 'property' | 'catering';
  scenario: OfferingsDemoScenario;
}) {
  const [controller] = useState(() =>
    createOfferingsController(
      createDemoOfferingsAdapter({ industry, scenario })
    )
  );
  const state = useOfferings(controller);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState<OfferingsAddress>({
    address1: '',
    city: '',
    state: 'ON',
    postalCode: '',
    country: 'CA',
  });
  const [offeringId, setOffering] = useState('');
  const offering = offeringId || state.offerings[0]?.id || '';
  const profile = state.locations.find((row) => row.id === location)?.profile;
  useEffect(() => {
    void controller.load();
  }, [controller]);
  const choose = (id: string, service = offering) => {
    if (service)
      void controller.choose({
        offeringId: service,
        ...(id ? { locationId: id } : { address }),
      });
  };
  return (
    <div className={`agency-offerings ${industry}`}>
      <header>
        <small>
          {industry === 'property'
            ? 'SUMMIT · PROPERTY MANAGEMENT'
            : 'COMMON TABLE · CATERING'}
        </small>
        <h1>
          {industry === 'property'
            ? 'Your property. In good hands.'
            : 'Good company. Great food.'}
        </h1>
        <p>
          {industry === 'property'
            ? 'Talk to a local property management team in Ontario.'
            : 'Bring us your occasion. We’ll help make it memorable.'}
        </p>
        {profile && (
          <article className="agency-location">
            <h2>{profile.name}</h2>
            <p>{profile.description}</p>
            <address>
              {profile.address1}
              <br />
              {profile.address2 && (
                <>
                  {profile.address2}
                  <br />
                </>
              )}
              {profile.city}, {profile.state} {profile.postalCode}
              <br />
              {profile.country}
            </address>
            <p>
              <a href={`tel:${profile.phone}`}>{profile.phone}</a>
            </p>
            <p>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
          </article>
        )}
      </header>
      <main>
        {state.receipt ? (
          <>
            <h2>Thank you. We received your enquiry.</h2>
            <p>
              Your reference is {state.receipt.receiptId}. This is a request,
              not a confirmed booking.
            </p>
            <button
              onClick={() => {
                controller.newEnquiry();
                setLocation('');
              }}
            >
              Make another enquiry
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void controller.submit();
            }}
          >
            <h2>
              {industry === 'property'
                ? 'Tell us about your property'
                : 'Tell us about your event'}
            </h2>
            <label>
              Service
              <select
                disabled={state.retryPending}
                value={offering}
                onChange={(e) => {
                  setOffering(e.target.value);
                  if (location || state.definition)
                    choose(location, e.target.value);
                }}
              >
                {state.offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Local team
              <select
                disabled={state.retryPending}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (e.target.value) choose(e.target.value);
                }}
              >
                <option value="">Find a team by address</option>
                {state.locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.profile.name}
                    {!l.intakeEnabled ? ' — intake unavailable' : ''}
                  </option>
                ))}
              </select>
            </label>
            {!location && (
              <fieldset disabled={state.retryPending}>
                <label>
                  Street address
                  <input
                    value={address.address1}
                    onChange={(e) =>
                      setAddress({ ...address, address1: e.target.value })
                    }
                  />
                </label>
                <label>
                  City
                  <input
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                </label>
                <label>
                  Province
                  <input
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                  />
                </label>
                <label>
                  Postal code
                  <input
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  disabled={
                    !offering ||
                    !address.address1 ||
                    !address.city ||
                    !address.postalCode
                  }
                  onClick={() => choose('')}
                >
                  Find my team
                </button>
              </fieldset>
            )}
            {state.phase === 'loading' && (
              <p role="status">Loading locations…</p>
            )}
            {state.phase === 'resolving' && (
              <p role="status">Finding your team…</p>
            )}
            {state.definition && (
              <>
                <p>
                  {state.definition.locationId
                    ? 'Your enquiry will go to the selected local team.'
                    : 'Head office will help find the right team.'}
                </p>
                <fieldset disabled={state.retryPending}>
                  <label>
                    Your name
                    <input
                      value={state.contact.name}
                      onChange={(e) =>
                        controller.contact({
                          ...state.contact,
                          name: e.target.value,
                        })
                      }
                    />
                    <small>{state.errors.name}</small>
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={state.contact.email ?? ''}
                      onChange={(e) =>
                        controller.contact({
                          ...state.contact,
                          email: e.target.value,
                        })
                      }
                    />
                    <small>{state.errors.email}</small>
                  </label>
                  <label>
                    Phone
                    <input
                      type="tel"
                      value={state.contact.phone ?? ''}
                      onChange={(e) =>
                        controller.contact({
                          ...state.contact,
                          phone: e.target.value,
                        })
                      }
                    />
                  </label>
                  {state.definition.form.fields.map((f) => (
                    <label key={f.id}>
                      {f.label}
                      {f.required ? ' *' : ''}
                      {f.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={state.answers[f.id] === true}
                          onChange={(e) =>
                            controller.answer(f.id, e.target.checked)
                          }
                        />
                      ) : f.type === 'textarea' ? (
                        <textarea
                          value={String(state.answers[f.id] ?? '')}
                          onChange={(e) =>
                            controller.answer(f.id, e.target.value)
                          }
                        />
                      ) : f.type === 'select' ? (
                        <select
                          value={String(state.answers[f.id] ?? '')}
                          onChange={(e) =>
                            controller.answer(f.id, e.target.value)
                          }
                        >
                          <option value="">Choose</option>
                          {f.options.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={
                            f.type === 'number'
                              ? 'number'
                              : f.type === 'date'
                                ? 'date'
                                : 'text'
                          }
                          value={String(state.answers[f.id] ?? '')}
                          onChange={(e) =>
                            controller.answer(
                              f.id,
                              f.type === 'number' && e.target.value
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                        />
                      )}
                      <small>{state.errors[f.id]}</small>
                    </label>
                  ))}
                </fieldset>
                <button
                  disabled={
                    state.phase === 'submitting' ||
                    state.errorCode === 'OFFERING_CHANGED'
                  }
                  type="submit"
                >
                  {state.phase === 'submitting'
                    ? 'Sending…'
                    : state.retryPending
                      ? 'Retry the same enquiry'
                      : 'Send enquiry'}
                </button>
              </>
            )}
            {state.changedFields.length > 0 && (
              <p>Review changed questions: {state.changedFields.join(', ')}</p>
            )}
            {state.error && <p role="alert">{state.error}</p>}
            {state.errorCode === 'OFFERING_CHANGED' && (
              <button
                type="button"
                onClick={() => void controller.reloadForm()}
              >
                Reload form and review answers
              </button>
            )}
          </form>
        )}
      </main>
      <footer>Demo only · no messages are sent</footer>
    </div>
  );
}
export function OfferingsExperience() {
  const [industry, setIndustry] = useState<'property' | 'catering'>('property'),
    [scenario, setScenario] = useState<OfferingsDemoScenario>('standard');
  return (
    <>
      <div className="agency-controls">
        <label>
          Example
          <select
            value={industry}
            onChange={(e) =>
              setIndustry(
                e.target.value === 'catering' ? 'catering' : 'property'
              )
            }
          >
            <option value="property">Property management</option>
            <option value="catering">Catering</option>
          </select>
        </label>
        <label>
          Scenario
          <select
            value={scenario}
            onChange={(e) => {
              const found = OFFERINGS_DEMO_SCENARIOS.find(
                (s) => s === e.target.value
              );
              if (found) setScenario(found);
            }}
          >
            {OFFERINGS_DEMO_SCENARIOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <a href="?">Funnel / Portal examples</a>
      </div>
      <Journey
        key={`${industry}:${scenario}`}
        industry={industry}
        scenario={scenario}
      />
    </>
  );
}
