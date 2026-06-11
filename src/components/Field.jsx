// ── Field — wrapper med AI-knapp och konsekvenstext ──────────────────────────

export default function Field({
  label,
  hint,
  consequence,
  fieldKey,
  aiFields,
  onToggleAi,
  children,
  optional = false,
}) {
  const isAi = aiFields?.includes(fieldKey)

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span className="label" style={{ margin: 0 }}>{label}</span>
        {optional && (
          <span className="tag" style={{ background: 'var(--bg-input)', color: 'var(--text-3)' }}>
            valfritt
          </span>
        )}
        {fieldKey && onToggleAi && (
          <button
            onClick={() => onToggleAi(fieldKey)}
            className="tag"
            style={{
              marginLeft: 'auto',
              background: isAi ? 'var(--accent-dim)' : 'var(--bg-input)',
              color: isAi ? 'var(--accent)' : 'var(--text-3)',
              border: isAi ? '1px solid var(--accent)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'var(--transition)',
              padding: '3px 8px',
            }}
          >
            {isAi ? '🤖 AI bestämmer' : '🤖 Låt AI välja'}
          </button>
        )}
      </div>

      {/* Consequence hint */}
      {consequence && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
          ℹ️ {consequence}
        </p>
      )}

      {/* Input — döljs om AI bestämmer */}
      {isAi ? (
        <div style={{
          padding: '10px 14px',
          background: 'var(--accent-glow)',
          border: '1px dashed var(--accent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--accent)',
        }}>
          AI bestämmer detta åt dig — inkluderas i prompten
        </div>
      ) : (
        <>
          {children}
          {hint && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>{hint}</p>
          )}
        </>
      )}
    </div>
  )
}
