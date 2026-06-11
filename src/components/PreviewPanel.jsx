import { TYPOGRAPHY_OPTIONS } from '../schema.js'

// ── Font map — must match Typography.cs FontPresets.All and schema.js TYPOGRAPHY_OPTIONS ──
// Keys:   rounded | classic | modern | playful | accessible | editorial | bold
// Fonts:  exact names from the corresponding GoogleFontsUrl in each preset
const FONT_MAP = {
  rounded:    { display: 'Nunito',               body: 'Nunito' },
  classic:    { display: 'Lora',                 body: 'Source Serif 4' },
  modern:     { display: 'DM Sans',              body: 'DM Sans' },
  playful:    { display: 'Fredoka',              body: 'Nunito' },
  accessible: { display: 'Atkinson Hyperlegible', body: 'Atkinson Hyperlegible' },
  editorial:  { display: 'Playfair Display',     body: 'Lato' },
  bold:       { display: 'Montserrat',           body: 'Open Sans' },
}

export default function PreviewPanel({ packMeta, features, viewConfig }) {
  const accent  = packMeta?.accentColor || '#E8845A'
  const appName = packMeta?.appName     || 'Mitt Pack'
  const tagline = packMeta?.tagline     || 'En kort beskrivning av appen'
  const emoji   = packMeta?.emoji       || '✨'
  const typo    = packMeta?.typography  || 'rounded'
  const view    = viewConfig?.default   || 'grid'
  const font    = FONT_MAP[typo] || FONT_MAP.rounded

  const lightBg  = hexToRgb(accent, 0.08)
  const lightBdr = hexToRgb(accent, 0.2)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Förhandsvisning
      </p>

      {/* Phone frame */}
      <div style={{
        width: 240,
        height: 480,
        background: '#F8F4F0',
        borderRadius: 28,
        border: '6px solid #1A1A1A',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Status bar */}
        <div style={{
          height: 28,
          background: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, color: '#fff', opacity: 0.9 }}>9:41</span>
          <span style={{ fontSize: 9, color: '#fff', opacity: 0.9 }}>●●●</span>
        </div>

        {/* App header */}
        <div style={{
          background: accent,
          padding: '10px 14px 14px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <span style={{
              fontFamily: `'${font.display}', sans-serif`,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}>{appName}</span>
          </div>
          {tagline && (
            <p style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 3,
              fontFamily: `'${font.body}', sans-serif`,
            }}>{tagline}</p>
          )}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          padding: 10,
          background: '#F8F4F0',
        }}>
          {view === 'grid'   && <CardPreview accent={accent} font={font} lightBg={lightBg} lightBdr={lightBdr} />}
          {view === 'list'  && <ListPreview  accent={accent} font={font} />}
          {view === 'single' && <SinglePreview accent={accent} font={font} lightBg={lightBg} />}
        </div>

        {/* Nav bar */}
        <div style={{
          height: 44,
          background: '#fff',
          borderTop: '1px solid #E8E0D8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexShrink: 0,
          padding: '0 8px',
        }}>
          {['🏠','⭐','📖','⚙️'].map((ic, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}>
              <span style={{ fontSize: 14 }}>{ic}</span>
              {i === 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: accent }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Feature badges */}
      {features && (
        <div style={{
          marginTop: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          justifyContent: 'center',
          maxWidth: 280,
        }}>
          {Object.entries(features).filter(([, v]) => v).map(([k]) => (
            <span key={k} className="tag" style={{
              background: 'var(--bg-card)',
              color: 'var(--text-2)',
              fontSize: 10,
            }}>
              {FEATURE_LABELS[k] || k}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function CardPreview({ accent, font, lightBg, lightBdr }) {
  const cards = [
    { emoji: '🌿', title: 'Aktivitet 1', cat: 'Utomhus', dur: '20 min' },
    { emoji: '🎨', title: 'Aktivitet 2', cat: 'Kreativt', dur: '30 min' },
    { emoji: '🎲', title: 'Aktivitet 3', cat: 'Spel', dur: '15 min' },
    { emoji: '🍳', title: 'Aktivitet 4', cat: 'Mat', dur: '45 min' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: '#fff',
          borderRadius: 10,
          padding: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${lightBdr}`,
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{c.emoji}</div>
          <div style={{
            fontFamily: `'${font.display}', sans-serif`,
            fontSize: 9,
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 2,
          }}>{c.title}</div>
          <div style={{ fontSize: 8, color: '#9A9090' }}>{c.dur}</div>
          <div style={{
            marginTop: 5,
            fontSize: 7,
            background: lightBg,
            color: accent,
            borderRadius: 3,
            padding: '1px 4px',
            display: 'inline-block',
          }}>{c.cat}</div>
        </div>
      ))}
    </div>
  )
}

function ListPreview({ accent, font }) {
  const items = ['Pannkaksbak', 'Promenad i skogen', 'Bräd­spels­kväll', 'Fika tillsammans']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {items.map((t, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 8px',
          background: '#fff',
          borderRadius: 7,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderLeft: `3px solid ${accent}`,
        }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${accent}`, flexShrink: 0 }} />
          <span style={{
            fontFamily: `'${font.body}', sans-serif`,
            fontSize: 9,
            color: '#1A1A1A',
          }}>{t}</span>
        </div>
      ))}
    </div>
  )
}

function SinglePreview({ accent, font, lightBg }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 12,
      height: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>🌿</div>
      <div style={{
        fontFamily: `'${font.display}', sans-serif`,
        fontSize: 11,
        fontWeight: 700,
        textAlign: 'center',
        color: '#1A1A1A',
        marginBottom: 6,
      }}>
        Naturpromenad
      </div>
      <div style={{ fontSize: 8, color: '#6A6060', lineHeight: 1.5, marginBottom: 8 }}>
        Ta en promenad och samla tre saker från naturen. Lägg dem i ett mönster när ni kommer hem.
      </div>
      <div style={{
        background: lightBg,
        borderRadius: 6,
        padding: '5px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 8, color: accent }}>⏱ 30 min</span>
        <span style={{ fontSize: 8, color: accent }}>Utomhus</span>
      </div>
    </div>
  )
}

const FEATURE_LABELS = {
  favorites:      '⭐ Favoriter',
  doneTracking:   '✅ Klar-markering',
  logbook:        '📖 Loggbok',
  badges:         '🏅 Badges',
  recentHistory:  '🕐 Historik',
  search:         '🔍 Sök',
  shareActivity:  '📤 Dela',
  speech:         '🔊 Tal',
  haptics:        '📳 Haptics',
  streakTracking: '🔥 Streak',
}

function hexToRgb(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
