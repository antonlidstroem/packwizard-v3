import { useState } from 'react'
import { exportPackZip } from '../services/exportService.js'

function ValidationItem({ ok, warn, label, detail }) {
  const color = ok ? 'var(--green)' : warn ? 'var(--yellow, #F7B731)' : 'var(--red)'
  const bg    = ok ? 'var(--green-dim)' : warn ? 'rgba(247,183,49,0.1)' : 'var(--red-dim)'
  const icon  = ok ? '✓' : '!'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: bg, border: `1px solid ${color}`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: ok ? 'var(--text-2)' : 'var(--text)', fontWeight: ok ? 400 : 500 }}>{label}</div>
        {detail && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{detail}</div>}
      </div>
    </div>
  )
}

export default function StepExport({ ctx }) {
  const { state } = ctx
  const { packMeta, features, activities, languages, viewConfig, aiFields } = state
  const backends = packMeta?.backends || []
  const [exporting, setExporting] = useState(false)
  const [exported,  setExported]  = useState(false)
  const [target,    setTarget]    = useState(state.deployTarget || 'github-pages')

  const cats = (packMeta.categories || []).map(c => typeof c === 'string' ? { id: c, label: c, emoji: '' } : c)
  const acts = activities || []
  const imageCount = acts.filter(a => a._heroImageData || a._thumbnailData).length + (packMeta._iconImageData ? 1 : 0)
  const backendCount = backends.filter(b => b.id && b.baseUrl).length
  const backendActCount = acts.filter(a => a.backendRef).length

  const checks = [
    { ok: !!packMeta.packId, label: 'Pack-ID är satt', detail: packMeta.packId ? `packId: "${packMeta.packId}"` : 'Genereras automatiskt från appnamnet — gå till Grundinfo.' },
    { ok: !!packMeta.appName, label: 'Appnamn är satt', detail: packMeta.appName || 'Obligatoriskt — gå till Grundinfo.' },
    { ok: (languages || []).length > 0, label: 'Minst ett språk valt', detail: (languages || []).join(', ') || 'Gå till Grundinfo och välj språk.' },
    { ok: acts.length > 0 || (aiFields || []).includes('activities'), label: `Aktiviteter (${acts.length} manuella${(aiFields||[]).includes('activities') ? ' + AI' : ''})`, detail: acts.length === 0 && !(aiFields||[]).includes('activities') ? 'Lägg till aktiviteter eller markera "Låt AI generera".' : null },
    // Backend-check: om activityActions är på ska det finnas minst ett backend
    ...(features?.activityActions ? [{
      ok: backendCount > 0,
      label: 'Backend-funktioner kräver backends',
      detail: backendCount > 0 ? `${backendCount} backend${backendCount !== 1 ? 's' : ''} konfigurerade` : 'activityActions är aktiverat men inga backends finns. Gå till Backend-steget.',
    }] : []),
  ]

  const warnings = [
    cats.length === 0 && { label: 'Inga kategorier', detail: 'Aktiviteter saknar filtertabbar i appen.' },
    cats.some(c => !c.emoji) && { label: 'Kategorier saknar emoji', detail: cats.filter(c => !c.emoji).map(c => c.label).join(', ') },
    !packMeta.tagline && { label: 'Ingen tagline', detail: 'Headern blir tom under appnamnet.' },
    !packMeta.emoji && { label: 'Ingen app-emoji', detail: 'Standardemoji ✨ används.' },
    acts.filter(a => !a.steps?.length).length > 0 && { label: `${acts.filter(a=>!a.steps?.length).length} aktiviteter saknar steg`, detail: 'Krävs för guidad visning och TTS.' },
    (aiFields || []).length > 0 && { label: `${aiFields.length} olösta AI-fält`, detail: `Kör AI-prompten för att fylla i: ${aiFields.join(', ')}` },
    backendCount > 0 && backendActCount === 0 && { label: 'Backends finns men inga aktiviteter använder dem', detail: `Gå till Aktiviteter och koppla minst en aktivitet till ett backend, eller ta bort backends.` },
    features?.heroImages && imageCount === 0 && { label: 'heroImages är aktiverat men inga bilder är uppladdade', detail: 'Gå till Utseende eller Aktiviteter och lägg till bilder, eller inaktivera heroImages i Funktioner.' },
  ].filter(Boolean)

  const canExport = checks.every(c => c.ok)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportPackZip({ ...state, deployTarget: target })
      setExported(true)
    } catch (e) {
      alert('Export misslyckades: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  const packId = packMeta.packId || 'pack'

  // Bygg ZIP-innehållslista
  const zipFiles = [
    `${packId}/pack.config.json`,
    ...(languages || ['sv']).map(l => `${packId}/activities.${l}.json`),
    ...(languages || ['sv']).map(l => `${packId}/translations.${l}.json`),
    `${packId}/theme.css`,
    `${packId}/theme-dark.css`,
    `${packId}/README.md`,
    ...(imageCount > 0 ? [`${packId}/images/ (${imageCount} fil${imageCount !== 1 ? 'er' : ''})`] : []),
    ...(target !== 'none' ? [`.github/workflows/deploy-${packId}.yml`] : []),
  ]

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Exportera pack</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>
        Kontrollera att allt ser rätt ut och ladda ner en ZIP med alla filer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Sammanfattning */}
        <div style={{ padding: '18px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sammanfattning</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Pack-ID',      packMeta.packId       || '—'],
              ['Appnamn',      packMeta.appName       || '—'],
              ['Tagline',      packMeta.tagline       || '—'],
              ['Emoji',        packMeta.emoji         || '—'],
              ['Version',      '7.0'],
              ['Accentfärg',   packMeta.accentColor   || '—'],
              ['Typsnitt',     packMeta.typography    || '—'],
              ['Standardvy',   viewConfig?.default    || 'grid'],
              ['Språk',        (languages || ['sv']).join(', ')],
              ['Aktiviteter',  `${acts.length} manuella${(aiFields||[]).includes('activities') ? ` + AI (${packMeta.activityCount||20})` : ''}`],
              ['Kategorier',   cats.map(c=>`${c.emoji||''}${c.label}`).join(', ') || '—'],
              ['Backends',     backendCount > 0 ? `${backendCount} konfigurerade` : 'Ingen (statisk pack)'],
              ['Bilder',       imageCount > 0 ? `${imageCount} uppladdade` : 'Inga'],
              ['Panikknapp',   packMeta.panicButton?.enabled ? 'På' : 'Av'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)', width: 110, flexShrink: 0 }}>{k}</span>
                <span style={{
                  color: k === 'Backends' && backendCount > 0 ? 'var(--accent)' : k === 'Bilder' && imageCount > 0 ? 'var(--blue)' : 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: ['Pack-ID','Accentfärg','Version'].includes(k) ? 'DM Mono, monospace' : 'inherit',
                  fontSize: ['Pack-ID','Accentfärg','Version'].includes(k) ? 12 : 13,
                }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Validering */}
        <div style={{
          padding: '18px 20px', background: 'var(--bg-card)',
          border: `1px solid ${!canExport ? 'var(--red)' : warnings.length > 0 ? 'rgba(247,183,49,0.5)' : 'var(--green)'}`,
          borderRadius: 'var(--radius)',
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validering</h3>
          {checks.map((c, i) => <ValidationItem key={i} {...c} />)}
          {warnings.length > 0 && (
            <>
              <div style={{ marginTop: 12, marginBottom: 8, fontSize: 11, fontWeight: 600, color: '#F7B731', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚠️ Varningar
              </div>
              {warnings.map((w, i) => <ValidationItem key={i} ok={false} warn label={w.label} detail={w.detail} />)}
            </>
          )}
        </div>
      </div>

      {/* Backend-info */}
      {backendCount > 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--accent)' }}>⚡ Pack med backend</strong>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {backends.filter(b => b.id && b.baseUrl).map(b => (
              <div key={b.id} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)', width: 80, flexShrink: 0 }}>{b.id}</code>
                <span style={{ color: 'var(--text-3)', fontFamily: 'DM Mono', fontSize: 11 }}>{b.baseUrl}</span>
                <span className="tag" style={{ background: 'var(--bg-input)', color: 'var(--text-3)', fontSize: 10 }}>{b.authMode}</span>
                {b.signalRHub && <span className="tag" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: 10 }}>SignalR</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
            ⚠️ <code style={{ fontFamily: 'DM Mono', fontSize: 11 }}>baseUrl</code> är hårdkodad i pack.config.json. Ändra den om du deployar mot en annan miljö (staging/prod).
          </p>
        </div>
      )}

      {/* Deploy-mål */}
      <div style={{ marginBottom: 24 }}>
        <label className="label">Deploy-mål</label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Välj var appen ska deployas — genererar rätt GitHub Actions YAML i ZIP:en.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'github-pages', label: '🐙 GitHub Pages' },
            { value: 'azure',        label: '☁️ Azure Static Web Apps' },
            { value: 'none',         label: '🔧 Manuellt (ingen YAML)' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setTarget(opt.value)} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13,
              border: target === opt.value ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: target === opt.value ? 'var(--accent-dim)' : 'var(--bg-input)',
              color: target === opt.value ? 'var(--accent)' : 'var(--text-2)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* ZIP-innehåll */}
      <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ZIP innehåller</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {zipFiles.map(f => (
            <div key={f} style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'DM Mono, monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--text-3)' }}>
                {f.includes('.yml') ? '⚙️' : f.includes('images/') ? '🖼️' : '📄'}
              </span>
              {f}
              {f.includes('.yml') && <span style={{ fontSize: 10, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 4, padding: '1px 6px' }}>GitHub Actions</span>}
              {f.includes('images/') && <span style={{ fontSize: 10, background: 'var(--blue-dim)', color: 'var(--blue)', borderRadius: 4, padding: '1px 6px' }}>v7 media</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Installationsguide */}
      <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 24, fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>
        <strong style={{ color: 'var(--text)' }}>📦 Installation i Playtypus</strong>
        <ol style={{ paddingLeft: 18, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <li>Kopiera pack-mappen till <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>src/Playtypus.Content/wwwroot/packs/</code></li>
          <li>Lägg till pack-ID i <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>packs/directory.json</code></li>
          <li>Kopiera <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>deploy-{packId}.yml</code> till <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>.github/workflows/</code></li>
          {backendCount > 0 && <li>Konfigurera och starta din backend-server och verifiera att <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>baseUrl</code> stämmer</li>}
          <li>Kör <code style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'var(--accent)' }}>dotnet run</code> lokalt för att verifiera att paketet laddas</li>
        </ol>
      </div>

      {/* Export-knapp */}
      <button className="btn btn-primary" onClick={handleExport} disabled={!canExport || exporting} style={{ fontSize: 15, padding: '12px 28px', opacity: !canExport ? 0.5 : 1, cursor: !canExport ? 'not-allowed' : 'pointer' }}>
        {exporting ? '⏳ Skapar ZIP...' : exported ? '✓ Exporterad! Ladda ner igen?' : '📦 Ladda ner ZIP'}
      </button>

      {!canExport && (
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>Åtgärda de markerade valideringsfelen ovan innan export.</p>
      )}
    </div>
  )
}
