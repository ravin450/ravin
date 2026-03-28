import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, List, Mic, Wallet, Target, CreditCard } from 'lucide-react'

const leftNav  = [
  { to: '/',          label: 'Início',    icon: Home },
  { to: '/transacoes',label: 'Extrato',   icon: List },
  { to: '/parcelas',  label: 'Parcelas',  icon: CreditCard },
]
const rightNav = [
  { to: '/orcamento', label: 'Orçamento', icon: Wallet },
  { to: '/metas',     label: 'Metas',     icon: Target },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto safe-bottom z-50"
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-around px-1 py-2">

        {leftNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all duration-150">
            {({ isActive }) => (<>
              <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5}
                style={{ color: isActive ? 'var(--gold)' : '#444444' }} />
              <span className="text-[9px] font-medium"
                style={{ color: isActive ? 'var(--gold)' : '#444444' }}>{label}</span>
              {isActive && <div className="gold-bar" style={{ width: 14, marginTop: 1 }} />}
            </>)}
          </NavLink>
        ))}

        <NavLink to="/voz" className="flex flex-col items-center gap-0.5 -mt-5">
          {({ isActive }) => (<>
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #E2C472, #A87C2A)'
                  : 'linear-gradient(135deg, #C9A84C, #8A6820)',
                boxShadow: isActive
                  ? '0 0 24px rgba(201,168,76,0.5)'
                  : '0 0 14px rgba(201,168,76,0.25)'
              }}>
              <Mic size={20} color="#0A0A0A" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-medium mt-0.5"
              style={{ color: isActive ? 'var(--gold)' : '#444444' }}>Voz/IA</span>
          </>)}
        </NavLink>

        {rightNav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all duration-150">
            {({ isActive }) => (<>
              <Icon size={19} strokeWidth={isActive ? 2.2 : 1.5}
                style={{ color: isActive ? 'var(--gold)' : '#444444' }} />
              <span className="text-[9px] font-medium"
                style={{ color: isActive ? 'var(--gold)' : '#444444' }}>{label}</span>
              {isActive && <div className="gold-bar" style={{ width: 14, marginTop: 1 }} />}
            </>)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
