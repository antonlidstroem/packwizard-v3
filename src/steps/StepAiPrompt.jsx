import { useState } from 'react'
import { buildAiPrompt, formatDuration } from '../schema.js'
import { parseAiResponse } from '../services/aiParser.js'

export default function StepAiPrompt({ ctx }) {
  const { state, update, updateMeta } = ctx
  const { aiFields, packMeta, activities, aiStrategy } = state

  const [prompt, setPrompt]           = useState('')
  const [response, setResponse]       = useState('')
  const [parseResult, setParseResult] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [applied, setApplied]         = useState(false)
  const [tab, setTab]                 = useState('prompt')

  const hasAiFields   = (aiFields || []).length > 0
  const hasStrategy   = !!aiStrategy
  const hasActivities = (activities || []).length > 0

  const handleGenPrompt = () => {
    const p = buildAiPrompt(state)
    setPrompt(p)
    setParseResult(null)
    setApplied(false)
    setTab('prompt')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleParse = () => {
    if (!response.trim()) return
    const result = parseAiResponse(response)
    setParseResult(result)
  }

  const handleApply = () => {
    if (!parseResult?.data) return
    const d = parseResult.data

    const metaPatch = {}
    if (d.appName)     metaPatch.appName     = d.appName
    if (d.tagline)     metaPatch.tagline     = d.tagline
    if (d.emoji)       metaPatch.emoji       = d.emoji
    if (d.accentColor) metaPatch.accentColor = d.accentColor
    if (d.categories)  metaPatch.categories  = d.categories

    if (Object.keys(metaPatch).length > 0) updateMeta(metaPatch)

    if (d.activities?.length > 0) {
      const manual = (activities || []).filter(a => !a._aiGenerated)
      update({ activities: [...manual, ...d.activities] })
    }

    const resolved = Object.keys(d).filter(k => (aiFields || []).includes(k))
    if (d.activities) resolved.push('activities')
    update({ aiFields: (aiFields || []).filter(f => !resolved.includes(f)) })

    setApplied(true)
  }

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>AI-assistent — Generera aktiviteter</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
        Bygg en komplett AI-prompt utifrån allt du fyllt i, kopiera den till Claude, ChatGPT eller Gemini,
        och klistra in svaret för att auto-fylla aktiviteter och övriga fält.
      </p>

      {/* Strategy context badge */}
      {hasStrategy ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', marginBottom: 20,
          background: 'var(--green-dim)', border: '1px solid var(--green)',
          borderRadius: 'var(--radius)', fontSize: 13,
        }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Strategi aktiv</span>
          <span style={{ color: 'var(--text-2)' }}>
            Promoten byggs utifrån den godkända strategin ({aiStrategy.categories?.length || 0} kategorier,
            {' '}{aiStrategy.totalActivities || packMeta.activityCount || 20} aktiviteter).
          </span>
        </div>
      ) : (
        <div style={{
          padding: '10px 14px', marginBottom: 20,
          background: 'var(--bg-card)', border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-3)',
        }}>
          ℹ️ Ingen strategi är godkänd än. Prompten byggs ändå — men du kan få bättre resultat om du
          kör <strong>AI-strategi</strong>-steget (föregående) först.
        </div>
      )}

      {/* All done state */}
      {!hasAiFields && hasActivities ? (
        <div style={{
          padding: '20px 24px',
          background: 'var(--green-dim)', border: '1px solid var(--green)',
          borderRadius: 'var(--radius)', fontSize: 14, color: 'var(--text)', lineHeight: 1.6,
        }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
          <strong style={{ color: 'var(--green)' }}>Alla fält är ifyllda</strong>
          <br />
          Du har {activities.length} aktiviteter. Gå vidare till <strong>Exportera</strong>.
          Du kan ändå köra AI igen om du vill ersätta innehållet.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={handleGenPrompt}>
              🔄 Kör AI igen
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI-fält status */}
          {hasAiFields ? (
            <div style={{
              padding: '10px 14px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 16,
              fontSize: 13, color: 'var(--text-2)',
            }}>
              <span style={{ fontWeight: 500, color: 'var(--text)' }}>AI bestämmer: </span>
              {(aiFields || []).map(f => (
                <span key={f} className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', marginRight: 4 }}>{f}</span>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'var(--accent-glow)', border: '1px dashed var(--accent)',
              borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-2)',
            }}>
              Inga fält är markerade för AI — prompten genererar ändå aktiviteter.
            </div>
          )}

          {/* Generate button */}
          <div style={{ marginBottom: 24 }}>
            <button className="btn btn-primary" onClick={handleGenPrompt} style={{ gap: 8 }}>
              🤖 Generera prompt
            </button>
          </div>

          {/* Prompt + Paste tabs */}
          {prompt && (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
                {[
                  { id: 'prompt', label: '📋 Prompt' },
                  { id: 'paste',  label: '📥 Klistra in svar' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding: '10px 18px', background: 'transparent', border: 'none',
                    borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                    color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
                    cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, transition: 'var(--transition)',
                  }}>{t.label}</button>
                ))}
              </div>

              {/* PROMPT TAB */}
              {tab === 'prompt' && (
                <div style={{ animation: 'fadeIn 0.15s ease' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>2</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Kopiera och ta till din AI</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                        Claude, ChatGPT, Gemini eller annan — klistra in prompten och kopiera sedan svaret
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleCopy} style={{ flexShrink: 0 }}>
                      {copied ? '✓ Kopierat!' : '📋 Kopiera prompt'}
                    </button>
                  </div>
                  <textarea
                    readOnly value={prompt}
                    style={{
                      width: '100%', height: 260,
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--text-2)',
                      padding: 14, fontSize: 12, fontFamily: 'DM Mono, monospace',
                      lineHeight: 1.6, resize: 'none', marginTop: 12,
                    }}
                  />
                  <button className="btn btn-secondary" onClick={() => setTab('paste')} style={{ marginTop: 10 }}>
                    Har du svaret? Gå till steg 3 →
                  </button>
                </div>
              )}

              {/* PASTE TAB */}
              {tab === 'paste' && (
                <div style={{ animation: 'fadeIn 0.15s ease' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 0', borderBottom: '1px solid var(--border)', marginBottom: 12,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>3</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Klistra in AI:ns svar</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                        Klistra in hela svaret — inklusive eventuella ```json-block
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={response}
                    onChange={e => { setResponse(e.target.value); setParseResult(null); setApplied(false) }}
                    placeholder={"Klistra in AI:ns svar här...\n\nFungerar med:\n• Bara JSON\n• JSON i ```json-block\n• Svar med förklaringstext runt JSON-blocket"}
                    style={{
                      width: '100%', height: 200,
                      background: 'var(--bg-input)',
                      border: `1px solid ${parseResult?.errors?.length > 0 ? 'var(--red)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                      padding: 14, fontSize: 12, fontFamily: 'DM Mono, monospace',
                      lineHeight: 1.6, resize: 'vertical',
                    }}
                  />

                  <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={handleParse} disabled={!response.trim()} style={{ opacity: !response.trim() ? 0.5 : 1 }}>
                      🔍 Tolka svar
                    </button>
                    {parseResult?.data && !applied && (
                      <button className="btn btn-secondary" onClick={handleApply} style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                        ✓ Applicera på packen
                      </button>
                    )}
                    {applied && (
                      <span style={{ fontSize: 13, color: 'var(--green)' }}>
                        ✅ Applicerat! Kontrollera fälten i tidigare steg.
                      </span>
                    )}
                  </div>

                  {/* Parse result */}
                  {parseResult && (
                    <div style={{ marginTop: 14, animation: 'fadeIn 0.15s ease' }}>
                      {parseResult.errors?.length > 0 && (
                        <div style={{
                          padding: '12px 14px', background: 'var(--red-dim)',
                          border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', marginBottom: 10,
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
                      {parseResult.data && (
                        <div style={{
                          padding: '12px 14px', background: 'var(--green-dim)',
                          border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 8 }}>
                            ✓ Hittade följande data
                          </div>
                          {Object.entries(parseResult.data).map(([k, v]) => (
                            <div key={k} style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, display: 'flex', gap: 8 }}>
                              <span style={{ color: 'var(--accent)', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>{k}:</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {Array.isArray(v)
                                  ? `${v.length} st`
                                  : k === 'durationSeconds' ? formatDuration(v)
                                  : String(v).slice(0, 80)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
