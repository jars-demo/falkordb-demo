// The workshop: the step-by-step guide next to the live playground (one card per FalkorDB task).

import { ActivityLog } from '../components/cards/ActivityLog.tsx'
import { DeleteCard } from '../components/cards/DeleteCard.tsx'
import { GraphCard } from '../components/cards/GraphCard.tsx'
import { GraphRagCard } from '../components/cards/GraphRagCard.tsx'
import { QueryCard } from '../components/cards/QueryCard.tsx'
import { SampleCard } from '../components/cards/SampleCard.tsx'
import { Hero } from '../components/layout/Hero.tsx'
import type { GraphState, StepId } from '../hooks/useGraph.ts'
import { STEPS } from '../workshop/steps.tsx'
import { WorkshopPanel } from '../workshop/WorkshopPanel.tsx'

interface Props {
  state: GraphState
  dark: boolean
  guideOpen: boolean
  onGuide: (open: boolean) => void
  current: number
  done: StepId[]
  onSelect: (index: number) => void
  onComplete: (id: StepId) => void
  onReset: () => void
}

export function WorkshopPage({ state, dark, guideOpen, onGuide, current, done, onSelect, onComplete, onReset }: Props) {
  const focused = guideOpen ? STEPS[current].card : null
  return (
    <div className="layout">
      {guideOpen && (
        <WorkshopPanel state={state} current={current} done={done} onSelect={onSelect} onComplete={onComplete} />
      )}
      <main className="main">
        <ProgressBanner current={current} done={done} guideOpen={guideOpen} onGuide={onGuide} onSelect={onSelect} onReset={onReset} />
        <Hero />
        <div className="grid">
          <SampleCard state={state} highlight={focused === 'card-load'} />
          <ActivityLog lines={state.log} />
          <QueryCard state={state} highlight={focused === 'card-query'} />
          <GraphCard state={state} highlight={focused === 'card-explore'} dark={dark} />
          <GraphRagCard state={state} highlight={focused === 'card-graphrag'} />
          <DeleteCard state={state} highlight={focused === 'card-delete'} />
        </div>
      </main>
    </div>
  )
}

interface BannerProps {
  current: number
  done: StepId[]
  guideOpen: boolean
  onGuide: (open: boolean) => void
  onSelect: (index: number) => void
  onReset: () => void
}

function ProgressBanner({ current, done, guideOpen, onGuide, onSelect, onReset }: BannerProps) {
  const finished = done.length === STEPS.length
  const percent = Math.round((done.length / STEPS.length) * 100)
  return (
    <div className={`banner ${finished ? 'finished' : ''}`}>
      <div className="banner-text">
        {finished ? (
          <>
            <strong>Workshop complete 🎉</strong>
            <span>Now model your own data as a graph and open a pull request.</span>
          </>
        ) : (
          <>
            <span className="banner-step">
              Step {current + 1} of {STEPS.length}
            </span>
            <strong>{STEPS[current].title}</strong>
          </>
        )}
      </div>
      <div className="banner-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${percent}%` }} />
      </div>
      <div className="row">
        {finished ? (
          <button type="button" className="btn ghost small" onClick={onReset}>Start over</button>
        ) : (
          current < STEPS.length - 1 && (
            <button type="button" className="btn ghost small" onClick={() => onSelect(current + 1)}>
              Next step →
            </button>
          )
        )}
        <button type="button" className="btn ghost small" onClick={() => onGuide(!guideOpen)}>
          {guideOpen ? 'Hide guide' : 'Show guide'}
        </button>
      </div>
    </div>
  )
}
