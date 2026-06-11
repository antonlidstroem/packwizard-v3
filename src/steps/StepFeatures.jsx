import { useState } from 'react'

const FEATURE_GROUPS = [
  {
    group: 'Kärn­funktioner',
    desc: 'Grundläggande interaktion som de flesta appar bör ha.',
    items: [
      { key: 'favorites', label: '⭐ Favoriter', desc: 'Användaren kan spara favoritaktiviteter med en lång-tryckning eller hjärtknapp. Visas i en dedikerad flik.', playtypusKey: 'features.favorites' },
      { key: 'favoritesShelf', label: '📚 Favorithylla', desc: 'Visar favoriter som en horisontell carousel på startsidan — snabb åtkomst utan att byta flik. Kräver att Favoriter är aktiverat.', requires: ['favorites'], playtypusKey: 'features.favoritesShelf' },
      { key: 'doneTracking', label: '✅ Klar-markering', desc: 'Aktiviteter kan markeras som genomförda. Visar framsteg med en checkmark och räknar totalt antal genomförda.', playtypusKey: 'features.doneTracking' },
      { key: 'recentHistory', label: '🕐 Nyligen visade', desc: 'Visar de 5 senaste aktiviteterna användaren klickade på, i en carousel på startsidan. Hjälper användaren att hitta tillbaka snabbt.', playtypusKey: 'features.recentHistory' },
    ],
  },
  {
    group: 'Engagemang & motivation',
    desc: 'Funktioner som uppmuntrar regelbunden användning och belönar framsteg.',
    items: [
      { key: 'logbook', label: '📖 Loggbok', desc: 'Sparar genomförda aktiviteter med datum, valfri anteckning och foto. Skapar en personlig äventyrsbok. Kräver doneTracking.', requires: ['doneTracking'], playtypusKey: 'features.logbook' },
      { key: 'streakTracking', label: '🔥 Streak-spårning', desc: 'Räknar dagliga streak-dagar och visar en framstegslista. Motiverar regelbunden användning. Konfigurera mål (t.ex. 7 dagar) nedan.', type: 'streak', playtypusKey: 'features.streakTracking' },
      { key: 'badges', label: '🏅 Badges / Medaljer', desc: 'Användaren tjänar in badges för milstolpar: 10 aktiviteter klara, 30-dagarstreak, alla kategorier utforskade m.m. Kräver doneTracking.', requires: ['doneTracking'], playtypusKey: 'features.badges' },
      { key: 'levelBadges', label: '🎖️ Svårighets-badges', desc: 'Visar en färgad badge på aktivitetskorten som indikerar svårighetsgrad (1=grön, 2=gul, 3=röd). Hjälper användaren att filtrera efter ambitionsnivå.', playtypusKey: 'features.levelBadges' },
    ],
  },
  {
    group: 'Delning & tillgänglighet',
    desc: 'Gör det lättare att nå ut och använda appen i fler sammanhang.',
    items: [
      { key: 'shareActivity', label: '📤 Dela aktivitet', desc: 'Dela-knapp på varje aktivitet. Öppnar enhetens Web Share API (Skicka till, AirDrop, kopiera länk). Fungerar på iOS och Android.', playtypusKey: 'features.shareActivity' },
      { key: 'textToSpeech', label: '🔊 Uppläsning (TTS)', desc: 'Läser upp aktivitetens titel, beskrivning och steg med enhetens inbyggda text-till-tal. Passar för barn, tillgänglighet och hands-free-läge.', playtypusKey: 'features.textToSpeech' },
      { key: 'audioPlayer', label: '🎵 Ljudspelare', desc: 'Visar en inbäddad ljudspelare om aktivitetens contentBlocks innehåller audio-filer. Passar guidade meditationer och ljudberättelser.', playtypusKey: 'features.audioPlayer' },
      { key: 'printView', label: '🖨️ Utskriftsvänlig vy', desc: 'Lägger till en "Skriv ut"-knapp på aktivitetssidan som öppnar en formaterad utskriftsdialog. Bra för recept, handledningar och klassrum.', playtypusKey: 'features.printView' },
      { key: 'haptics', label: '📳 Haptisk återkoppling', desc: 'Lätta vibrationspulser vid knapptryckningar och markerade aktiviteter. Förbättrar appkänslan på mobilenheter. Ej märkbart på desktop.', playtypusKey: 'features.haptics' },
    ],
  },
  {
    group: 'Aktivitets­upplevelse',
    desc: 'Styr hur aktivitetskorten upplevs när användaren öppnar dem.',
    items: [
      { key: 'guidedMode', label: '📋 Guidad visning', desc: 'Lägger till en Starta-knapp och en Nästa-knapp på aktivitetssidan. Aktivitetens steps visas ett i taget, fokuserat. Passar träning, recept och guider.', playtypusKey: 'features.guidedMode' },
    ],
  },
  {
    group: 'Export',
    desc: 'Tillåter användaren att exportera sin data.',
    items: [
      { key: 'export', label: '📄 PDF-export', desc: 'Exportera loggboken som en formaterad PDF-fil. Kräver att Loggbok är aktiverat. Konfigureras med om foton ska inkluderas.', type: 'export', requires: ['logbook'], playtypusKey: 'features.export' },
    ],
  },
  {
    group: 'Avancerat (v6)',
    desc: 'Nya funktioner i Playtypus v6. Rekommenderas för erfarna pack-skapare.',
    advanced: true,
    items: [
      { key: 'activityNotes', label: '📝 Aktivitetsanteckningar', desc: 'Användaren kan skriva en kort fritext-anteckning direkt på ett aktivitetskort, utan att det sparas i loggboken.', playtypusKey: 'features.activityNotes' },
      { key: 'cardActions', label: '⚡ Snabbknappar på kort', desc: 'Visar snabbknappar (Klar, Favorit, Dela) direkt på aktivitetskortet utan att öppna detaljvyn. Kompakta interaktioner.', playtypusKey: 'features.cardActions' },
      { key: 'fontSizeScale', label: '🔤 Textskalning', desc: 'Lägger till en textstorleksreglage i inställningar. Användaren kan skala text 80–140%. Förbättrar tillgängligheten.', playtypusKey: 'features.fontSizeScale' },
      { key: 'slideshow', label: '📽️ Presentationsläge', desc: 'Aktiviteter kan visas i ett helskärmsläge optimerat för projektor eller klassrum — steg för steg med stor text.', playtypusKey: 'features.slideshow' },
      { key: 'allowUserContent', label: '✏️ Användarskapade aktiviteter', desc: 'Tillåter användaren att skapa egna aktiviteter som sparas lokalt. Dessa syns bara för den användaren.', playtypusKey: 'features.allowUserContent' },
      { key: 'progressionLock', label: '🔒 Progressionslås', desc: 'Aktiviteter kan låsas i en sekvens — nästa aktivitet låses upp först när föregående är klar. Passar kursinnehåll och program.', playtypusKey: 'features.progressionLock' },
      { key: 'dataSync', label: '💾 Dataexport', desc: 'Tillåter användaren att exportera och importera lokal data (favoriter, klara aktiviteter, anteckningar) som JSON.', type: 'dataSync', playtypusKey: 'features.dataSync' },
      { key: 'reminders', label: '🔔 Påminnelser', desc: 'Skickar en daglig push-notis vid en vald tid för att påminna användaren om att göra en aktivitet.', type: 'reminders', playtypusKey: 'features.reminders' },
    ],
  },
  {
    group: 'Backend & media (v7)',
    desc: 'Nya Playtypus v7-funktioner för serverkoppling och rikt bildinnehåll. Kräver extra konfiguration — se Backend-steget.',
    v7group: true,
    items: [
      {
        key: 'activityActions',
        label: '⚡ Backend-kopplade aktiviteter',
        desc: 'Aktiviteter kan kommunicera med din server via REST-anrop och actions. Krävs för delade listor, formulär och all läs/skriv-interaktion mot ett backend. Konfigureras i Backend-steget och per aktivitet via "backendRef".',
        playtypusKey: 'features.activityActions',
      },
      {
        key: 'backendStatus',
        label: '🔌 Serverstatus-bar',
        desc: 'Visar en liten statusindikator i appens header som visar om servern är nåbar eller om appen kör i offline-läge. Hjälper användaren att förstå om realtidsdata visas. Kräver minst ett konfigurerat backend.',
        playtypusKey: 'features.backendStatus',
      },
      {
        key: 'heroImages',
        label: '🖼️ Hero-bilder på aktiviteter',
        desc: 'Visar en stor hero-bild högst upp på aktivitetssidan. Bilden sätts per aktivitet i aktivitets-editorn via "Hero-bild"-fältet och bäddas in i pack-ZIP:en som images/act-XXX-hero.jpg. Höjer den visuella kvaliteten avsevärt.',
        playtypusKey: 'features.heroImages',
      },
      {
        key: 'contentBlocks',
        label: '🧱 Rikt innehåll (contentBlocks)',
        desc: 'Aktiviteter kan innehålla strukturerade innehållsblock: bilder, video-embeds, ljudfiler, rich text och HTML. Definieras i activity.contentBlocks[]-arrayen. Används t.ex. för recept med steg-bilder eller guidade meditationer med ljud.',
        playtypusKey: 'features.contentBlocks',
      },
      {
        key: 'thumbnails',
        label: '🖼️ Miniatyrbilder på kort',
        desc: 'Ersätter emoji-ikonen på aktivitetskorten med en miniatyrbild (thumbnail). Bilden sätts per aktivitet via "Thumbnail"-fältet i aktivitets-editorn. Ger appen en mer fotorealistisk och visuell känsla.',
        playtypusKey: 'features.thumbnails',
      },
    ],
  },
]

