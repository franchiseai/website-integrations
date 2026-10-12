import { useState } from 'react';
import {
  createQualificationController,
  readQualificationAttribution,
  useQualification,
} from '@franchiseai/website-integrations';
import {
  createDemoQualificationAdapter,
  DEMO_SCENARIOS,
} from '@franchiseai/website-integrations/demo';
import type { DemoScenario } from '@franchiseai/website-integrations/demo';
import { QualificationForm } from './QualificationForm';

type Design = 'table' | 'pulse';

function TableStory() {
  return (
    <div className="brand-story table-story">
      <div className="eyebrow">
        <span className="tiny-line" /> GOOD FOOD. GREAT COMPANY.
      </div>
      <h1>
        Make room
        <br />
        for{' '}
        <em>
          something
          <br />
          of your own.
        </em>
      </h1>
      <p className="story-intro">
        A neighbourhood gathering place. A business with heart. Bring a little
        more to the table with your own Common Table.
      </p>
      <div
        className="table-art"
        role="img"
        aria-label="Illustration of a restaurant place setting with an olive sprig"
      >
        <span className="art-caption">
          THE NEXT SEAT
          <br />
          IS YOURS.
        </span>
        <div className="napkin" />
        <div className="plate">
          <div className="plate-inner">
            <span>ct.</span>
          </div>
        </div>
        <svg className="olive" viewBox="0 0 160 220" aria-hidden="true">
          <path
            d="M45 208C93 160 100 86 135 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <g
              key={i}
              transform={`translate(${57 + i * 14} ${168 - i * 32}) rotate(24)`}
            >
              <ellipse
                rx="9"
                ry="26"
                transform="translate(-13 -11) rotate(-44)"
              />
              <ellipse
                rx="8"
                ry="23"
                transform="translate(15 -16) rotate(31)"
              />
            </g>
          ))}
        </svg>
        <div className="fork">
          Ⅲ<span />
        </div>
        <div className="knife" />
        <span className="art-number">FIG. 01 — A FRESH START</span>
      </div>
      <div className="story-footer">
        <span className="round-seal">
          GROW
          <br />
          TOGETHER
        </span>
        <p>
          You bring the ambition.
          <br />
          <strong>We’ll bring the recipe.</strong>
        </p>
      </div>
    </div>
  );
}

function PulseStory() {
  return (
    <div className="brand-story pulse-story">
      <div className="eyebrow">
        <span className="live-dot" /> BUILT FOR PEOPLE WHO BUILD.
      </div>
      <h1>
        OWN
        <br />
        YOUR
        <br />
        <span>NEXT.</span>
      </h1>
      <p className="story-intro">
        Turn your drive into something bigger. Build a training space that moves
        your community—and your future—forward.
      </p>
      <div
        className="pulse-art"
        role="img"
        aria-label="Abstract running track symbolising momentum"
      >
        <div className="track track-one" />
        <div className="track track-two" />
        <div className="track track-three" />
        <span className="track-arrow">↗</span>
        <span className="track-caption">
          AMBITION
          <br />
          IN MOTION.
        </span>
      </div>
      <div className="pulse-values">
        <span>01 / YOUR DRIVE</span>
        <span>02 / OUR SYSTEM</span>
        <span>03 / REAL IMPACT</span>
      </div>
    </div>
  );
}

function Studio({
  scenario,
  onScenario,
}: {
  scenario: DemoScenario;
  onScenario: (scenario: DemoScenario) => void;
}) {
  const [design, setDesign] = useState<Design>('table');
  const [revision, setRevision] = useState(0);
  return (
    <>
      <div className="studio-toolbar">
        <div className="studio-title">
          <span className="studio-symbol">⠿</span>
          <strong>Integration studio</strong>
          <span className="prototype-tag">PROTOTYPE</span>
        </div>
        <div className="design-switch" role="group" aria-label="Website design">
          <button
            aria-pressed={design === 'table'}
            onClick={() => setDesign('table')}
          >
            01 Common Table
          </button>
          <button
            aria-pressed={design === 'pulse'}
            onClick={() => setDesign('pulse')}
          >
            02 Pulse
          </button>
        </div>
        <div className="studio-settings">
          <label htmlFor="scenario">Scenario</label>
          <select
            id="scenario"
            value={scenario}
            onChange={(event) => {
              const match = DEMO_SCENARIOS.find(
                (item) => item.value === event.target.value
              );
              if (match) onScenario(match.value);
            }}
          >
            {DEMO_SCENARIOS.map((item) => (
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
      <Experience
        key={`${scenario}-${revision}`}
        design={design}
        scenario={scenario}
      />
    </>
  );
}

function Experience({
  design,
  scenario,
}: {
  design: Design;
  scenario: DemoScenario;
}) {
  const [controller] = useState(() =>
    createQualificationController({
      adapter: createDemoQualificationAdapter({ scenario }),
      attribution: readQualificationAttribution(window.location.search),
    })
  );
  const { state, actions } = useQualification(controller);
  return (
    <div className={`website ${design}`}>
      <header className="site-header">
        <a
          className="wordmark"
          href="#top"
          aria-label={design === 'table' ? 'Common Table home' : 'Pulse home'}
        >
          {design === 'table' ? (
            <>
              common<span className="wordmark-flower">✳</span>table
              <span className="wordmark-small">NEIGHBOURHOOD KITCHENS</span>
            </>
          ) : (
            <>
              PULSE<span className="wordmark-plus">↗</span>
            </>
          )}
        </a>
        <nav aria-label="Main navigation">
          <a href="#story">
            {design === 'table' ? 'Our philosophy' : 'The mindset'}
          </a>
          <a href="#enquire" className="nav-cta">
            {design === 'table' ? 'Grow with us' : 'Become an owner'}{' '}
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main id="top">
        <div className="page-kicker">
          <span>
            {design === 'table'
              ? 'A NEW CHAPTER, TOGETHER'
              : 'THE NEXT MOVE IS YOURS'}
          </span>
          <span>FRANCHISE OPPORTUNITIES / 2026</span>
        </div>
        <div className="experience-grid">
          <section id="story" aria-label="Franchise opportunity">
            {design === 'table' ? <TableStory /> : <PulseStory />}
          </section>
          <section
            className="form-section"
            aria-label="Franchise qualification"
          >
            <div className="form-section-heading">
              <span>
                {design === 'table' ? 'Pull up a chair.' : 'LET’S GET TO WORK.'}
              </span>
              <span className="small-arrow">↘</span>
            </div>
            <QualificationForm
              state={state}
              actions={actions}
              design={design}
            />
            <div className="form-note">
              <span aria-hidden="true">◇</span>{' '}
              {design === 'table'
                ? 'An introduction today. Something extraordinary tomorrow.'
                : 'BIG MOVES START WITH A SMALL FIRST STEP.'}
            </div>
          </section>
        </div>
        <section className="brand-strip" aria-label="Our approach">
          {design === 'table' ? (
            <>
              <span>Rooted in community.</span>
              <span>Made with care.</span>
              <span>Built to grow.</span>
            </>
          ) : (
            <>
              <span>MORE THAN A GYM.</span>
              <span>A PLACE TO BELONG.</span>
              <span>A BUSINESS TO OWN.</span>
            </>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <span>
          {design === 'table' ? 'Common Table' : 'PULSE'} © 2026 · Fictional
          brand
        </span>
        <span>
          Demo mode · Your information stays in this page. No leads or emails
          are created.
        </span>
      </footer>
    </div>
  );
}

export function App() {
  const [scenario, setScenario] = useState<DemoScenario>('qualified');
  return <Studio scenario={scenario} onScenario={setScenario} />;
}
