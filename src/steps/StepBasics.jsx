import Field from '../components/Field.jsx'
import { LANGUAGE_OPTIONS, slugify } from '../schema.js'

export default function StepBasics({ ctx }) {
  const { state, updateMeta, update } = ctx
  const { packMeta, aiFields } = state

  const toggleAi = (field) => {
    const current = state.aiFields || []
    const next = current.includes(field)
      ? current.filter(f => f !== field)
      : [...current, field]
    update({ aiFields: next })
  }

  const toggleLang = (lang) => {
    const current = state.languages || ['sv']
    const next = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang]
    if (next.length === 0) return
    update({ languages: next })
    if (!next.includes(packMeta.defaultLanguage)) {
      updateMeta({ defaultLanguage: next[0] })
    }
  }

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Grundinformation</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.6 }}>
        Beskriv ditt pack. Fält du inte vet svaret på kan AI:n fylla i — klicka på
        <span style={{ color: 'var(--accent)', fontWeight: 500 }}> 🤖 Låt AI välja</span> vid ett fält.
      </p>
      <div style={{
        padding: '10px 14px', marginBottom: 28,
        background: 'var(--blue-dim)', border: '1px solid var(--blue)',
        borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--blue)' }}>ℹ️ Tips:</strong> Fyll i <strong>Målgrupp</strong> och <strong>Tema</strong> så detaljerat du kan — det
        är det viktigaste underlag AI:n använder för att generera rätt aktiviteter och ton.
      </div>

      <Field
        label="Appnamn"
        fieldKey="appName"
        aiFields={aiFields}
        onToggleAi={toggleAi}
        consequence="Syns i appens rubrik, på hemskärmsikonen (PWA) och i deployad URL."
      >
        <input
          className="input-base"
          placeholder="t.ex. FamilyQuest, BiblePath, Mormors Recept"
          value={packMeta.appName}
          onChange={e => {
            updateMeta({ appName: e.target.value, packId: slugify(e.target.value) })
          }}
        />
      </Field>

      <Field
        label="Pack-ID"
        hint="Genereras automatiskt från appnamnet. Ändra bara om du vet vad du gör."
        consequence="Används som mappnamn i Playtypus-repot och i URL:er. Kan INTE ändras efter deploy utan att all sparad användardata (favoriter, loggar) går förlorad."
      >
        <input
          className="input-base"
          placeholder="t.ex. familyquest"
          value={packMeta.packId}
          onChange={e => updateMeta({ packId: e.target.value })}
          style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
        />
      </Field>

      <Field
        label="Tagline"
        fieldKey="tagline"
        aiFields={aiFields}
        onToggleAi={toggleAi}
        optional
        consequence="En rad under appnamnet i headern. Visas även i directory.json (appväljaren)."
      >
        <input
          className="input-base"
          placeholder="t.ex. Äventyr för hela familjen"
          value={packMeta.tagline}
          onChange={e => updateMeta({ tagline: e.target.value })}
        />
      </Field>

      <Field
        label="Emoji"
        fieldKey="emoji"
        aiFields={aiFields}
        onToggleAi={toggleAi}
        optional
        consequence="Representerar appen i navigationsfältet, PWA-ikonen och i directory.json."
      >
        <input
          className="input-base"
          placeholder="t.ex. 🌿"
          value={packMeta.emoji}
          onChange={e => updateMeta({ emoji: e.target.value })}
          style={{ fontSize: 20, width: 80 }}
          maxLength={2}
        />
      </Field>

      {/* Målgrupp */}
      <div style={{ marginBottom: 20 }}>
        <label className="label">Målgrupp</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
          ℹ️ Används enbart för AI-prompten — lagras inte i pack.config. Ju mer detaljerat desto bättre AI-resultat.
          Inkludera ålder, kontext, behov och vad som motiverar dem.
        </p>
        <textarea
          className="input-base"
          rows={3}
          placeholder="t.ex. Barnfamiljer med barn 4–10 år som söker kreativa utomhusaktiviteter på helger. Föräldrarna vill ha enkla aktiviteter utan mycket förberedelse."
          value={packMeta.targetAudience}
          onChange={e => updateMeta({ targetAudience: e.target.value })}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Tema */}
      <div style={{ marginBottom: 20 }}>
        <label className="label">Tema / ämne</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
          ℹ️ Ger AI:n kontext för att generera passande aktiviteter, kategorier och ton.
          Beskriv vad appen handlar om, inte bara ett ämnesord.
        </p>
        <textarea
          className="input-base"
          rows={3}
          placeholder="t.ex. Utomhusäventyr i Skandinavisk natur — promenader, naturobservationer, enkla experiment och lekar som kan göras i skogen eller på stranden utan utrustning."
          value={packMeta.theme}
          onChange={e => updateMeta({ theme: e.target.value })}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Antal aktiviteter */}
      <div style={{ marginBottom: 20 }}>
        <label className="label">Antal aktiviteter (för AI)</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
          ℹ️ Styr hur många aktiviteter AI:n genererar. Rekommenderat: 15–30 för en nylanserad app.
          Fler aktiviteter = längre svarstid från AI och större JSON-fil.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            className="input-base"
            type="number"
            min={5}
            max={100}
            value={packMeta.activityCount}
            onChange={e => updateMeta({ activityCount: parseInt(e.target.value) || 20 })}
            style={{ width: 90 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>aktiviteter</span>
          {packMeta.activityCount > 40 && (
            <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 6 }}>
              ⚠️ Kan ta lång tid för AI:n att generera
            </span>
          )}
        </div>
      </div>

      {/* Språk */}
      <div>
        <label className="label">Språk</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
          ℹ️ Genererar en <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>activities.&#123;lang&#125;.json</code> och
          en <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>translations.&#123;lang&#125;.json</code> per valt språk.
          Aktiviteterna genereras på standardspråket — Playtypus använder det som fallback.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGUAGE_OPTIONS.map(lang => {
            const selected = (state.languages || ['sv']).includes(lang.value)
            return (
              <button
                key={lang.value}
                onClick={() => toggleLang(lang.value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: selected ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                  background: selected ? 'var(--accent-dim)' : 'var(--bg-input)',
                  color: selected ? 'var(--accent)' : 'var(--text-2)',
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: selected ? 600 : 400,
                  transition: 'var(--transition)',
                }}
              >
                {lang.label}
                {lang.value === packMeta.defaultLanguage && (
                  <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>standard</span>
                )}
              </button>
            )
          })}
        </div>
        {(state.languages || ['sv']).length > 1 && (
          <div style={{ marginTop: 12 }}>
            <label className="label">Standardspråk</label>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
              Playtypus faller tillbaka på detta språk om användarens systemspråk inte matchar.
            </p>
            <select
              className="input-base"
              value={packMeta.defaultLanguage}
              onChange={e => updateMeta({ defaultLanguage: e.target.value })}
              style={{ width: 'auto' }}
            >
              {(state.languages || ['sv']).map(l => (
                <option key={l} value={l}>{LANGUAGE_OPTIONS.find(lo => lo.value === l)?.label || l}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
