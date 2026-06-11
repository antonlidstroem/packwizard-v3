const NAV = [
  { id: 'welcome', icon: '🏠', label: 'Start'    },
  { id: 'create',  icon: '✨', label: 'Skapa'    },
  { id: 'edit',    icon: '✏️',  label: 'Redigera' },
  { id: 'deploy',  icon: '🚀', label: 'Deploy'   },
]

export default function Sidebar({ mode, setMode, resetState }) {
  return (
    <nav style={{
      width: 64,
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: 4,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        width: 40, height: 40,
        background: 'var(--accent)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 16,
        flexShrink: 0,
      }}>
        🧙
      </div>

      {NAV.map(item => (
        <button
          key={item.id}
          onClick={() => setMode(item.id)}
          title={item.label}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: mode === item.id ? 'var(--accent-dim)' : 'transparent',
            border: mode === item.id ? '1px solid var(--accent)' : '1px solid transparent',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            cursor: 'pointer',
            color: 'inherit',
          }}
        >
          <span style={{ lineHeight: 1 }}>{item.icon}</span>
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Rensa allt och börja om?')) resetState()
        }}
        title="Börja om"
        className="btn-ghost"
        style={{
          width: 44, height: 44,
          borderRadius: 10,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ↺
      </button>
    </nav>
  )
}
