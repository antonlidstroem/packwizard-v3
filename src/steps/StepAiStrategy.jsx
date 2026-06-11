import { useState } from 'react'
import { buildStrategyPrompt } from '../schema.js'
import { parseStrategyResponse } from '../services/aiParser.js'

function InfoBox({ children, color = 'var(--blue)', bg = 'var(--blue-dim)' }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius)',
      background: bg, border: `1px solid ${color}`,
      fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16,
    }}>
      {children}
    </div>
  )
}

function CategoryCard({ cat, onEdit, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', transition: 'var(--transition)',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{cat.emoji || '📂'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{cat.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>id: {cat.id}</div>
        {cat.rationale && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3, fontStyle: 'italic' }}>{cat.rationale}</div>
        )}
      </div>
      {cat.suggestedCount && (
        <span style={{
          background: 'var(--accent-dim)', color: 'var(--accent)',
          borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600, flexShrink: 0,
        }}>~{cat.suggestedCount} aktiviteter</span>
      )}
      <button onClick={() => onEdit(cat)} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, flexShrink: 0 }}>Redigera</button>
      <button onClick={() => onRemove(cat.id)} style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>
    </div>
  )
}

function CategoryEditor({ cat, onSave, onClose }) {
  const [local, setLocal] = useState({ ...cat })
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)', padding: 24,
        boxShadow: 'var(--shadow)',
      }}>
        <h3 style={{ marginBottom: 20 }}>Redigera kategori</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="label">Emoji</label>
            <input className="input-base" value={local.emoji} onChange={e => setLocal(p => ({ ...p, emoji: e.target.value }))}
              style={{ fontSize: 20, textAlign: 'center', padding: '7px 4px' }} maxLength={2} />
          </div>
          <div>
            <label className="label">Visningsnamn</label>
            <input className="input-base" value={local.label} onChange={e => setLocal(p => ({ ...p, label: e.target.value }))} placeholder="t.ex. Utomhus" />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">ID (slug)</label>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
            ℹ️ Används som nyckel i JSON och URL-filter. Inga mellanslag, bara a–z och bindestreck.
          </p>
          <input className="input-base" value={local.id} onChange={e => setLocal(p => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
            style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="label">Motivering (valfritt)</label>
          <textarea className="input-base" value={local.rationale || ''} rows={2}
            onChange={e => setLocal(p => ({ ...p, rationale: e.target.value }))}
            placeholder="Varför passar den här kategorin appen?" style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose}>Avbryt</button>
          <button className="btn btn-primary" onClick={() => onSave(local)}>Spara</button>
        </div>
      </div>
    </div>
  )
}

