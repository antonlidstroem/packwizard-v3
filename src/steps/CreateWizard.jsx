import { useState, useCallback } from 'react'
import PreviewPanel   from '../components/PreviewPanel.jsx'
import StepBasics     from './StepBasics.jsx'
import StepVisual     from './StepVisual.jsx'
import StepViews      from './StepViews.jsx'
import StepFeatures   from './StepFeatures.jsx'
import StepBackend    from './StepBackend.jsx'
import StepAiStrategy from './StepAiStrategy.jsx'
import StepActivities from './StepActivities.jsx'
import StepAiPrompt   from './StepAiPrompt.jsx'
import StepExport     from './StepExport.jsx'

const STEPS = [
  { id: 'basics',      label: 'Grundinfo',    icon: '📝', component: StepBasics },
  { id: 'visual',      label: 'Utseende',     icon: '🎨', component: StepVisual },
  { id: 'views',       label: 'Vyer',         icon: '⊞',  component: StepViews },
  { id: 'features',    label: 'Funktioner',   icon: '⚙️', component: StepFeatures },
  { id: 'backend',     label: 'Backend',      icon: '⚡', component: StepBackend },
  { id: 'ai-strategy', label: 'AI-strategi',  icon: '🧠', component: StepAiStrategy },
  { id: 'activities',  label: 'Aktiviteter',  icon: '📋', component: StepActivities },
  { id: 'ai',          label: 'AI-prompt',    icon: '🤖', component: StepAiPrompt },
  { id: 'export',      label: 'Exportera',    icon: '📦', component: StepExport },
]

export default function CreateWizard({ ctx }) {
  const { state, update } = ctx
  const [currentStep, setCurrentStep] = useState(state.step || 0)

  const goTo = useCallback((i) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, i))
    setCurrentStep(next)
    update({ step: next })
  }, [update])

  const StepComponent = STEPS[currentStep].component
  const aiCount  = state.aiFields?.length || 0
  const backendCount = (state.packMeta?.backends || []).filter(b => b.id && b.baseUrl).length

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: steps + content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Step nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '0 24px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel)', flexShrink: 0, overflowX: 'auto',
        }}>
          {STEPS.map((s, i) => {
            const done   = i < currentStep
            const active = i === currentStep
            return (
              <button key={s.id} onClick={() => goTo(i)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 14px', background: 'transparent', border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--text)' : done ? 'var(--text-2)' : 'var(--text-3)',
                cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap', transition: 'var(--transition)', flexShrink: 0,
              }}>
                <span style={{ fontSize: 13 }}>{done ? '✓' : s.icon}</span>
                {s.label}
                {s.id === 'ai' && aiCount > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 2 }}>{aiCount}</span>
                )}
                {s.id === 'ai-strategy' && state.aiStrategy && (
                  <span style={{ background: 'var(--green)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 2 }}>✓</span>
                )}
                {s.id === 'backend' && backendCount > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 2 }}>{backendCount}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }} key={currentStep}>
            <StepComponent ctx={ctx} />
          </div>

          {/* Nav buttons */}
          <div style={{
            padding: '16px 40px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0, background: 'var(--bg-panel)',
          }}>
            <button className="btn btn-secondary" onClick={() => goTo(currentStep - 1)} disabled={currentStep === 0} style={{ opacity: currentStep === 0 ? 0.4 : 1 }}>
              ← Tillbaka
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Steg {currentStep + 1} av {STEPS.length}</span>
            {currentStep < STEPS.length - 1 && (
              <button className="btn btn-primary" onClick={() => goTo(currentStep + 1)}>Nästa →</button>
            )}
          </div>
        </div>
      </div>

      {/* Right: live preview */}
      <div style={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
        <PreviewPanel packMeta={state.packMeta} features={state.features} viewConfig={state.viewConfig} />
      </div>
    </div>
  )
}
