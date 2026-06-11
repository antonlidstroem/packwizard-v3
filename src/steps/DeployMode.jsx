import { useState } from 'react'

const TARGETS = [
  {
    id: 'github-pages',
    label: 'GitHub Pages',
    icon: '🐙',
    desc: 'Gratis hosting via GitHub. Kräver public repo eller GitHub Pro.',
  },
  {
    id: 'azure',
    label: 'Azure Static Web Apps',
    icon: '☁️',
    desc: 'Microsoft Azure. Kräver Azure-konto och API-nyckel i repo secrets.',
  },
  {
    id: 'netlify',
    label: 'Netlify',
    icon: '⚡',
    desc: 'Netlify via CLI i Actions. Kräver Netlify-konto och auth-token.',
  },
]

function generateYaml(config) {
  const { packId, appName, target, orgName, branch, secretName } = config
  const id   = packId  || 'my-pack'
  const name = appName || id
  const org  = orgName || 'your-org'
  const br   = branch  || 'main'
  const sec  = secretName || 'CONTENT_REPO_TOKEN'

  if (target === 'github-pages') {
    return `name: Deploy ${name} to GitHub Pages

on:
  push:
    branches: [${br}]
    paths:
      - 'src/Playtypus.Content/wwwroot/packs/${id}/**'
      - 'bundles/${id}/**'
  workflow_dispatch:
    inputs:
      content_ref:
        description: 'Content branch or tag'
        default: '${br}'
        required: false

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: deploy-${id}
  cancel-in-progress: true

env:
  BUNDLE_ID: ${id}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout app repo
        uses: actions/checkout@v4

      - name: Checkout content repo
        uses: actions/checkout@v4
        with:
          repository: ${org}/playtypus-content
          ref: \${{ github.event.inputs.content_ref || '${br}' }}
          token: \${{ secrets.${sec} }}
          path: content

      - name: Copy pack content
        run: |
          cp -r content/packs/${id} src/Playtypus.Content/wwwroot/packs/
          cp -r content/bundles/${id} bundles/ 2>/dev/null || true

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 9.x

      - name: Build
        run: |
          dotnet publish src/Playtypus.Web/Playtypus.Web.csproj \\
            --configuration Release \\
            --output ./dist \\
            /p:BundleId=${id}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/wwwroot

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`
  }

  if (target === 'azure') {
    return `name: Deploy ${name} to Azure Static Web Apps

on:
  push:
    branches: [${br}]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Checkout content
        uses: actions/checkout@v4
        with:
          repository: ${org}/playtypus-content
          ref: ${br}
          token: \${{ secrets.${sec} }}
          path: content

      - name: Copy pack
        run: cp -r content/packs/${id} src/Playtypus.Content/wwwroot/packs/

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 9.x

      - name: Build
        run: dotnet publish src/Playtypus.Web -c Release -o dist /p:BundleId=${id}

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: \${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: dist/wwwroot
`
  }

  if (target === 'netlify') {
    return `name: Deploy ${name} to Netlify

on:
  push:
    branches: [${br}]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Checkout content
        uses: actions/checkout@v4
        with:
          repository: ${org}/playtypus-content
          ref: ${br}
          token: \${{ secrets.${sec} }}
          path: content

      - name: Copy pack
        run: cp -r content/packs/${id} src/Playtypus.Content/wwwroot/packs/

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 9.x

      - name: Build
        run: dotnet publish src/Playtypus.Web -c Release -o dist /p:BundleId=${id}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: dist/wwwroot
          production-branch: ${br}
          github-token: \${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy ${name} — \${{ github.sha }}"
        env:
          NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID_${id.toUpperCase().replace(/-/g,'_')} }}
`
  }

  return ''
}