export default function StepAiStrategy({ ctx }) {
  const { state, update, updateMeta } = ctx
  const { aiStrategy } = state

  const [prompt, setPrompt]           = useState('')
  const [response, setResponse]       = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [tab, setTab]                 = useState('intro')  // 'intro' | 'prompt' | 'paste' | 'review'
  const [editingCat, setEditingCat]   = useState(null)

  const strategy = aiStrategy || null

  const handleGenPrompt = () => {
    const p = buildStrategyPrompt(state)
    setPrompt(p)
    setParseResult(null)
    setTab('prompt')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleParse = () => {
    if (!response.trim()) return
    const result = parseStrategyResponse(response)
    setParseResult(result)
    if (result.data && !result.errors?.some(e => e.field === '_parse')) {
      setTab('review')
    }
  }

  const handleApplyStrategy = () => {
    if (!parseResult?.data) return
    const d = parseResult.data
    update({ aiStrategy: d })
    // Lägg in kategorier i packMeta direkt — kan ändras i granskning
    if (d.categories?.length > 0) updateMeta({ categories: d.categories })
    // Föreslagna features
    if (d.suggestedFeatures) {
      const patch = {}
      Object.entries(d.suggestedFeatures).forEach(([k, v]) => { if (typeof v === 'boolean') patch[k] = v })
      if (Object.keys(patch).length > 0) ctx.updateFeatures(patch)
    }
    setTab('review')
  }

  const handleEditCat = (cat) => setEditingCat(cat)
  const handleSaveCat = (cat) => {
    const cats = ((aiStrategy?.categories) || state.packMeta.categories || [])
    const updated = cats.map(c => (c.id === editingCat.id ? cat : c))
    updateMeta({ categories: updated })
    update({ aiStrategy: { ...(aiStrategy || {}), categories: updated } })
    setEditingCat(null)
  }
  const handleRemoveCat = (id) => {
    const cats = ((aiStrategy?.categories) || state.packMeta.categories || []).filter(c => c.id !== id)
    updateMeta({ categories: cats })
    update({ aiStrategy: { ...(aiStrategy || {}), categories: cats } })
  }
  const handleAddCat = () => {
    const newCat = { id: `ny-kategori-${Date.now()}`, label: 'Ny kategori', emoji: '📂', rationale: '' }
    const cats = [...((aiStrategy?.categories) || state.packMeta.categories || []), newCat]
    updateMeta({ categories: cats })
    update({ aiStrategy: { ...(aiStrategy || {}), categories: cats } })
    setEditingCat(newCat)
  }

  const currentCats = (aiStrategy?.categories) || (state.packMeta.categories || []).filter(c => typeof c === 'object')

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>AI-strategi</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        Innan vi genererar aktiviteter tar AI:n fram en <strong>strategi</strong> — kategorier, ton, riktlinjer.
        Du granskar och justerar innan några filer skapas.
      </p>

      {/* Tab-nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[
          { id: 'intro',  label: 'ℹ️ Varför?' },
          { id: 'prompt', label: '1. Generera prompt', disabled: false },
          { id: 'paste',  label: '2. Klistra in svar', disabled: !prompt },
          { id: 'review', label: '3. Granska & godkänn', disabled: !strategy && !parseResult?.data },
        ].map(t => (
          <button key={t.id} onClick={() => !t.disabled && setTab(t.id)} style={{
            padding: '10px 16px', background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            color: t.disabled ? 'var(--text-3)' : (tab === t.id ? 'var(--text)' : 'var(--text-2)'),
            cursor: t.disabled ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400, transition: 'var(--transition)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* TAB: INTRO */}
      {tab === 'intro' && (
        <div style={{ animation: 'fadeIn 0.15s ease' }}>
          <InfoBox color="var(--accent)" bg="var(--accent-glow)">
            <strong style={{ color: 'var(--accent)' }}>🧠 Varför en strategi-fas?</strong>
            <br /><br />
            Utan strategisteget händer det här: AI:n genererar 20 aktiviteter — men du vet inte förrän efteråt om
            kategorierna passade, om tonen var rätt, eller om antalet aktiviteter per kategori var rimligt.
            Då är det för sent att ändra utan att köra om allt.
            <br /><br />
            Med strategisteget ser du <em>planen</em> innan AI:n skriver ett enda aktivitetskort.
            Du kan lägga till, ta bort och döpa om kategorier. Du kan se om AI missförstått målgruppen.
            Och du behåller full kontroll — AI:n är din assistent, inte din chef.
          </InfoBox>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '🎯', title: 'Kategorier med emoji', desc: 'AI föreslår 3–6 kategorier med emoji och motivering. Du kan redigera varje en.' },
              { icon: '🎨', title: 'Ton & känsla', desc: 'AI beskriver appens ton — exakt vad aktiviteterna ska förmedla.' },
              { icon: '📊', title: 'Fördelning', desc: 'Hur många aktiviteter per kategori? AI föreslår — du justerar.' },
              { icon: '⚙️', title: 'Features-förslag', desc: 'AI rekommenderar vilka funktioner som passar just denna app.' },
            ].map(item => (
              <div key={item.title} style={{
                padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setTab('prompt')}>
              Kom igång →
            </button>
            {strategy && (
              <button className="btn btn-secondary" onClick={() => setTab('review')} style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>
                ✓ Visa godkänd strategi
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROMPT */}
      {tab === 'prompt' && (
        <div style={{ animation: 'fadeIn 0.15s ease' }}>
          <InfoBox>
            <strong style={{ color: 'var(--blue)' }}>📋 Steg 1 — Generera strategiprompt</strong>
            <br />
            Klicka på knappen för att bygga en prompt baserad på det du fyllt i hittills (appnamn, målgrupp, tema, aktiverade funktioner).
            Ta sedan prompten till valfri AI — Claude, ChatGPT eller Gemini fungerar alla.
          </InfoBox>

          <button className="btn btn-primary" onClick={handleGenPrompt} style={{ marginBottom: 16 }}>
            🤖 Generera strategiprompt
          </button>

          {prompt && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="label" style={{ margin: 0 }}>Genererad prompt</label>
                <button className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: 12 }}>
                  {copied ? '✓ Kopierat!' : '📋 Kopiera'}
                </button>
              </div>
              <textarea
                readOnly value={prompt}
                style={{
                  width: '100%', height: 260,
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-2)',
                  padding: 14, fontSize: 12, fontFamily: 'DM Mono, monospace',
                  lineHeight: 1.6, resize: 'none',
                }}
              />
              <button className="btn btn-secondary" onClick={() => setTab('paste')} style={{ marginTop: 10 }}>
                Har du AI:ns svar? Gå till steg 2 →
              </button>
            </>
          )}
        </div>
      )}

      {/* TAB: PASTE */}
      {tab === 'paste' && (
        <div style={{ animation: 'fadeIn 0.15s ease' }}>
          <InfoBox>
            <strong style={{ color: 'var(--blue)' }}>📥 Steg 2 — Klistra in AI:ns strategisvar</strong>
            <br />
            Klistra in hela svaret från AI:n — inklusive eventuella ```json-block. PackWizard extraherar JSON automatiskt.
          </InfoBox>

          <textarea
            value={response}
            onChange={e => { setResponse(e.target.value); setParseResult(null) }}
            placeholder={"Klistra in AI:ns strategisvar här...\n\nFungerar med:\n• Bara JSON\n• JSON i ```json-block\n• Svar med förklaringstext runt JSON-blocket"}
            style={{
              width: '100%', height: 220,
              background: 'var(--bg-input)',
              border: `1px solid ${parseResult?.errors?.length > 0 ? 'var(--red)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)', color: 'var(--text)',
              padding: 14, fontSize: 12, fontFamily: 'DM Mono, monospace',
              lineHeight: 1.6, resize: 'vertical',
            }}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handleParse} disabled={!response.trim()}
              style={{ opacity: !response.trim() ? 0.5 : 1 }}>
              🔍 Tolka strategisvar
            </button>
            {parseResult?.data && (
              <button className="btn btn-secondary" onClick={handleApplyStrategy}
                style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>
                ✓ Applicera strategi
              </button>
            )}
          </div>

          {parseResult?.errors?.length > 0 && (
            <div style={{
              marginTop: 12, padding: '12px 14px',
              background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>
                ⚠️ {parseResult.errors.length} fel
              </div>
              {parseResult.errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
                  <span style={{ color: 'var(--red)', fontFamily: 'DM Mono, monospace' }}>{e.field}</span>: {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: REVIEW */}
      {tab === 'review' && (
        <div style={{ animation: 'fadeIn 0.15s ease' }}>
          {!strategy ? (
            <InfoBox color="var(--red)" bg="var(--red-dim)">
              Ingen strategi är godkänd än. Gå igenom steg 1 och 2 ovan.
            </InfoBox>
          ) : (
            <>
              <InfoBox color="var(--green)" bg="var(--green-dim)">
                <strong style={{ color: 'var(--green)' }}>✅ Strategi godkänd och aktiv</strong>
                <br />
                Du kan redigera kategorierna nedan när som helst. Ändringarna reflekteras direkt i AI-prompten
                på nästa steg. Klicka <em>Regenerera strategi</em> om du vill börja om.
              </InfoBox>

              {/* Ton & grundinfo */}
              <div style={{
                padding: '16px 20px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 20,
              }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-2)', marginBottom: 14 }}>Strategiöversikt</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Appnamn', value: strategy.appName },
                    { label: 'Tagline', value: strategy.tagline },
                    { label: 'Emoji', value: strategy.emoji },
                    { label: 'Accentfärg', value: strategy.accentColor },
                    { label: 'Totalt aktiviteter', value: strategy.totalActivities },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{row.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                {strategy.tone && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Ton & känsla</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>{strategy.tone}</div>
                  </div>
                )}
                {strategy.contentGuidelines && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Innehållsriktlinjer</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{strategy.contentGuidelines}</div>
                  </div>
                )}
              </div>

              {/* Kategorier — redigerbara */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <label className="label" style={{ margin: 0 }}>Kategorier</label>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                      Redigera, ta bort eller lägg till kategorier. Dessa används direkt i AI-prompten.
                    </p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddCat} style={{ flexShrink: 0 }}>
                    + Lägg till
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentCats.map(cat => (
                    <CategoryCard key={cat.id} cat={cat} onEdit={handleEditCat} onRemove={handleRemoveCat} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => {
                  setTab('prompt')
                  setPrompt('')
                  setResponse('')
                  setParseResult(null)
                  update({ aiStrategy: null })
                  updateMeta({ categories: [] })
                }}>
                  🔄 Regenerera strategi
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Category editor modal */}
      {editingCat && (
        <CategoryEditor cat={editingCat} onSave={handleSaveCat} onClose={() => setEditingCat(null)} />
      )}
    </div>
  )
}
