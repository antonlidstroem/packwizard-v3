import { VIEW_OPTIONS } from '../schema.js'

export default function StepViews({ ctx }) {
  const { state, update, updateMeta, updateFeatures } = ctx
  const { packMeta, viewConfig, features } = state

  const setDefaultView = (v) => {
    // ── FIX: write to features.defaultLayoutMode (v6) + keep viewConfig in sync
    updateFeatures({ defaultLayoutMode: v })
    update({ viewConfig: { ...viewConfig, default: v } })
  }

  const setCategoryView = (cat, v) => {
    const overrides = { ...(viewConfig?.overrides || {}) }
    if (v === (features?.defaultLayoutMode || viewConfig?.default)) {
      delete overrides[cat]
    } else {
      overrides[cat] = v
    }
    update({ viewConfig: { ...viewConfig, overrides } })
  }

  const addCategory = () => {
    const name = prompt('Kategorinamn (t.ex. Utomhus, Kreativt):')
    if (!name?.trim()) return
    updateMeta({ categories: [...(packMeta.categories || []), name.trim()] })
  }

  const removeCategory = (cat) => {
    updateMeta({ categories: (packMeta.categories || []).filter(c => c !== cat) })
    const overrides = { ...(viewConfig?.overrides || {}) }
    delete overrides[cat]
    update({ viewConfig: { ...viewConfig, overrides } })
  }

  // ReadyNow criteria helpers
  const rn = packMeta.readyNowCriteria || {}
  const updRN = (patch) => updateMeta({ readyNowCriteria: { ...rn, ...patch } })

  const defaultView = features?.defaultLayoutMode || viewConfig?.default || 'grid'

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Vyer &amp; Kategorier</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
        Välj hur aktiviteterna presenteras. Du kan sätta en standardvy och sedan
        överskriva per kategori — t.ex. lista för recept och kort för aktiviteter.
      </p>

      {/* Default view */}
      <div style={{ marginBottom: 32 }}>
        <label className="label">Standardvy för hela appen</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
          ℹ️ Exporteras som <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>features.defaultLayoutMode</code>.
          Alla kategorier som inte har en override använder den här vyn.
        </p>

        {/* layoutUserToggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '10px 14px', background: 'var(--bg-input)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        }}>
          <button
            onClick={() => updateFeatures({ layoutUserToggle: !(features?.layoutUserToggle !== false) })}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: features?.layoutUserToggle !== false ? 'var(--accent)' : 'var(--border)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'var(--transition)', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 2,
              left: features?.layoutUserToggle !== false ? 19 : 2,
              width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)',
            }} />
          </button>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Låt användaren byta vy</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>
              → <code style={{ fontFamily: 'DM Mono', fontSize: 10 }}>features.layoutUserToggle</code>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {VIEW_OPTIONS.map(v => (
            <button
              key={v.value}
              onClick={() => setDefaultView(v.value)}
              style={{
                flex: 1,
                padding: '16px 12px',
                borderRadius: 'var(--radius)',
                border: defaultView === v.value
                  ? '1px solid var(--accent)'
                  : '1px solid var(--border)',
                background: defaultView === v.value
                  ? 'var(--accent-dim)'
                  : 'var(--bg-input)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{v.icon}</div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: defaultView === v.value ? 'var(--accent)' : 'var(--text)',
                marginBottom: 4,
              }}>{v.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Categories + per-category layout */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <label className="label" style={{ margin: 0 }}>Kategorier</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              ℹ️ Per-kategori-layout exporteras som <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>categoryLayouts</code> i pack.config.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={addCategory} style={{ flexShrink: 0 }}>
            + Lägg till
          </button>
        </div>

        {(!packMeta.categories || packMeta.categories.length === 0) ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-3)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 13,
          }}>
            Inga kategorier ännu. Lägg till kategorier för att ange vy per kategori.
            <br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              Om du inte lägger till kategorier nu kan AI:n generera dem.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {packMeta.categories.map(cat => {
              const catKey = typeof cat === 'string' ? cat : (cat.label || cat.id)
              const override = viewConfig?.overrides?.[catKey]
              const activeView = override || defaultView
              return (
                <div
                  key={catKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: 'var(--text)' }}>
                    {catKey}
                  </span>

                  {/* View selector */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {VIEW_OPTIONS.map(v => (
                      <button
                        key={v.value}
                        onClick={() => setCategoryView(catKey, v.value)}
                        title={v.label}
                        style={{
                          width: 32, height: 32,
                          borderRadius: 'var(--radius-sm)',
                          border: activeView === v.value
                            ? '1px solid var(--accent)'
                            : '1px solid var(--border)',
                          background: activeView === v.value
                            ? 'var(--accent-dim)'
                            : 'var(--bg-input)',
                          color: activeView === v.value ? 'var(--accent)' : 'var(--text-2)',
                          cursor: 'pointer', fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'var(--transition)',
                        }}
                      >
                        {v.icon}
                      </button>
                    ))}
                  </div>

                  {override && (
                    <span className="tag" style={{
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      fontSize: 10,
                    }}>override</span>
                  )}

                  <button
                    onClick={() => removeCategory(catKey)}
                    style={{
                      width: 24, height: 24, borderRadius: 4,
                      background: 'transparent', border: 'none',
                      color: 'var(--text-3)', cursor: 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FIX 6: ReadyNow criteria ─────────────────────────────────────────── */}
      {packMeta.readyNow && (
        <div>
          <label className="label">Redo nu — filterkrav</label>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>
            Styr vilka aktiviteter som räknas som "redo nu". Exporteras som{' '}
            <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>readyNow.criteria</code>.
          </p>

          {/* Max prep */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
            padding: '12px 16px', background: 'var(--bg-input)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          }}>
            <button
              onClick={() => updRN({ maxPrepMinutes: rn.maxPrepMinutes != null ? undefined : 0 })}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: rn.maxPrepMinutes != null ? 'var(--accent)' : 'var(--border)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'var(--transition)', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: rn.maxPrepMinutes != null ? 19 : 2,
                width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)',
              }} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>Max förberedelsetid</span>
            {rn.maxPrepMinutes != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number" min={0} max={60}
                  value={rn.maxPrepMinutes}
                  onChange={e => updRN({ maxPrepMinutes: parseInt(e.target.value) || 0 })}
                  className="input-base"
                  style={{ width: 60, padding: '4px 8px', fontSize: 13 }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>min</span>
              </div>
            )}
          </div>

          {/* No props */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', background: 'var(--bg-input)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          }}>
            <button
              onClick={() => updRN({ requireNoProps: !rn.requireNoProps })}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: rn.requireNoProps ? 'var(--accent)' : 'var(--border)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'var(--transition)', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: rn.requireNoProps ? 19 : 2,
                width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)',
              }} />
            </button>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Ingen rekvisita krävs</span>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                Filtrerar bort aktiviteter med <code style={{ fontFamily: 'DM Mono', fontSize: 10 }}>requiresProps: true</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
