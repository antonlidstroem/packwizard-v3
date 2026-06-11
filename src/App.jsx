import { useState, useCallback } from 'react'
import { EMPTY_PACK } from './schema.js'
import Sidebar from './components/Sidebar.jsx'
import CreateWizard from './steps/CreateWizard.jsx'
import EditMode from './steps/EditMode.jsx'
import DeployMode from './steps/DeployMode.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'

const INITIAL_STATE = {
  packMeta: {
    ...EMPTY_PACK,
    targetAudience: '',
    theme: '',
    activityCount: 20,
  },
  features:       { ...EMPTY_PACK.features },
  viewConfig:     { default: 'grid', overrides: {} },
  languages:      ['sv'],
  activities:     [],
  aiFields:       [],
  aiPrompt:       '',
  aiStrategy:     null,
  deployTarget:   'github-pages',
  step:           0,
  mode:           'welcome',
}

export default function App() {
  const [state, setState]           = useState(INITIAL_STATE)
  const [loadedFile, setLoadedFile] = useState(null)

  const update         = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), [])
  const updateMeta     = useCallback((patch) => setState(prev => ({ ...prev, packMeta: { ...prev.packMeta, ...patch } })), [])
  const updateFeatures = useCallback((patch) => setState(prev => ({ ...prev, features: { ...prev.features, ...patch } })), [])
  const setMode        = useCallback((mode)  => setState(prev => ({ ...prev, mode, step: 0 })), [])
  const resetState     = useCallback(()      => { setState(INITIAL_STATE); setLoadedFile(null) }, [])

  const loadExistingPack = useCallback((packConfig, activities) => {
    setState(prev => ({
      ...prev,
      packMeta: {
        ...EMPTY_PACK,
        ...packConfig,
        // v7: bevara version (fallback till '7.0' om saknas i äldre pack)
        version: packConfig.version || '7.0',
        // v7: bevara backends-array från laddad fil
        backends: Array.isArray(packConfig.backends) ? packConfig.backends : [],
        // Normalisera typography från objekt → sträng för UI
        typography: packConfig.typography?.preset
          || packConfig.typography?.fontPair
          || (typeof packConfig.typography === 'string' ? packConfig.typography : null)
          || 'rounded',
        // Normalisera categories från [{id,labelKey,emoji}] → [{id,label,emoji}]
        categories: (packConfig.categories || []).map(c =>
          typeof c === 'string'
            ? { id: c, label: c, emoji: '' }
            : { id: c.id, label: c.label || c.id, emoji: c.emoji || '' }
        ),
        targetAudience: '',
        theme: '',
        activityCount: activities?.length || 20,
      },
      languages:    (packConfig.languages || []).map(l => typeof l === 'string' ? l : l.code) || ['sv'],
      features:     {
        ...EMPTY_PACK.features,
        ...(packConfig.features || {}),
      },
      viewConfig:   packConfig.viewConfig || { default: 'grid', overrides: {} },
      activities:   activities || [],
      aiStrategy:   null,
      mode:         'edit',
      step:         0,
    }))
  }, [])

  const ctx = { state, update, updateMeta, updateFeatures, setMode, resetState, loadExistingPack }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar mode={state.mode} setMode={setMode} resetState={resetState} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {state.mode === 'welcome' && <WelcomeScreen ctx={ctx} />}
        {state.mode === 'create'  && <CreateWizard  ctx={ctx} />}
        {state.mode === 'edit'    && <EditMode       ctx={ctx} loadedFile={loadedFile} setLoadedFile={setLoadedFile} />}
        {state.mode === 'deploy'  && <DeployMode     ctx={ctx} />}
      </main>
    </div>
  )
}
