import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, Plus, Loader2 } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

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

function generateHouseholdId() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.random().toString(36)[2])
}

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function Welcome() {
  const [step, setStep]       = useState('start')   // start | create | join | code-shown
  const [name, setName]       = useState('')
  const [code, setCode]       = useState('')
  const [sharedCode, setSharedCode] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // ── Criar nova conta ──
  const handleCreate = async () => {
    if (!name.trim()) { setError('Informe seu nome'); return }
    setLoading(true); setError('')
    try {
      const householdId   = generateHouseholdId()
      const householdCode = generateCode()
      await setDoc(doc(db, 'households', householdId), {
        code: householdCode,
        createdAt: serverTimestamp(),
        members: [name.trim()],
      })
      await setDoc(doc(db, 'codes', householdCode), { householdId })

      localStorage.setItem('cultivei_household_id',   householdId)
      localStorage.setItem('cultivei_household_code', householdCode)
      localStorage.setItem('finance_user_name',       name.trim())
      setSharedCode(householdCode)
      setStep('code-shown')
    } catch (e) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Entrar em conta existente ──
  const handleJoin = async () => {
    if (!name.trim()) { setError('Informe seu nome'); return }
    const cleaned = code.trim().toUpperCase()
    if (cleaned.length !== 8) { setError('O código deve ter 8 caracteres'); return }
    setLoading(true); setError('')
    try {
      const codeDoc = await getDoc(doc(db, 'codes', cleaned))
      if (!codeDoc.exists()) { setError('Código não encontrado. Verifique e tente novamente.'); setLoading(false); return }
      const householdId = codeDoc.data().householdId
      localStorage.setItem('cultivei_household_id',   householdId)
      localStorage.setItem('cultivei_household_code', cleaned)
      localStorage.setItem('finance_user_name',       name.trim())
      navigate('/', { replace: true })
    } catch (e) {
      setError('Erro ao entrar na conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const brand = (
    <div className="flex flex-col items-center mb-8">
      <div style={{ filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.25))' }}>
        <LogoMark size={72} />
      </div>
      <h1 className="text-2xl font-bold tracking-widest uppercase mt-4"
        style={{ color: '#E2C472', letterSpacing: '0.22em', fontWeight: 800 }}>
        Cultivei
      </h1>
      <div className="gold-bar mt-2 mx-auto" style={{ width: 40 }} />
      <p className="text-xs uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}>
        Finanças com propósito
      </p>
    </div>
  )

  // ── Tela inicial ──
  if (step === 'start') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14"
      style={{ background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)' }}>
      <div className="w-full max-w-xs flex flex-col items-center">
        {brand}
        <p className="text-3xl font-bold text-white leading-tight tracking-tight text-center mb-2">
          Controle total.<br/>
          <span style={{ color: 'var(--gold)' }}>Resultados reais.</span>
        </p>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--text-muted)' }}>
          Gestão financeira compartilhada em tempo real.
        </p>
        <div className="w-full space-y-3">
          <button onClick={() => setStep('create')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            <Plus size={16} /> Criar nova conta
          </button>
          <button onClick={() => setStep('join')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
            <Users size={16} /> Entrar em conta existente
          </button>
        </div>
      </div>
    </div>
  )

  // ── Criar conta ──
  if (step === 'create') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14"
      style={{ background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)' }}>
      <div className="w-full max-w-xs flex flex-col items-center">
        {brand}
        <div className="w-full space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Como podemos te chamar?
            </p>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Seu nome..." autoFocus maxLength={40}
              className="input-field text-base w-full" style={{ background: '#111111' }} />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleCreate} disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Criar conta
          </button>
          <button onClick={() => { setStep('start'); setError('') }}
            className="w-full text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Entrar em conta ──
  if (step === 'join') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14"
      style={{ background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)' }}>
      <div className="w-full max-w-xs flex flex-col items-center">
        {brand}
        <div className="w-full space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Seu nome
            </p>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Seu nome..." maxLength={40}
              className="input-field text-base w-full" style={{ background: '#111111' }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Código da conta (8 caracteres)
            </p>
            <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="Ex: AB3X9KQ2" maxLength={8} autoCapitalize="characters"
              className="input-field text-base w-full tracking-widest font-bold" style={{ background: '#111111' }} />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleJoin} disabled={loading || !name.trim() || code.length !== 8}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            Entrar na conta
          </button>
          <button onClick={() => { setStep('start'); setError('') }}
            className="w-full text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Código gerado — mostrar para o parceiro ──
  if (step === 'code-shown') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14"
      style={{ background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)' }}>
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        {brand}
        <div className="w-full rounded-2xl p-5 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Código da sua conta
          </p>
          <p className="text-4xl font-bold tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            {sharedCode}
          </p>
          <div className="gold-bar mt-3 mx-auto" style={{ width: 40 }} />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Compartilhe este código com seu parceiro para que ele entre na mesma conta
          </p>
        </div>
        <button onClick={() => navigate('/', { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
          Entrar no Cultivei <ArrowRight size={16} />
        </button>
        <p className="text-xs mt-4" style={{ color: '#2a2a2a' }}>
          Você pode ver este código depois em Configurações
        </p>
      </div>
    </div>
  )
}