function Toggle({ on, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? 'var(--accent)' : 'var(--border)',
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative', transition: 'var(--transition)', flexShrink: 0,
      opacity: disabled ? 0.4 : 1,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 22 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'var(--transition)',
      }} />
    </button>
  )
}

export default function StepFeatures({ ctx }) {
  const { state, updateFeatures } = ctx
  const { features } = state
  const hasBackends = (state.packMeta?.backends || []).length > 0

  const toggle = (key) => {
    const cur = features[key]
    if (key === 'streakTracking') {
      updateFeatures({ streakTracking: cur ? null : { goal: 7, period: 'daily' } })
    } else if (key === 'export') {
      updateFeatures({ export: cur ? null : { format: 'pdf', includePhotos: false } })
    } else if (key === 'reminders') {
      updateFeatures({ reminders: cur ? null : { enabled: true, time: '09:00', frequency: 'daily' } })
    } else if (key === 'dataSync') {
      updateFeatures({ dataSync: cur && cur !== 'none' ? 'none' : 'export-only' })
    } else {
      updateFeatures({ [key]: !cur })
    }
  }

  const isEnabled = (key) => {
    const v = features[key]
    if (key === 'streakTracking' || key === 'export' || key === 'reminders') return v != null
    if (key === 'dataSync') return v && v !== 'none'
    return !!v
  }

  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="animate-fade">
      <h2 style={{ marginBottom: 6 }}>Funktioner</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
        Välj vilka funktioner appen ska ha. Alla funktioner kan aktiveras och inaktiveras per aktivitetskort
        i aktivitets-steget (overrides).
      </p>

      <div style={{
        padding: '10px 14px', marginBottom: 24,
        background: 'var(--blue-dim)', border: '1px solid var(--blue)',
        borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--blue)' }}>ℹ️ Tips:</strong> Börja minimalt — det är lättare att lägga till funktioner
        efter att appen lanserats än att ta bort dem. Inaktiverade funktioner syns inte i Playtypus alls,
        så de påverkar inte prestanda.
      </div>

      {FEATURE_GROUPS.map(group => {
        if (group.advanced && !showAdvanced) return null
        return (
          <div key={group.group} style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {group.group}
                </h3>
                {group.v7group && (
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>
                    v7
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{group.desc}</p>

              {/* v7-varning om ingen backend är konfigurerad */}
              {group.v7group && !hasBackends && ['activityActions','backendStatus'].some(k => isEnabled(k)) && (
                <div style={{
                  marginTop: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(247,183,49,0.08)', border: '1px solid rgba(247,183,49,0.3)',
                  fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5,
                }}>
                  ⚠️ Du har aktiverat backend-beroende funktioner men inget backend är konfigurerat än.
                  Gå till <strong>Backend-steget</strong> och lägg till minst ett backend, eller inaktivera dessa funktioner.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.items.map(item => {
                const on = isEnabled(item.key)
                const disabled = item.requires?.some(r => !isEnabled(r))
                return (
                  <div key={item.key} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                    background: on ? 'var(--accent-glow)' : 'var(--bg-card)',
                    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', transition: 'var(--transition)',
                    opacity: disabled ? 0.5 : 1,
                  }}>
                    <Toggle on={on} onClick={() => toggle(item.key)} disabled={disabled} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: item.playtypusKey ? 4 : 0 }}>
                        {item.desc}
                      </div>
                      {disabled && (
                        <span style={{ fontSize: 11, color: 'var(--red)', display: 'block', marginTop: 4 }}>
                          ⚠️ Kräver att {item.requires.map(r => {
                            const found = FEATURE_GROUPS.flatMap(g => g.items).find(i => i.key === r)
                            return found?.label || r
                          }).join(' och ')} är aktiverat
                        </span>
                      )}
                      {item.playtypusKey && (
                        <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: 2, display: 'block' }}>
                          → {item.playtypusKey}
                        </span>
                      )}
                    </div>

                    {/* Streak config */}
                    {item.key === 'streakTracking' && on && features.streakTracking && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Mål:</div>
                        <input type="number" min={1} max={365}
                          value={features.streakTracking.goal || 7}
                          onChange={e => updateFeatures({ streakTracking: { ...features.streakTracking, goal: parseInt(e.target.value) } })}
                          className="input-base"
                          style={{ width: 60, padding: '4px 8px', fontSize: 13 }}
                          onClick={e => e.stopPropagation()}
                        />
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>dagar</div>
                      </div>
                    )}

                    {/* Export config */}
                    {item.key === 'export' && on && features.export && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input type="checkbox"
                            checked={features.export.includePhotos || false}
                            onChange={e => updateFeatures({ export: { ...features.export, includePhotos: e.target.checked } })}
                          />
                          Inkl. foton
                        </label>
                      </div>
                    )}

                    {/* dataSync config */}
                    {item.key === 'dataSync' && on && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        {['export-only', 'full'].map(mode => (
                          <button key={mode} onClick={() => updateFeatures({ dataSync: mode })}
                            style={{
                              padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                              border: features.dataSync === mode ? '1px solid var(--accent)' : '1px solid var(--border)',
                              background: features.dataSync === mode ? 'var(--accent-dim)' : 'var(--bg-input)',
                              color: features.dataSync === mode ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer',
                            }}>{mode === 'export-only' ? 'Export' : 'Export + Import'}</button>
                        ))}
                      </div>
                    )}

                    {/* Reminders config */}
                    {item.key === 'reminders' && on && features.reminders && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <input type="time"
                          value={features.reminders.time || '09:00'}
                          onChange={e => updateFeatures({ reminders: { ...features.reminders, time: e.target.value } })}
                          className="input-base"
                          style={{ width: 90, padding: '4px 8px', fontSize: 13 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Toggle för avancerade features */}
      <button onClick={() => setShowAdvanced(v => !v)} style={{
        width: '100%', padding: '12px 16px', marginBottom: 24,
        background: 'var(--bg-input)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius)', cursor: 'pointer',
        fontSize: 13, color: 'var(--text-2)', textAlign: 'center',
        transition: 'var(--transition)',
      }}>
        {showAdvanced ? '▲ Dölj avancerade v6-funktioner' : '▼ Visa avancerade v6-funktioner'}
      </button>

      <div style={{
        padding: '14px 16px', background: 'var(--blue-dim)',
        border: '1px solid var(--blue)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--blue)' }}>ℹ️ Per-aktivitet override</strong>
        <br />
        Dessa inställningar gäller för hela appen. I aktivitets-editorn (nästa steg) kan du
        aktivera eller inaktivera specifika funktioner per enskilt aktivitetskort —
        t.ex. aktivera timer på ett recept men inte på en utomhusaktivitet.
        Overrides skrivs till <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>activity.cardFeatures</code> i JSON.
      </div>
    </div>
  )
}
