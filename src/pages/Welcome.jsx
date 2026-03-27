import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ background: '#0C0E14' }}>

      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden mb-8 shadow-glow"
          style={{ border: '1px solid rgba(59,130,246,0.25)' }}>
          <img src="/favicon.svg" alt="App" className="w-20 h-20" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 text-center">
          Suas finanças,<br/>no controle.
        </h1>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--text-muted)' }}>
          Simples. Rápido. Sem complicação.
        </p>

        {/* Input */}
        <div className="w-full mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Como te chamamos?
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
          />
          {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>

        <button onClick={handleStart} disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95 mt-1"
          style={{
            background: name.trim() ? 'var(--blue)' : 'var(--surface-2)',
            color: name.trim() ? '#fff' : 'var(--text-muted)',
            opacity: name.trim() ? 1 : 0.6,
          }}>
          Entrar
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs text-center" style={{ color: '#334155' }}>
        Dados salvos apenas no seu dispositivo
      </p>
    </div>
  )
}
