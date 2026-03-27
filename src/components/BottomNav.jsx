import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, List, Mic, Wallet, Target } from 'lucide-react'

const leftNav  = [{ to: '/', label: 'Início', icon: Home }, { to: '/transacoes', label: 'Extrato', icon: List }]
const rightNav = [{ to: '/orcamento', label: 'Orçamento', icon: Wallet }, { to: '/metas', label: 'Metas', icon: Target }]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto safe-bottom z-50"
      style={{ background: '#0F1320', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-around px-1 py-2">

        {leftNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-150">
            {({ isActive }) => (<>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6}
                style={{ color: isActive ? 'var(--blue)' : '#475569' }} />
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--blue)' : '#475569' }}>{label}</span>
            </>)}
          </NavLink>
        ))}

        <NavLink to="/voz" className="flex flex-col items-center gap-0.5 -mt-4">
          {({ isActive }) => (<>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-glow transition-all duration-150"
              style={{ background: isActive ? '#1D4ED8' : 'var(--blue)' }}>
              <Mic size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-medium mt-0.5"
              style={{ color: isActive ? 'var(--blue)' : '#475569' }}>Voz/IA</span>
          </>)}
        </NavLink>

        {rightNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-150">
            {({ isActive }) => (<>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6}
                style={{ color: isActive ? 'var(--blue)' : '#475569' }} />
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? 'var(--blue)' : '#475569' }}>{label}</span>
            </>)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
