import { useState, useCallback } from 'react'
import PreviewPanel from '../components/PreviewPanel.jsx'
import StepBasics from './StepBasics.jsx'
import StepVisual from './StepVisual.jsx'
import StepViews from './StepViews.jsx'
import StepFeatures from './StepFeatures.jsx'
import StepActivities from './StepActivities.jsx'
import StepExport from './StepExport.jsx'

const TABS = [
  { id: 'basics',     label: 'Grundinfo',   icon: '📝' },
  { id: 'visual',     label: 'Utseende',    icon: '🎨' },
  { id: 'views',      label: 'Vyer',        icon: '⊞'  },
  { id: 'features',   label: 'Funktioner',  icon: '⚙️'  },
  { id: 'activities', label: 'Aktiviteter', icon: '📋' },
  { id: 'export',     label: 'Exportera',   icon: '📦' },
]

export default function EditMode({ ctx, loadedFile, setLoadedFile }) {
  const { state, loadExistingPack } = ctx
  const [activeTab, setActiveTab] = useState('basics')

  // Load pack from file
  const handleFileLoad = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoadedFile(file.name)
    try {
      const text = await file.text()
      const config = JSON.parse(text)
      loadExistingPack(config, config._activities || [])
    } catch {
      alert('Kunde inte läsa filen. Kontrollera att det är en giltig pack.config.json.')
    }
  }, [loadExistingPack, setLoadedFile])

  // Handle activities JSON separately
  const handleActivitiesLoad = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const acts = JSON.parse(text)
      if (!Array.isArray(acts)) throw new Error('Förväntade en array')
      ctx.update({ activities: acts })
    } catch {
      alert('Kunde inte läsa aktivitetsfilen. Kontrollera att det är en giltig activities.*.json.')
    }
  }, [ctx])

  const TabComponent = {
    basics:     StepBasics,
    visual:     StepVisual,
    views:      StepViews,
    features:   StepFeatures,
    activities: StepActivities,
    export:     StepExport,
  }[activeTab]

  const isLoaded = !!state.packMeta.packId

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* File loader bar */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileLoad} />
            <span className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              📂 Ladda pack.config.json
            </span>
          </label>

          {isLoaded && (
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleActivitiesLoad} />
              <span className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                📋 Ladda activities.json
              </span>
            </label>
          )}

          {loadedFile && (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Redigerar: <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{loadedFile}</span>
            </span>
          )}

          {isLoaded && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--green)' }}>
              ✓ {state.packMeta.appName} ({state.activities?.length || 0} aktiviteter)
            </span>
          )}
        </div>

        {!isLoaded ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 16, color: 'var(--text-3)', padding: 48,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 48 }}>📂</span>
            <h3 style={{ color: 'var(--text-2)', fontWeight: 500 }}>Ladda ett befintligt pack</h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 400 }}>
              Klicka på "Ladda pack.config.json" ovan för att öppna ett befintligt pack.
              Alla fält fylls i automatiskt och du kan redigera vad du vill.
            </p>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileLoad} />
              <span className="btn btn-primary" style={{ display: 'inline-flex', fontSize: 14, padding: '10px 24px' }}>
                📂 Välj pack.config.json
              </span>
            </label>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              padding: '0 24px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-panel)',
              flexShrink: 0,
              overflowX: 'auto',
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '13px 16px',
                  background: 'transparent', border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--text)' : 'var(--text-3)',
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: activeTab === t.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }} key={activeTab}>
              <TabComponent ctx={ctx} />
            </div>
          </>
        )}
      </div>

      {/* Preview */}
      <div style={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
        <PreviewPanel
          packMeta={state.packMeta}
          features={state.features}
          viewConfig={state.viewConfig}
        />
      </div>
    </div>
  )
}
