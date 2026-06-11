export default function WelcomeScreen({ ctx }) {
  const { setMode, loadExistingPack } = ctx

  const handleFileLoad = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const config = JSON.parse(text)
      loadExistingPack(config, [])
    } catch {
      alert('Kunde inte läsa filen. Kontrollera att det är en giltig pack.config.json.')
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: 560, width: '100%', animation: 'fadeIn 0.4s ease' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧙</div>
          <h1 style={{ fontSize: 36, marginBottom: 8, color: 'var(--text)' }}>
            PackWizard
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.6 }}>
            Skapa och redigera Playtypus-pack utan att skriva en enda rad kod.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <button
            onClick={() => setMode('create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px 24px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            <span style={{ fontSize: 28 }}>✨</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700 }}>
                Skapa nytt pack
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                Guidad wizard med AI-hjälp
              </div>
            </div>
          </button>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '20px 24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
          >
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileLoad}
            />
            <span style={{ fontSize: 28 }}>📂</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Redigera befintligt pack
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
                Ladda en pack.config.json
              </div>
            </div>
          </label>

          <button
            onClick={() => setMode('deploy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '20px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
          >
            <span style={{ fontSize: 28 }}>🚀</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Deploy-generator
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>
                Generera GitHub Actions YAML
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p style={{ marginTop: 40, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          PackWizard 2.0 · Playtypus Content Tools
        </p>
      </div>
    </div>
  )
}
