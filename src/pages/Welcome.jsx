import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function LogoMark({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wgold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2C472"/>
          <stop offset="100%" stopColor="#A87C2A"/>
        </linearGradient>
        <linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0E0E0E"/>
          <stop offset="100%" stopColor="#1C1C1C"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="36" fill="url(#wbg)"/>
      <rect x="2" y="2" width="196" height="196" rx="35" fill="none" stroke="url(#wgold)" strokeWidth="1.5" opacity="0.6"/>
      <rect x="38" y="56" width="124" height="20" rx="4" fill="url(#wgold)"/>
      <rect x="90" y="76" width="20" height="70" rx="4" fill="url(#wgold)"/>
      <polyline points="136,68 155,44 168,50" fill="none" stroke="url(#wgold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
      <circle cx="155" cy="44" r="4.5" fill="#E2C472"/>
      <line x1="55" y1="162" x2="145" y2="162" stroke="#C9A84C" strokeWidth="1.5" opacity="0.4"/>
      <line x1="65" y1="173" x2="135" y2="173" stroke="#C9A84C" strokeWidth="1.5" opacity="0.22"/>
    </svg>
  )
}

export default function Welcome() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleStart = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Informe seu nome'); return }
    localStorage.setItem('finance_user_name', trimmed)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-14"
      style={{ background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)' }}>

      <div />

      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6 relative">
          <div style={{
            filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.25)) drop-shadow(0 0 8px rgba(201,168,76,0.15))'
          }}>
            <LogoMark size={80} />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold tracking-widest uppercase"
            style={{ color: '#E2C472', letterSpacing: '0.22em', fontWeight: 800 }}>
            TerraRica
          </h1>
          <div className="gold-bar mt-2 mx-auto" style={{ width: 48 }} />
          <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}>
            Finanças do Campo
          </p>
        </div>

        {/* Headline */}
        <div className="text-center mt-8 mb-10">
          <p className="text-3xl font-bold text-white leading-tight tracking-tight">
            Controle total.<br/>
            <span style={{ color: 'var(--gold)' }}>Resultados reais.</span>
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
            Gestão financeira precisa e sem complicação.
          </p>
        </div>

        {/* Input */}
        <div className="w-full mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Como podemos te chamar?
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Seu nome..."
            autoFocus
            maxLength={40}
            className="input-field text-base w-full"
            style={{ background: '#111111' }}
          />
          {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>

        <button onClick={handleStart} disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 active:scale-95 mt-1"
          style={{
            background: name.trim()
              ? 'linear-gradient(135deg, #E2C472, #A87C2A)'
              : 'var(--surface-2)',
            color: name.trim() ? '#0A0A0A' : 'var(--text-muted)',
            opacity: name.trim() ? 1 : 0.5,
            letterSpacing: '0.06em',
          }}>
          Entrar no TerraRica
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: '#2a2a2a' }}>
        Seus dados ficam salvos apenas no seu dispositivo
      </p>
    </div>
  )
}
