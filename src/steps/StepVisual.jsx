import { useState, useRef } from 'react'
import Field from '../components/Field.jsx'
import { TYPOGRAPHY_OPTIONS, ACCENT_PRESETS } from '../schema.js'

// ── Bilduppladdning ────────────────────────────────────────────────────────────
function ImageUploadField({ label, hint, value, onChange, onClear, aspectHint }) {
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Välj en bildfil (JPG, PNG, WEBP, GIF).'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Bilden är för stor — max 5 MB.'); return }

    const ext = '.' + file.name.split('.').pop().toLowerCase()
    const reader = new FileReader()
    reader.onload = (ev) => {
      // Spara base64 utan data-URL-prefix (hanteras vid export)
      const dataUrl = ev.target.result
      const base64  = dataUrl.split(',')[1]
      onChange({ filename: file.name, base64, ext, dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = '' // Tillåt att samma fil väljs igen
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label className="label">{label}</label>
      {hint && <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>{hint}</p>}

      {value ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0,
            border: '1px solid var(--border)', background: 'var(--bg-input)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={value.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.filename}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
              {aspectHint}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ fontSize: 12, padding: '4px 12px' }}>
                Byt bild
              </button>
              <button className="btn btn-ghost" onClick={onClear} style={{ fontSize: 12, padding: '4px 12px', color: 'var(--text-3)' }}>
                Ta bort
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px 16px', gap: 8, cursor: 'pointer', borderRadius: 'var(--radius)',
            border: '1px dashed var(--border)', background: 'var(--bg-input)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span style={{ fontSize: 28 }}>🖼️</span>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Klicka för att välja bild</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>JPG, PNG, WEBP — max 5 MB</span>
          {aspectHint && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{aspectHint}</span>}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

// ── Panikknapp-konfigurator (oförändrad) ──────────────────────────────────────
function PanicButtonConfig({ packMeta, updateMeta }) {
  const pb = packMeta.panicButton || {}
  const enabled = pb.enabled
  const upd = (patch) => updateMeta({ panicButton: { ...pb, ...patch } })

  return (
    <div style={{
      background: enabled ? 'var(--accent-dim)' : 'var(--bg-card)',
      border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '16px 20px', transition: 'var(--transition)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: enabled ? 20 : 0 }}>
        <button onClick={() => upd({ enabled: !enabled })} style={{
          width: 44, height: 24, borderRadius: 12,
          background: enabled ? 'var(--accent)' : 'var(--border)',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: 3, left: enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)' }} />
        </button>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Panikknapp aktiv</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>En stor knapp som direkt plockar fram en aktivitet som uppfyller kraven</div>
        </div>
      </div>

      {enabled && (
        <>
          <div style={{ padding: '10px 14px', marginBottom: 20, background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Så här fungerar det:</strong> Playtypus filtrerar aktiviteter i realtid mot kraven du anger nedan och presenterar en slumpmässig matchning med en animerad "nu kör vi"-vy. Inga matchningar → knappen visar ett felmeddelande.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Knapptext <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(→ panic.button)</span></label>
              <input className="input-base" placeholder="t.ex. Vad kan vi göra nu?" value={pb.label || ''} onChange={e => upd({ label: e.target.value })} style={{ marginTop: 6 }} />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Sparas i translations.json under <code style={{ fontFamily: 'DM Mono', fontSize: 10 }}>panic.button</code>.</p>
            </div>
            <div>
              <label className="label">Emoji</label>
              <input className="input-base" placeholder="🎲" value={pb.emoji || ''} onChange={e => upd({ emoji: e.target.value })} maxLength={2} style={{ marginTop: 6, textAlign: 'center', fontSize: 20 }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Undertext <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(→ panic.subtitle)</span></label>
            <input className="input-base" placeholder="t.ex. Slumpa en aktivitet" value={pb.subtitle || ''} onChange={e => upd({ subtitle: e.target.value })} style={{ marginTop: 6 }} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <label className="label">Filterkrav</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>Panikknappen slumpar bland aktiviteter som uppfyller <em>alla</em> aktiva krav.</p>
          </div>

          {[
            { field: 'maxPrepMinutes', title: 'Max förberedelsetid', sub: 'Kräver att aktiviteten kan startas snabbt', inputLabel: 'minuter', default: 0, min: 0, max: 60 },
            { field: 'maxDurationSeconds', title: 'Max varaktighet', sub: 'Filtrerar bort långa aktiviteter', inputLabel: 'minuter max', default: 1800, min: 5, max: 480, scale: 60 },
          ].map(({ field, title, sub, inputLabel, default: def, min, max, scale = 1 }) => (
            <div key={field} style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: pb[field] != null ? 10 : 0 }}>
                <button onClick={() => upd({ [field]: pb[field] != null ? null : def })} style={{ width: 40, height: 22, borderRadius: 11, background: pb[field] != null ? 'var(--accent)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: pb[field] != null ? 19 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)' }} />
                </button>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</div>
                </div>
              </div>
              {pb[field] != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" min={min} max={max} className="input-base" value={Math.round(pb[field] / scale)} onChange={e => upd({ [field]: (parseInt(e.target.value) || 0) * scale })} style={{ width: 80 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{inputLabel}</span>
                </div>
              )}
            </div>
          ))}

          <div style={{ padding: '14px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => upd({ requireNoProps: !pb.requireNoProps })} style={{ width: 40, height: 22, borderRadius: 11, background: pb.requireNoProps ? 'var(--accent)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: pb.requireNoProps ? 19 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)' }} />
              </button>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Ingen rekvisita</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Filtrerar bort aktiviteter som kräver material (<code style={{ fontFamily: 'DM Mono', fontSize: 10 }}>requiresProps: true</code>)</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text)' }}>filterOverride i appen:</strong>{' '}
            {[
              pb.maxPrepMinutes    != null && `förberedelsetid ≤ ${pb.maxPrepMinutes} min`,
              pb.requireNoProps             && 'ingen rekvisita',
              pb.maxDurationSeconds != null && `varaktighet ≤ ${Math.round(pb.maxDurationSeconds/60)} min`,
            ].filter(Boolean).join(' + ') || 'Ingen filtrering — slumpar bland alla aktiviteter'}
          </div>
        </>
      )}
    </div>
  )
}

export default function StepVisual({ ctx }) {
  const { state, updateMeta, update } = ctx
  const { packMeta, aiFields } = state

  const toggleAi = (field) => {
    const current = state.aiFields || []
    const next = current.includes(field) ? current.filter(f => f !== field) : [...current, field]
    update({ aiFields: next })
  }

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Utseende</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
        Välj färg, typografi och valfria bilder. Förhandsvisningen till höger uppdateras direkt.
      </p>

      {/* Accentfärg */}
      <Field label="Accentfärg" fieldKey="accentColor" aiFields={aiFields} onToggleAi={toggleAi} consequence="Används i appens header, knappar, ikoner och kortaccenter.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACCENT_PRESETS.map(c => (
              <button key={c} onClick={() => updateMeta({ accentColor: c })} title={c} style={{
                width: 32, height: 32, borderRadius: '50%', background: c,
                border: packMeta.accentColor === c ? '3px solid var(--text)' : '3px solid transparent',
                cursor: 'pointer', transition: 'var(--transition)',
                boxShadow: packMeta.accentColor === c ? `0 0 0 2px ${c}40` : 'none',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="color" value={packMeta.accentColor || '#E8845A'} onChange={e => updateMeta({ accentColor: e.target.value })} style={{ width: 40, height: 36, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', cursor: 'pointer', padding: 2 }} />
            <input className="input-base" value={packMeta.accentColor || '#E8845A'} onChange={e => updateMeta({ accentColor: e.target.value })} style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, width: 120 }} maxLength={7} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>hex-värde</span>
          </div>
        </div>
      </Field>

      {/* Typografi */}
      <div style={{ marginBottom: 24 }}>
        <label className="label">Typografi</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
          ℹ️ Styr vilket typsnittpar som används i hela appen. Exporteras som{' '}
          <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>typography.preset</code>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TYPOGRAPHY_OPTIONS.map(t => (
            <button key={t.value} onClick={() => updateMeta({ typography: t.value })} style={{
              padding: '12px 14px', borderRadius: 'var(--radius)',
              border: packMeta.typography === t.value ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: packMeta.typography === t.value ? 'var(--accent-dim)' : 'var(--bg-input)',
              cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: packMeta.typography === t.value ? 'var(--accent)' : 'var(--text)' }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.preview}</div>
              {t.desc && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.4 }}>{t.desc}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* ── App-bilder (v7) ─────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 24, padding: '18px 20px',
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <label className="label" style={{ margin: 0 }}>App-bilder</label>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>v7</span>
          <span className="tag" style={{ background: 'var(--bg-input)', color: 'var(--text-3)' }}>valfritt</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
          Bilder bäddas in direkt i pack-ZIP:en under <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>images/</code> och refereras med relativa sökvägar i pack.config.json.
          Bilder på aktiviteter sätts per aktivitet i Aktiviteter-steget.
        </p>

        <ImageUploadField
          label="Pack-ikon (valfritt)"
          hint="Ersätter eller kompletterar emoji-ikonen i appens header och PWA-ikonmeny. Rekommenderat: kvadratisk bild, minst 192×192 px."
          value={packMeta._iconImageData}
          onChange={(data) => updateMeta({ _iconImageData: data })}
          onClear={() => updateMeta({ _iconImageData: null })}
          aspectHint="Rekommenderat: 192×192 px, kvadratisk"
        />

        {packMeta._iconImageData && (
          <div style={{ padding: '10px 12px', background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-2)', marginTop: -8 }}>
            ✓ Sparas som <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>images/pack-icon{packMeta._iconImageData.ext}</code> i ZIP:en
          </div>
        )}
      </div>

      {/* Panikknapp */}
      <div style={{ marginBottom: 24 }}>
        <label className="label">Panikknapp</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
          ℹ️ En stor, framträdande knapp som direkt plockar fram en slumpad aktivitet baserat på krav du anger — t.ex. "max 5 min förberedelse och ingen rekvisita".
          Exporteras som <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>panicButton</code> i pack.config.
        </p>
        <PanicButtonConfig packMeta={packMeta} updateMeta={updateMeta} />
      </div>

      {/* Redo nu-läge */}
      <div>
        <label className="label">Redo nu-läge</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
          ℹ️ Aktiverar ett "Redo nu"-filter som visar aktiviteter utan förberedelsetid (<code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>prepTimeMinutes: 0</code>) på startsidan.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => updateMeta({ readyNow: !packMeta.readyNow })} style={{
            width: 44, height: 24, borderRadius: 12,
            background: packMeta.readyNow ? 'var(--accent)' : 'var(--border)',
            border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0,
          }}>
            <div style={{ position: 'absolute', top: 3, left: packMeta.readyNow ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)' }} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{packMeta.readyNow ? 'Aktiverat' : 'Inaktiverat'}</span>
        </div>
      </div>
    </div>
  )
}
