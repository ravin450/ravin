import React, { useState } from 'react'
import { ArrowRight, Users, Plus, Loader2, Mail, KeyRound, CheckCircle } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore'
import { sendCodeEmail } from '../lib/emailService'

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
  return 'xxxxxxxx-xxxx-xxxx'.replace(/x/g, () => Math.random().toString(36)[2])
}

function generateCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

const Brand = () => (
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

const pageStyle = {
  background: 'linear-gradient(180deg, #080808 0%, #0F0F0F 60%, #080808 100%)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3.5rem 1.5rem',
}

export default function Welcome() {
  const [step, setStep]                   = useState('start')
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [code, setCode]                   = useState('')
  const [sharedCode, setSharedCode]       = useState('')
  const [sharedEmail, setSharedEmail]     = useState('')
  const [emailSent, setEmailSent]         = useState(false)
  const [recoverEmail, setRecoverEmail]   = useState('')
  const [recoverSent, setRecoverSent]     = useState(false)
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)

  const reset = () => { setError(''); setLoading(false) }

  // ── Criar nova conta ──
  const handleCreate = async () => {
    if (!name.trim()) { setError('Informe seu nome'); return }
    if (!email.trim() || !email.includes('@')) { setError('Informe um e-mail válido'); return }
    setLoading(true); setError('')
    try {
      const householdId   = generateHouseholdId()
      const householdCode = generateCode()
      await setDoc(doc(db, 'households', householdId), {
        code:      householdCode,
        email:     email.trim().toLowerCase(),
        members:   [name.trim()],
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'codes', householdCode), { householdId })

      localStorage.setItem('cultivei_household_id',   householdId)
      localStorage.setItem('cultivei_household_code', householdCode)
      localStorage.setItem('finance_user_name',       name.trim())

      // Envia o código por e-mail automaticamente
      const sent = await sendCodeEmail(email.trim().toLowerCase(), householdCode)
      setSharedCode(householdCode)
      setSharedEmail(email.trim().toLowerCase())
      setEmailSent(sent)
      setStep('code-shown')
    } catch (e) {
      console.error(e)
      setError('Erro ao criar conta. Verifique sua conexão e tente novamente.')
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
      const { householdId } = codeDoc.data()
      localStorage.setItem('cultivei_household_id',   householdId)
      localStorage.setItem('cultivei_household_code', cleaned)
      localStorage.setItem('finance_user_name',       name.trim())
      window.location.replace('/')
    } catch (e) {
      console.error(e)
      setError('Erro ao entrar na conta. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  // ── Recuperar código por e-mail ──
  const handleRecover = async () => {
    if (!recoverEmail.trim() || !recoverEmail.includes('@')) { setError('Informe um e-mail válido'); return }
    setLoading(true); setError('')
    try {
      const snap = await getDocs(
        query(collection(db, 'households'), where('email', '==', recoverEmail.trim().toLowerCase()))
      )
      if (snap.empty) {
        setError('Nenhuma conta encontrada com este e-mail.')
        setLoading(false); return
      }
      const data = snap.docs[0].data()
      const sent = await sendCodeEmail(recoverEmail.trim().toLowerCase(), data.code)
      if (sent) {
        setRecoverSent(true)
      } else {
        // EmailJS não configurado — mostra o código na tela como fallback
        setError(`Seu código: ${data.code} (configure o EmailJS para envio automático)`)
      }
    } catch (e) {
      console.error(e)
      setError('Erro ao buscar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── Tela inicial ──
  if (step === 'start') return (
    <div style={pageStyle}>
      <div className="w-full max-w-xs flex flex-col items-center">
        <Brand />
        <p className="text-3xl font-bold text-white leading-tight tracking-tight text-center mb-2">
          Controle total.<br/>
          <span style={{ color: 'var(--gold)' }}>Resultados reais.</span>
        </p>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--text-muted)' }}>
          Gestão financeira compartilhada em tempo real.
        </p>
        <div className="w-full space-y-3">
          <button onClick={() => { setStep('create'); reset() }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            <Plus size={16} /> Criar nova conta
          </button>
          <button onClick={() => { setStep('join'); reset() }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
            <Users size={16} /> Entrar em conta existente
          </button>
          <button onClick={() => { setStep('recover'); reset(); setRecoverSent(false); setRecoverEmail('') }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
            style={{ color: 'var(--text-muted)' }}>
            <KeyRound size={14} /> Esqueci meu código
          </button>
        </div>
      </div>
    </div>
  )

  // ── Criar conta ──
  if (step === 'create') return (
    <div style={pageStyle}>
      <div className="w-full max-w-xs flex flex-col items-center">
        <Brand />
        <div className="w-full space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Seu nome
            </p>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Como podemos te chamar?" autoFocus maxLength={40}
              className="input-field text-base w-full" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Seu e-mail <span style={{ color: 'var(--gold)' }}>*</span>
            </p>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="Para receber seu código de acesso"
              className="input-field text-base w-full" />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              O código será enviado para este e-mail
            </p>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleCreate} disabled={loading || !name.trim() || !email.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Criar conta
          </button>
          <button onClick={() => { setStep('start'); reset() }}
            className="w-full text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Entrar em conta ──
  if (step === 'join') return (
    <div style={pageStyle}>
      <div className="w-full max-w-xs flex flex-col items-center">
        <Brand />
        <div className="w-full space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Seu nome</p>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Seu nome..." maxLength={40} autoFocus
              className="input-field text-base w-full" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Código da conta <span style={{ color: 'var(--gold)' }}>(8 caracteres)</span>
            </p>
            <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="Ex: AB3X9KQ2" maxLength={8} autoCapitalize="characters"
              className="input-field text-base w-full tracking-widest font-bold text-center" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleJoin} disabled={loading || !name.trim() || code.length !== 8}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            Entrar na conta
          </button>
          <button onClick={() => { setStep('recover'); reset(); setRecoverSent(false); setRecoverEmail('') }}
            className="w-full text-center text-sm py-2" style={{ color: 'var(--gold)', opacity: 0.7 }}>
            <KeyRound size={13} style={{ display: 'inline', marginRight: 5 }} />
            Esqueci meu código
          </button>
          <button onClick={() => { setStep('start'); reset() }}
            className="w-full text-center text-sm py-1" style={{ color: 'var(--text-muted)' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Código gerado ──
  if (step === 'code-shown') return (
    <div style={pageStyle}>
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        <Brand />

        {/* Código */}
        <div className="w-full rounded-2xl p-5 mb-4"
          style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.25)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Código da sua conta
          </p>
          <p className="text-4xl font-bold tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            {sharedCode}
          </p>
          <div className="gold-bar mt-3 mx-auto" style={{ width: 40 }} />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Compartilhe com seu parceiro para entrar na mesma conta.
          </p>
        </div>

        {/* Status do e-mail */}
        {emailSent ? (
          <div className="w-full flex items-center gap-2 rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle size={16} style={{ color: '#10B981', flexShrink: 0 }} />
            <p className="text-xs text-left" style={{ color: '#10B981' }}>
              Código enviado para <strong>{sharedEmail}</strong>
            </p>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2 rounded-xl px-4 py-3 mb-4"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Mail size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <p className="text-xs text-left" style={{ color: 'var(--text-muted)' }}>
              Salve o código acima. Configure o EmailJS para envio automático.
            </p>
          </div>
        )}

        {/* Entrar */}
        <button onClick={() => window.location.replace('/')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm mb-4"
          style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
          Entrar no Cultivei <ArrowRight size={16} />
        </button>

        {/* Esqueceu o código */}
        <button onClick={() => { setStep('recover'); reset(); setRecoverSent(false); setRecoverEmail('') }}
          className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>
          <KeyRound size={13} style={{ display: 'inline', marginRight: 5 }} />
          Esqueceu seu código? Recupere aqui
        </button>
      </div>
    </div>
  )

  // ── Recuperar código por e-mail ──
  if (step === 'recover') return (
    <div style={pageStyle}>
      <div className="w-full max-w-xs flex flex-col items-center">
        <Brand />
        <div className="w-full space-y-4">

          {recoverSent ? (
            /* Confirmação de envio */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle size={32} style={{ color: '#10B981' }} />
                </div>
              </div>
              <p className="text-white font-bold text-lg">E-mail enviado!</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Enviamos seu código de acesso para<br/>
                <strong style={{ color: 'var(--gold)' }}>{recoverEmail}</strong>
              </p>
              <button onClick={() => { setStep('join'); reset() }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
                Entrar com o código
              </button>
            </div>
          ) : (
            /* Formulário de recuperação */
            <>
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <p className="text-sm font-semibold text-white mb-1">Recuperar código de acesso</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Informe o e-mail cadastrado e enviaremos seu código.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  E-mail cadastrado
                </p>
                <input type="email" value={recoverEmail}
                  onChange={e => { setRecoverEmail(e.target.value); setError('') }}
                  placeholder="seu@email.com" autoFocus
                  className="input-field text-base w-full" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleRecover} disabled={loading || !recoverEmail.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #E2C472, #A87C2A)', color: '#0A0A0A' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Enviar código por e-mail
              </button>
            </>
          )}

          <button onClick={() => { setStep('start'); reset(); setRecoverSent(false); setRecoverEmail('') }}
            className="w-full text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
