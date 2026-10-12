import { useId, useRef } from 'react';
import type {
  QualificationController,
  QualificationState,
} from '@franchiseai/website-integrations';
import { QualificationForm } from './QualificationForm';
import './outpost.css';

const territories = [
  {
    name: 'Bristol',
    number: '01',
    x: '28%',
    y: '65%',
    note: 'City meets countryside',
    coordinates: '51.45° N / 2.59° W',
  },
  {
    name: 'Edinburgh',
    number: '02',
    x: '51%',
    y: '28%',
    note: 'A northern state of mind',
    coordinates: '55.95° N / 3.19° W',
  },
  {
    name: 'Brighton',
    number: '03',
    x: '76%',
    y: '60%',
    note: 'Good days by the coast',
    coordinates: '50.82° N / 0.14° W',
  },
];

export function OutpostExperience({
  state,
  actions,
}: {
  state: QualificationState;
  actions: QualificationController;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const patternId = useId();
  const market =
    typeof state.answers.market === 'string' ? state.answers.market : '';
  const selected = territories.find((territory) => territory.name === market);
  const canChoose = state.phase === 'editing' && state.pageIndex === 0;
  const openBrief = () => dialog.current?.showModal();
  return (
    <div className="outpost">
      <header className="outpost-header">
        <a
          href="#outpost-top"
          className="outpost-logo"
          aria-label="Outpost home"
        >
          <span aria-hidden="true">↟</span> OUTPOST<sup>®</sup>
        </a>
        <span className="outpost-header-note">
          COFFEE. FRESH AIR. A PLACE OF YOUR OWN.
        </span>
        <button className="outpost-header-action" onClick={openBrief}>
          Your field notes <span aria-hidden="true">↗</span>
        </button>
      </header>
      <main id="outpost-top" className="outpost-main">
        <div className="outpost-intro">
          <div>
            <p className="outpost-label">
              <span className="outpost-signal" /> THE NEXT CHAPTER IS OUT THERE
            </p>
            <h1>
              A little less ordinary.
              <br />
              <em>A little more yours.</em>
            </h1>
          </div>
          <p>
            Good coffee brings people together.
            <br />
            Great places give them a reason to stay.
            <br />
            <strong>Where will you put down roots?</strong>
          </p>
        </div>
        <section
          className="outpost-map"
          aria-label="Explore sample territories"
        >
          <svg
            className="outpost-contours"
            viewBox="0 0 1100 500"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id={patternId}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#cad9c8"
                  strokeWidth=".6"
                />
              </pattern>
            </defs>
            <rect width="1100" height="500" fill={`url(#${patternId})`} />
            <path
              d="M-60 380 Q 130 230 325 325 T 690 260 T 1190 280"
              fill="none"
              stroke="#bdced0"
              strokeWidth="62"
            />
            <path
              d="M-60 380 Q 130 230 325 325 T 690 260 T 1190 280"
              fill="none"
              stroke="#d0dedc"
              strokeWidth="50"
            />
            {Array.from({ length: 12 }, (_, index) => (
              <ellipse
                key={index}
                cx="775"
                cy="90"
                rx={100 + index * 25}
                ry={48 + index * 18}
                transform="rotate(-24 775 90)"
                fill="none"
                stroke="#a8bca7"
                strokeWidth="1"
                opacity=".65"
              />
            ))}
            {Array.from({ length: 8 }, (_, index) => (
              <ellipse
                key={index}
                cx="130"
                cy="470"
                rx={100 + index * 22}
                ry={50 + index * 20}
                transform="rotate(18 130 470)"
                fill="none"
                stroke="#a8bca7"
                strokeWidth="1"
                opacity=".65"
              />
            ))}
            <path
              d="M300 320 Q330 165 560 135 T830 300"
              fill="none"
              stroke="#486954"
              strokeWidth="1.5"
              strokeDasharray="4 7"
            />
          </svg>
          <div className="outpost-map-caption">
            <span>THE OPPORTUNITY ATLAS</span>
            <small>SELECT A PIN TO START EXPLORING</small>
          </div>
          <div className="outpost-compass" aria-hidden="true">
            <span>N</span>↑
          </div>
          {territories.map((territory) => (
            <button
              key={territory.name}
              className="outpost-pin"
              style={{ left: territory.x, top: territory.y }}
              aria-pressed={market === territory.name}
              aria-label={`Choose ${territory.name}`}
              disabled={!canChoose}
              onClick={() => actions.setAnswer('market', territory.name)}
            >
              <span className="outpost-pin-dot" aria-hidden="true">
                {market === territory.name ? '✓' : '+'}
              </span>
              <span className="outpost-pin-label">
                <small>OUTPOST / {territory.number}</small>
                {territory.name}
              </span>
            </button>
          ))}
          <div className="outpost-map-key">
            <span /> A PLACE TO BEGIN <i /> A ROUTE OF YOUR OWN
          </div>
          <span className="outpost-map-scale" aria-hidden="true">
            ILLUSTRATIVE ATLAS ├────┤
          </span>
        </section>
        <section className="outpost-brief" aria-label="Your selected territory">
          <div className="outpost-brief-index" aria-hidden="true">
            {selected?.number ?? '↟'}
          </div>
          <div className="outpost-brief-location" aria-live="polite">
            <p className="outpost-label">YOUR STARTING POINT</p>
            <h2>{market || 'Somewhere with possibility.'}</h2>
            <p>
              {selected?.note ??
                'Pick a pin above, or tell us about another place.'}
            </p>
          </div>
          <div className="outpost-brief-meta">
            <span>
              {selected?.coordinates ?? 'YOUR AMBITION / OUR KNOW-HOW'}
            </span>
            <p>
              A few field notes.
              <br />A new direction.
            </p>
          </div>
          <button className="outpost-start" onClick={openBrief}>
            Build your outpost <span aria-hidden="true">↗</span>
          </button>
        </section>
        <p className="outpost-map-disclaimer">
          Sample places on an illustrative map. Territory availability is not
          assessed in this demo.
        </p>
      </main>
      <footer className="outpost-footer">
        <span>OUTPOST FIELD GUIDE — VOL. 03 / 2026</span>
        <span>
          Fictional brand · Demo mode · No leads or emails are created.
        </span>
      </footer>
      <dialog ref={dialog} className="outpost-dialog" aria-labelledby={titleId}>
        <div className="outpost-dialog-bar">
          <span id={titleId}>OUTPOST / YOUR FIELD NOTES</span>
          <button
            type="button"
            aria-label="Close field notes"
            onClick={() => dialog.current?.close()}
          >
            ✕
          </button>
        </div>
        <div className="outpost-dialog-content">
          <aside className="outpost-dialog-aside">
            <span aria-hidden="true">↟</span>
            <h2>
              Every good thing
              <br />
              starts somewhere.
            </h2>
            <p>
              Your place.
              <br />
              Your people.
              <br />
              Your next chapter.
            </p>
            <div className="outpost-dialog-stamp">
              {market || 'A place of your own'}
              <small>EXPLORER’S EDITION / 2026</small>
            </div>
          </aside>
          <QualificationForm state={state} actions={actions} design="outpost" />
        </div>
      </dialog>
    </div>
  );
}