export default function DeployMode() {
  const [config, setConfig] = useState({
    packId:     '',
    appName:    '',
    target:     'github-pages',
    orgName:    '',
    branch:     'main',
    secretName: 'CONTENT_REPO_TOKEN',
  })
  const [yaml, setYaml]   = useState('')
  const [copied, setCopied] = useState(false)

  const upd = (patch) => setConfig(prev => ({ ...prev, ...patch }))

  const handleGenerate = () => {
    setYaml(generateYaml(config))
    setCopied(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const id = config.packId || 'pack'
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `deploy-${id}.yml`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <div className="animate-fade">
          <h2 style={{ marginBottom: 6 }}>Deploy-generator</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
            Generera en GitHub Actions YAML för att automatisera deploy av ett specifikt pack.
            Varje pack får en egen workflow-fil.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label className="label">Pack-ID</label>
              <input className="input-base" value={config.packId}
                onChange={e => upd({ packId: e.target.value })}
                placeholder="t.ex. familyquest"
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }} />
            </div>
            <div>
              <label className="label">Appnamn (för kommentar)</label>
              <input className="input-base" value={config.appName}
                onChange={e => upd({ appName: e.target.value })}
                placeholder="t.ex. FamilyQuest" />
            </div>
            <div>
              <label className="label">GitHub-organisation/användare</label>
              <input className="input-base" value={config.orgName}
                onChange={e => upd({ orgName: e.target.value })}
                placeholder="t.ex. my-github-org" />
            </div>
            <div>
              <label className="label">Branch</label>
              <input className="input-base" value={config.branch}
                onChange={e => upd({ branch: e.target.value })}
                placeholder="main" />
            </div>
            <div>
              <label className="label">Secret-namn för content repo</label>
              <input className="input-base" value={config.secretName}
                onChange={e => upd({ secretName: e.target.value })}
                placeholder="CONTENT_REPO_TOKEN"
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }} />
            </div>
          </div>

          {/* Target */}
          <div style={{ marginBottom: 24 }}>
            <label className="label">Deploy-plattform</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {TARGETS.map(t => (
                <button key={t.id} onClick={() => upd({ target: t.id })}
                  style={{
                    flex: 1, padding: '14px 12px',
                    borderRadius: 'var(--radius)',
                    border: config.target === t.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: config.target === t.id ? 'var(--accent-dim)' : 'var(--bg-input)',
                    cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                  }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600,
                    color: config.target === t.id ? 'var(--accent)' : 'var(--text)', marginBottom: 3 }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!config.packId}
            style={{ opacity: !config.packId ? 0.5 : 1, marginBottom: 24, fontSize: 14, padding: '10px 24px' }}
          >
            ⚡ Generera YAML
          </button>

          {yaml && (
            <div style={{ animation: 'fadeIn 0.18s ease' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <label className="label" style={{ margin: 0 }}>
                  deploy-{config.packId || 'pack'}.yml
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={handleCopy}>
                    {copied ? '✓ Kopierat!' : '📋 Kopiera'}
                  </button>
                  <button className="btn btn-primary" onClick={handleDownload}>
                    ⬇ Ladda ner
                  </button>
                </div>
              </div>

              <pre style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 18,
                fontSize: 12,
                fontFamily: 'DM Mono, monospace',
                lineHeight: 1.7,
                color: 'var(--text-2)',
                overflowX: 'auto',
                whiteSpace: 'pre',
                maxHeight: 480,
                overflowY: 'auto',
              }}>
                {yaml}
              </pre>

              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7,
              }}>
                <strong style={{ color: 'var(--text)' }}>Placera filen i ditt repo:</strong>
                <br />
                <code style={{ fontFamily: 'DM Mono', color: 'var(--accent)', fontSize: 11 }}>
                  .github/workflows/deploy-{config.packId || 'pack'}.yml
                </code>
                <br /><br />
                Lägg till dessa secrets i GitHub repo settings → Secrets:
                <br />
                <code style={{ fontFamily: 'DM Mono', color: 'var(--accent)', fontSize: 11 }}>
                  {config.secretName || 'CONTENT_REPO_TOKEN'}
                </code>
                {config.target === 'azure' && (
                  <>, <code style={{ fontFamily: 'DM Mono', color: 'var(--accent)', fontSize: 11 }}>AZURE_STATIC_WEB_APPS_API_TOKEN</code></>
                )}
                {config.target === 'netlify' && (
                  <>, <code style={{ fontFamily: 'DM Mono', color: 'var(--accent)', fontSize: 11 }}>NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID_{(config.packId || 'PACK').toUpperCase().replace(/-/g,'_')}</code></>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side info panel */}
      <div style={{
        width: 280, flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg-panel)',
        padding: 24,
        overflowY: 'auto',
      }}>
        <h3 style={{ fontSize: 14, marginBottom: 16 }}>Hur det fungerar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '1', title: 'En YAML per pack', text: 'Varje pack får en helt självständig workflow. De triggas oberoende av varandra.' },
            { icon: '2', title: 'Trigger på path', text: 'Deployen startar automatiskt när du pushar ändringar i just det packens filer.' },
            { icon: '3', title: 'Content-repo', text: 'Workflow:en checkar ut content-repot separat och kopierar in packen innan build.' },
            { icon: '4', title: 'workflow_dispatch', text: 'Du kan också trigga manuellt med valfri branch/tag via GitHub Actions-UI.' },
          ].map(item => (
            <div key={item.icon} style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', color: 'var(--accent)',
                border: '1px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
