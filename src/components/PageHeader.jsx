import React from 'react'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="px-5 pt-12 pb-5" style={{
      background: '#080808',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
          <div className="gold-bar mt-2" style={{ width: 32 }} />
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}
