import { useState } from 'react'
import { EMPTY_BACKEND, slugify } from '../schema.js'

// ── Hjälpkomponent: förklaringspanel ─────────────────────────────────────────
function InfoBox({ color = 'blue', icon, title, children }) {
  const colors = {
    blue:   { bg: 'var(--blue-dim)',   border: 'var(--blue)',   text: 'var(--blue)'   },
    accent: { bg: 'var(--accent-dim)', border: 'var(--accent)', text: 'var(--accent)' },
    green:  { bg: 'var(--green-dim)',  border: 'var(--green)',  text: 'var(--green)'  },
  }
  const c = colors[color] || colors.blue
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius)',
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 13, lineHeight: 1.6, marginBottom: 16,
    }}>
      {title && (
        <div style={{ fontWeight: 600, color: c.text, marginBottom: 6 }}>
          {icon} {title}
        </div>
      )}
      <div style={{ color: 'var(--text-2)' }}>{children}</div>
    </div>
  )
}

// ── Konceptdiagram: Statisk vs Dynamisk pack ──────────────────────────────────
function ConceptDiagram() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
      {/* Statisk */}
      <div style={{
        padding: '16px', borderRadius: 'var(--radius)',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          📦 Statisk pack (standard)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧙</span>
            <span>PackWizard</span>
          </div>
          <div style={{ paddingLeft: 12, color: 'var(--text-3)' }}>↓ genererar ZIP</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📄</span>
            <span>pack.config.json + activities.json</span>
          </div>
          <div style={{ paddingLeft: 12, color: 'var(--text-3)' }}>↓ filer i repot</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span>Playtypus-appen</span>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 6, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
          ✅ Passar: aktivitetslistor, guider, recept, utmaningar — innehåll som sällan ändras
        </div>
      </div>

      {/* Dynamisk */}
      <div style={{
        padding: '16px', borderRadius: 'var(--radius)',
        background: 'var(--accent-glow)', border: '1px solid var(--accent)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          ⚡ Dynamisk pack (med backend)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span>Playtypus-appen</span>
          </div>
          <div style={{ paddingLeft: 12, color: 'var(--text-3)' }}>↕ REST / SignalR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🖥️</span>
            <span>Din server (Playtypus.Server)</span>
          </div>
          <div style={{ paddingLeft: 12, color: 'var(--text-3)' }}>↕ läs/skriv</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🗄️</span>
            <span>Databas</span>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(232,132,90,0.1)', borderRadius: 6, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
          ✅ Passar: delade listor, användardata, realtidssynk, livefeed, API-integrationer
        </div>
      </div>
    </div>
  )
}

// ── Auth-mode-förklaringar ────────────────────────────────────────────────────
const AUTH_MODES = [
  {
    value: 'none',
    icon: '🌐',
    label: 'Ingen autentisering',
    shortLabel: 'Ingen',
    desc: 'Appen skickar inga credentials alls. Passar publika API:er som väder, exchange-kurser eller öppna datakällor.',
    example: 'api.open-meteo.com — väder utan nyckel',
    whenToUse: 'Din API kräver ingen nyckel, eller alla data är offentliga.',
  },
  {
    value: 'jwt',
    icon: '🔐',
    label: 'JWT (inloggning per användare)',
    shortLabel: 'JWT',
    desc: 'Användaren loggar in i appen med e-post + lösenord mot din server. Varje användare får ett eget JWT-token som skickas vid varje request. Varje användare kan bara se sin egna data.',
    example: 'Playtypus.Server — delade listor där Lisa ser sina listor och Per ser sina',
    whenToUse: 'Varje användare har privat data: listor, loggar, inställningar.',
    extraFields: ['jwtAudience'],
  },
  {
    value: 'apikey',
    icon: '🗝️',
    label: 'API-nyckel (delad för hela packen)',
    shortLabel: 'API-nyckel',
    desc: 'En statisk nyckel som är gemensam för alla användare. Appen skickar nyckeln som X-Api-Key-header. Passar när packen är lösenordsskyddad eller nyckeln inte är känslig.',
    example: 'Intern content-API för personal — samma nyckel för alla',
    whenToUse: 'Alla användare delar samma tillgång, eller packen är åtkomstskyddad.',
    extraFields: ['apiKey'],
  },
]

// ── Backend-editor (modal) ────────────────────────────────────────────────────
function BackendEditor({ backend, allBackends, onSave, onClose }) {
  const [local, setLocal] = useState({ ...EMPTY_BACKEND, ...backend })
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const upd = (patch) => setLocal(prev => ({ ...prev, ...patch }))

  const authMode = AUTH_MODES.find(m => m.value === local.authMode) || AUTH_MODES[0]
  const isNew = !backend?.id

  const isIdTaken = allBackends
    .filter(b => b.id !== (backend?.id || ''))
    .some(b => b.id === local.id)

  const isValid = local.id.trim() && local.baseUrl.trim() && !isIdTaken

  // Bygg live JSON-preview
  const previewJson = {
    id: local.id || 'mitt-backend',
    baseUrl: local.baseUrl || 'https://...',
    authMode: local.authMode,
    ...(local.authMode === 'apikey' && local.apiKey     && { apiKey: local.apiKey }),
    ...(local.authMode === 'jwt'    && local.jwtAudience && { jwtAudience: local.jwtAudience }),
    ...(local.signalRHub && { signalRHub: local.signalRHub }),
    ...(local.cacheTtlMinutes > 0  && { cacheTtlMinutes: local.cacheTtlMinutes }),
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 640, background: 'var(--bg-panel)',
        border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow)', animation: 'fadeIn 0.18s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 2 }}>
              {isNew ? '+ Nytt backend' : `Redigera: ${backend.id}`}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Deklarerar en serverendpoint i <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>pack.config.json → backends[]</code>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ─ Steg 1: Backend-ID ─────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">
              Backend-ID
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--red)', fontSize: 11 }}>obligatoriskt</span>
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
              Ett kort, unikt namn som identifierar detta backend i hela packen.
              Aktiviteter refererar hit via <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>backendRef: "{local.id || 'ditt-id'}"</code>.
              Ändra aldrig ID efter att aktiviteter refererar till det.
            </p>
            <input
              className="input-base"
              placeholder="t.ex. lists, weather, cms"
              value={local.id}
              onChange={e => upd({ id: slugify(e.target.value) })}
              style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
            />
            {isIdTaken && (
              <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>
                ⚠️ Det finns redan ett backend med ID "{local.id}". Välj ett annat namn.
              </p>
            )}
          </div>

          {/* ─ Steg 2: Base URL ───────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">
              Base URL
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--red)', fontSize: 11 }}>obligatoriskt</span>
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
              Rooten för din REST-API. Alla anrop läggs på som suffix — t.ex. GET{' '}
              <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>{(local.baseUrl || 'https://din.server.se/api') + '/lists/123'}</code>.
              Inkludera inte slash i slutet.
            </p>
            <input
              className="input-base"
              placeholder="https://myserver.example.com/api"
              value={local.baseUrl}
              onChange={e => upd({ baseUrl: e.target.value })}
              style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
            />
          </div>

          {/* ─ Steg 3: Autentisering ──────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Autentiseringsläge</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
              Hur appen identifierar sig mot din server. Välj rätt läge — fel val ger 401 Unauthorized vid varje anrop.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AUTH_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => upd({ authMode: mode.value })}
                  style={{
                    padding: '12px 14px', borderRadius: 'var(--radius)',
                    border: local.authMode === mode.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: local.authMode === mode.value ? 'var(--accent-glow)' : 'var(--bg-input)',
                    textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{mode.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: local.authMode === mode.value ? 'var(--accent)' : 'var(--text)',
                    }}>{mode.label}</span>
                    {local.authMode === mode.value && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: 4 }}>
                        Valt
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, paddingLeft: 26 }}>
                    {mode.desc}
                  </div>
                  <div style={{ marginTop: 6, paddingLeft: 26, fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
                    Exempel: {mode.example}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─ Villkorliga fält beroende på authMode ─────────────────── */}
          {local.authMode === 'jwt' && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔐 JWT-inställningar
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="label">JWT Audience <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-3)', letterSpacing: 0 }}>(valfritt)</span></label>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, lineHeight: 1.5 }}>
                  Matchar serverns <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>Jwt:Audience</code>-konfiguration.
                  Är t.ex. <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>playtypus-familjelistan</code> om
                  du kör Playtypus.Server med den inställningen. Lämna tomt om du inte vet — appen fungerar ändå.
                </p>
                <input
                  className="input-base"
                  placeholder="t.ex. playtypus-myapp"
                  value={local.jwtAudience}
                  onChange={e => upd({ jwtAudience: e.target.value })}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
                />
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(90,155,232,0.08)', border: '1px solid rgba(90,155,232,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--blue)' }}>Hur JWT fungerar i Playtypus:</strong><br />
                1. Användaren trycker "Logga in" i appen<br />
                2. Appen skickar POST <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>/api/auth/login</code> → får JWT tillbaka<br />
                3. JWT sparas lokalt och bifogas automatiskt vid alla efterföljande anrop<br />
                4. På servern valideras JWT och rätt användardata returneras
              </div>
            </div>
          )}

          {local.authMode === 'apikey' && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                🗝️ API-nyckelinställningar
              </div>
              <div>
                <label className="label">API-nyckel</label>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, lineHeight: 1.5 }}>
                  Skickas som <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>X-Api-Key: [din nyckel]</code>-header vid varje request.
                  Packen distribueras som ZIP i ditt repo — nyckeln är synlig i koden. Undvik känsliga nycklar. 
                  Använd istället JWT om nyckeln måste hållas hemlig per användare.
                </p>
                <input
                  className="input-base"
                  placeholder="t.ex. pk_live_abc123xyz"
                  value={local.apiKey}
                  onChange={e => upd({ apiKey: e.target.value })}
                  style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
                />
              </div>
            </div>
          )}

          {/* ─ Steg 4: Realtid (SignalR) ──────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Realtidsuppdateringar (SignalR)</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.6 }}>
              SignalR är en WebSocket-baserad teknik som låter servern <em>pusha</em> data till appen utan att appen behöver fråga om och om igen.
              Perfekt för delade listor (alla ser uppdateringar direkt), live-scores, chattfunktioner, m.m.
              Om din server inte kör <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>Playtypus.Server</code> — lämna blankt.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <button
                onClick={() => upd({ signalRHub: local.signalRHub ? '' : '/hubs/lists' })}
                style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 6,
                  background: local.signalRHub ? 'var(--accent)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'var(--transition)',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: local.signalRHub ? 22 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'var(--transition)',
                }} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                  {local.signalRHub ? 'Realtid aktiverat' : 'Realtid inaktiverat — polling används inte'}
                </div>
                {local.signalRHub ? (
                  <>
                    <label className="label" style={{ marginTop: 8 }}>Hub-sökväg</label>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
                      Relativ sökväg till din SignalR-hub. I Playtypus.Server är standardvärdet <code style={{ fontFamily: 'DM Mono', fontSize: 10 }}>/hubs/lists</code>.
                    </p>
                    <input
                      className="input-base"
                      placeholder="/hubs/lists"
                      value={local.signalRHub}
                      onChange={e => upd({ signalRHub: e.target.value })}
                      style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      Fullständig URL blir: <code style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--accent)' }}>{(local.baseUrl || 'https://server.example.com/api').replace(/\/api$/, '')}{local.signalRHub}</code>
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Appen läser data via vanliga GET-anrop. Uppdateringar syns inte i realtid — användaren måste uppdatera manuellt.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ─ Steg 5: Cache ──────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <label className="label">Offline-cache (TTL)</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
              Hur länge (minuter) Playtypus sparar GET-svar lokalt för offline-användning.
              Om appen tappar nätverket visas senast cachade data istället för ett felmeddelande.
              <strong style={{ color: 'var(--text-2)' }}> 0 = ingen cache</strong> (alltid live-data).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={0} max={1440} step={5}
                value={local.cacheTtlMinutes}
                onChange={e => upd({ cacheTtlMinutes: parseInt(e.target.value) })}
                style={{ flex: 1, accentColor: 'var(--accent)' }}
              />
              <div style={{ width: 80, textAlign: 'right' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: local.cacheTtlMinutes > 0 ? 'var(--accent)' : 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
                  {local.cacheTtlMinutes === 0 ? 'Av' : local.cacheTtlMinutes < 60 ? `${local.cacheTtlMinutes} min` : `${local.cacheTtlMinutes / 60} h`}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[[0,'Av'],[5,'5 min'],[60,'1 h'],[1440,'24 h']].map(([v, l]) => (
                <button key={v} onClick={() => upd({ cacheTtlMinutes: v })} style={{
                  padding: '4px 10px', fontSize: 11, borderRadius: 6,
                  border: local.cacheTtlMinutes === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: local.cacheTtlMinutes === v ? 'var(--accent-dim)' : 'var(--bg-input)',
                  color: local.cacheTtlMinutes === v ? 'var(--accent)' : 'var(--text-3)', cursor: 'pointer',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* ─ Live JSON-preview ──────────────────────────────────────── */}
          <div>
            <button
              onClick={() => setShowJsonPreview(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <span style={{ fontSize: 10, transform: showJsonPreview ? 'rotate(90deg)' : 'none', transition: 'var(--transition)', display: 'inline-block' }}>▶</span>
              {showJsonPreview ? 'Dölj' : 'Visa'} hur det ser ut i pack.config.json
            </button>
            {showJsonPreview && (
              <pre style={{
                marginTop: 10, padding: '12px 14px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontSize: 11, fontFamily: 'DM Mono, monospace',
                color: 'var(--text-2)', overflowX: 'auto', lineHeight: 1.7,
              }}>
                {JSON.stringify({ backends: [previewJson] }, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Avbryt</button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(local)}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.4 }}
          >
            {isNew ? '+ Lägg till backend' : '✓ Spara ändringar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Backend-kort (i listan) ───────────────────────────────────────────────────
function BackendCard({ backend, index, activityCount, onEdit, onDelete }) {
  const authMode = AUTH_MODES.find(m => m.value === backend.authMode) || AUTH_MODES[0]

  return (
    <div style={{
      padding: '14px 16px', background: 'var(--bg-card)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      transition: 'var(--transition)',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {authMode.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>
              {backend.id}
            </span>
            <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 10 }}>
              {authMode.shortLabel}
            </span>
            {backend.signalRHub && (
              <span className="tag" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: 10 }}>
                ⚡ SignalR
              </span>
            )}
            {backend.cacheTtlMinutes > 0 && (
              <span className="tag" style={{ background: 'var(--bg-input)', color: 'var(--text-3)', fontSize: 10 }}>
                Cache {backend.cacheTtlMinutes < 60 ? `${backend.cacheTtlMinutes}m` : `${backend.cacheTtlMinutes/60}h`}
              </span>
            )}
            {activityCount > 0 && (
              <span className="tag" style={{ background: 'var(--green-dim)', color: 'var(--green)', fontSize: 10 }}>
                {activityCount} aktivitet{activityCount !== 1 ? 'er' : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {backend.baseUrl}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={() => onEdit(index)} style={{ fontSize: 12, padding: '4px 10px' }}>
            Redigera
          </button>
          <button onClick={() => onDelete(index)} style={{
            width: 28, height: 28, borderRadius: 6, background: 'transparent',
            border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
      </div>
    </div>
  )
}

// ── Huvudkomponent ────────────────────────────────────────────────────────────
export default function StepBackend({ ctx }) {
  const { state, updateMeta } = ctx
  const backends = state.packMeta?.backends || []
  const activities = state.activities || []

  const [editingIndex, setEditingIndex]   = useState(null)
  const [showAllExamples, setShowAllExamples] = useState(false)

  const openNew  = () => setEditingIndex('new')
  const openEdit = (i) => setEditingIndex(i)

  const handleSave = (newBackend) => {
    if (editingIndex === 'new') {
      updateMeta({ backends: [...backends, newBackend] })
    } else {
      const next = [...backends]
      next[editingIndex] = newBackend
      updateMeta({ backends: next })
    }
    setEditingIndex(null)
  }

  const handleDelete = (i) => {
    const b = backends[i]
    const linkedActivities = activities.filter(a => a.backendRef === b.id)
    if (linkedActivities.length > 0) {
      if (!confirm(`Backend "${b.id}" används av ${linkedActivities.length} aktivitet(er). Ta bort ändå?`)) return
    }
    const next = [...backends]
    next.splice(i, 1)
    updateMeta({ backends: next })
  }

  const activityCountPerBackend = (backendId) =>
    activities.filter(a => a.backendRef === backendId).length

  const editingBackend = editingIndex === 'new' ? null : backends[editingIndex]

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Backend & API</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        Koppla ditt pack till en eller flera servrar. För de flesta packs behövs ingen backend — hoppa gärna över detta steg om du skapar ett statiskt aktivitetspack.
      </p>

      {/* ─── Konceptförklaring ───────────────────────────────────────── */}
      <ConceptDiagram />

      {/* ─── När ska man ha ett backend? ─────────────────────────────── */}
      <InfoBox color="blue" icon="💡" title="När behöver jag ett backend?">
        Du behöver ett backend om din app ska ha någon av dessa funktioner:
        <ul style={{ marginTop: 8, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li><strong style={{ color: 'var(--text)' }}>Delade listor</strong> — Lisa och Per ser och redigerar samma lista i realtid</li>
          <li><strong style={{ color: 'var(--text)' }}>Användarkonton</strong> — varje användare loggar in och har privata data</li>
          <li><strong style={{ color: 'var(--text)' }}>Livefeed / nyheter</strong> — innehållet uppdateras på servern utan att du behöver deploya om</li>
          <li><strong style={{ color: 'var(--text)' }}>Extern API</strong> — väder, valuta, platser — data från ett befintligt REST API</li>
          <li><strong style={{ color: 'var(--text)' }}>Formulär / inskick</strong> — användaren skickar in data som lagras på servern</li>
        </ul>
      </InfoBox>

      {/* ─── Backends ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <label className="label" style={{ margin: 0 }}>Konfigurerade backends</label>
            {backends.length > 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                {backends.length} backend{backends.length !== 1 ? 's' : ''} deklarerade i pack.config.json
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={openNew} style={{ fontSize: 13 }}>
            + Lägg till backend
          </button>
        </div>

        {backends.length === 0 ? (
          <div style={{
            padding: '28px 24px', textAlign: 'center',
            border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Statisk pack — ingen server behövs
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 16px' }}>
              Ditt pack läser aktiviteter direkt från JSON-filer. Det är det enklaste, snabbaste och mest driftsäkra alternativet.
              Lägg till ett backend bara om du verkligen behöver live-data eller användarspecifik logik.
            </div>
            <button className="btn btn-secondary" onClick={openNew}>
              + Lägg till ett backend ändå
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {backends.map((b, i) => (
              <BackendCard
                key={b.id || i}
                backend={b}
                index={i}
                activityCount={activityCountPerBackend(b.id)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Tips efter att man lagt till ett backend ─────────────────── */}
      {backends.length > 0 && (
        <>
          <InfoBox color="accent" icon="🔗" title="Nästa steg: koppla aktiviteter">
            Gå till steget <strong>Aktiviteter</strong> och välj vilket backend varje aktivitet ska kommunicera med
            via fältet <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>backendRef</code>. En aktivitet utan backendRef
            är statisk och kommunicerar inte med någon server.
          </InfoBox>

          {/* ─── Playtypus.Server-guide ─────────────────────────────────── */}
          <div style={{
            padding: '16px 18px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 16,
          }}>
            <button
              onClick={() => setShowAllExamples(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
              }}
            >
              <span style={{ fontSize: 10, transform: showAllExamples ? 'rotate(90deg)' : 'none', transition: 'var(--transition)', display: 'inline-block' }}>▶</span>
              🖥️ Sätta upp Playtypus.Server (officiell backend)
            </button>
            {showAllExamples && (
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: 10 }}>
                  Playtypus.Server är den officiella ASP.NET Core-backenden med JWT-auth, SQLite-databas, SignalR-hub och idempotent kö för offline-drift.
                </p>
                <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Klona repot: <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>git clone https://github.com/your-org/playtypus-server</code></li>
                  <li>Lägg till i <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>appsettings.json</code>:
                    <pre style={{ marginTop: 6, padding: '8px 10px', background: 'var(--bg-input)', borderRadius: 6, fontSize: 11, fontFamily: 'DM Mono, monospace', lineHeight: 1.6 }}>
{`{
  "Jwt": {
    "Key": "minst-32-tecken-hemlig-nyckel",
    "Issuer": "playtypus-server",
    "Audience": "${backends[0]?.jwtAudience || 'playtypus-' + (state.packMeta?.packId || 'myapp')}"
  },
  "AllowedOrigins": "https://din-playtypus.app",
  "ConnectionStrings": {
    "Default": "Data Source=playtypus.db"
  }
}`}
                    </pre>
                  </li>
                  <li>Starta: <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>dotnet run</code></li>
                  <li>Testa: <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>POST /api/auth/register</code> med <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>{"{ email, password, displayName }"}</code></li>
                </ol>
              </div>
            )}
          </div>

          {/* ─── Vad exporteras ─────────────────────────────────────────── */}
          <div style={{
            padding: '14px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
              📄 Vad skrivs till pack.config.json
            </div>
            <pre style={{
              fontSize: 11, fontFamily: 'DM Mono, monospace',
              color: 'var(--text-2)', lineHeight: 1.7, overflowX: 'auto',
            }}>
{JSON.stringify({
  backends: backends
    .filter(b => b.id && b.baseUrl)
    .map(b => ({
      id: b.id,
      baseUrl: b.baseUrl,
      authMode: b.authMode,
      ...(b.authMode === 'apikey' && b.apiKey     && { apiKey: '***' }),
      ...(b.authMode === 'jwt'    && b.jwtAudience && { jwtAudience: b.jwtAudience }),
      ...(b.signalRHub && { signalRHub: b.signalRHub }),
      ...(b.cacheTtlMinutes > 0  && { cacheTtlMinutes: b.cacheTtlMinutes }),
    }))
}, null, 2)}
            </pre>
          </div>
        </>
      )}

      {/* ─── Modal ───────────────────────────────────────────────────── */}
      {editingIndex !== null && (
        <BackendEditor
          backend={editingBackend}
          allBackends={backends}
          onSave={handleSave}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  )
}
