import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Check, X, RefreshCw, Sparkles } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants'
import { formatCurrency } from '../utils/formatters'
import PageHeader from '../components/PageHeader'

const CATEGORY_MAP = {
  salário: 'salario', salario: 'salario', 'contra-cheque': 'salario', contracheque: 'salario',
  freelance: 'freelance', projeto: 'freelance', 'trabalho extra': 'freelance',
  investimento: 'investimentos', rendimento: 'investimentos', dividendo: 'investimentos', juros: 'investimentos',
  mercado: 'alimentacao', supermercado: 'alimentacao', feira: 'alimentacao',
  restaurante: 'alimentacao', almoço: 'alimentacao', almoco: 'alimentacao',
  lanche: 'alimentacao', café: 'alimentacao', cafe: 'alimentacao', pizza: 'alimentacao', hamburguer: 'alimentacao',
  combustível: 'transporte', combustivel: 'transporte', gasolina: 'transporte',
  uber: 'transporte', '99': 'transporte', ônibus: 'transporte', onibus: 'transporte',
  metrô: 'transporte', metro: 'transporte', passagem: 'transporte', pedágio: 'transporte',
  aluguel: 'moradia', condomínio: 'moradia', condominio: 'moradia',
  água: 'moradia', agua: 'moradia', luz: 'moradia', energia: 'moradia', internet: 'moradia',
  farmácia: 'saude', farmacia: 'saude', remédio: 'saude', remedios: 'saude',
  médico: 'saude', medico: 'saude', consulta: 'saude', dentista: 'saude', hospital: 'saude',
  escola: 'educacao', faculdade: 'educacao', curso: 'educacao', livro: 'educacao',
  netflix: 'lazer', cinema: 'lazer', show: 'lazer', teatro: 'lazer', viagem: 'lazer',
  festa: 'lazer', bar: 'lazer', balada: 'lazer', jogo: 'lazer', lazer: 'lazer',
  roupa: 'roupas', calçado: 'roupas', calcado: 'roupas', tênis: 'roupas', tenis: 'roupas',
  vestido: 'roupas', camisa: 'roupas', calça: 'roupas', calca: 'roupas',
}

const INCOME_TRIGGERS = [
  'recebi', 'ganhei', 'entrou', 'receita', 'renda', 'pagamento recebido',
  'depósito', 'deposito', 'rendimento', 'lucro', 'salário', 'salario',
  'freelance recebido', 'transferência recebida',
]

const EXPENSE_TRIGGERS = [
  'gastei', 'paguei', 'comprei', 'saiu', 'despesa', 'gasto', 'conta',
  'boleto', 'parcelei', 'dívida', 'divida', 'debitou', 'cobrado',
]

function parseTransactionText(text) {
  const t = text.toLowerCase().trim()
  let type = 'expense'
  for (const kw of INCOME_TRIGGERS) {
    if (t.includes(kw)) { type = 'income'; break }
  }
  const patterns = [
    /r\$\s*(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)/,
    /(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)\s*(?:reais|real|r\$)/,
    /(\d+(?:[.,]\d{1,2})?)/,
  ]
  let amount = 0
  for (const p of patterns) {
    const m = t.match(p)
    if (m) { amount = parseFloat(m[1].replace(/\./g, '').replace(',', '.')); break }
  }
  let category = type === 'income' ? 'outros_receita' : 'outros'
  for (const [kw, cat] of Object.entries(CATEGORY_MAP)) {
    if (t.includes(kw)) { category = cat; break }
  }
  return { type, amount, category, description: text.trim().slice(0, 80) }
}

const EXEMPLOS = [
  'Gastei R$ 85 no supermercado',
  'Recebi R$ 5.500 de salário',
  'Paguei 1200 de aluguel',
  'Comprei combustível 180 reais',
  'Paguei consulta médica 250',
]

export default function Voice() {
  const { addTransaction } = useFinance()
  const [mode, setMode] = useState('text')
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('idle')
  const [editData, setEditData] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => { return () => recognitionRef.current?.stop() }, [])

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Use Chrome ou Edge para reconhecimento de voz.'); return }
    const r = new SR()
    r.lang = 'pt-BR'; r.continuous = false; r.interimResults = false
    recognitionRef.current = r
    r.onstart = () => { setIsListening(true); setStatus('idle') }
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInputText(t); runParse(t) }
    r.onerror = (e) => { setIsListening(false); if (e.error !== 'no-speech') alert('Erro: ' + e.error) }
    r.onend = () => setIsListening(false)
    r.start()
  }

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false) }

  const runParse = (text) => {
    if (!text.trim()) return
    setStatus('parsing')
    setTimeout(() => {
      const parsed = parseTransactionText(text)
      setEditData({ ...parsed, date: new Date().toISOString().split('T')[0] })
      setStatus('preview')
    }, 500)
  }

  const handleReset = () => {
    recognitionRef.current?.stop()
    setIsListening(false); setStatus('idle'); setEditData(null); setInputText('')
  }

  const handleConfirm = () => {
    if (!editData?.amount) return
    addTransaction({ ...editData, date: new Date(editData.date + 'T12:00:00').toISOString() })
    setStatus('success')
    setTimeout(handleReset, 2200)
  }

  const cats = editData?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="min-h-screen bg-page">
      <PageHeader
        title="Entrada Rápida"
        subtitle="Fale ou escreva — cadastro automático"
        icon={<Sparkles size={18} style={{ color: 'var(--gold)' }} />}
      />

      <div className="px-4 pt-4 pb-10 space-y-4">

        {/* Toggle voz / texto */}
        <div className="flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'voice', label: '🎙 Voz' },
            { id: 'text',  label: '✏️ Texto' },
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setMode(tab.id); handleReset() }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: mode === tab.id ? 'linear-gradient(135deg, #C9A84C, #8A6820)' : 'transparent',
                color: mode === tab.id ? '#0A0A0A' : 'var(--text-muted)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TEXTO ── */}
        {mode === 'text' && status === 'idle' && (
          <div className="card space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                Descreva sua transação em português:
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"Ex: Gastei R$ 45 no supermercado\nRecebi 5500 de salário\nPaguei 1200 de aluguel"}
                className="input-field resize-none text-sm leading-relaxed"
                style={{ height: 112 }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runParse(inputText) } }}
              />
              <button onClick={() => runParse(inputText)} disabled={!inputText.trim()}
                className="btn-primary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={16} /> Analisar e Cadastrar
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--text-muted)' }}>
                Toque para testar:
              </p>
              <div className="space-y-1.5">
                {EXEMPLOS.map((ex) => (
                  <button key={ex} onClick={() => setInputText(ex)}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-dim)',
                      border: '1px solid rgba(201,168,76,0.12)'
                    }}>
                    <span style={{ color: 'var(--gold)' }}>"</span>{ex}<span style={{ color: 'var(--gold)' }}>"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VOZ ── */}
        {mode === 'voice' && status === 'idle' && (
          <div className="card text-center pt-8 pb-6">
            <div className="relative inline-flex items-center justify-center mb-5">
              {isListening && (
                <span className="absolute w-24 h-24 rounded-full animate-ping"
                  style={{ background: 'rgba(201,168,76,0.2)' }} />
              )}
              <button onClick={isListening ? stopListening : startListening}
                className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                style={{
                  background: isListening
                    ? '#DC2626'
                    : 'linear-gradient(135deg, #C9A84C, #8A6820)',
                  boxShadow: isListening
                    ? '0 0 24px rgba(220,38,38,0.4)'
                    : '0 0 24px rgba(201,168,76,0.35)',
                  transform: isListening ? 'scale(1.08)' : 'scale(1)',
                }}>
                {isListening
                  ? <MicOff size={32} color="#fff" />
                  : <Mic size={32} color="#0A0A0A" />
                }
              </button>
            </div>

            {isListening ? (
              <>
                <p className="font-bold text-white text-lg">Ouvindo...</p>
                <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Fale sua transação agora</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-1.5 rounded-full animate-bounce"
                      style={{ height: `${10 + i * 5}px`, animationDelay: `${i * 0.1}s`, background: 'var(--gold)' }} />
                  ))}
                </div>
                <button onClick={stopListening}
                  className="mx-auto text-sm px-5 py-2.5 rounded-xl font-semibold"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <p className="font-bold text-white text-lg">Toque para falar</p>
                <p className="text-sm mt-1 px-6 mb-5" style={{ color: 'var(--text-muted)' }}>
                  Diga o que gastou ou recebeu em voz alta
                </p>
                <button onClick={startListening}
                  className="btn-primary mx-auto flex items-center gap-2 text-sm px-6">
                  <Mic size={16} /> Iniciar Gravação
                </button>
              </>
            )}

            {inputText && (
              <div className="mt-5 rounded-xl p-3 text-left"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>Você disse:</p>
                <p className="text-sm italic" style={{ color: 'var(--text-dim)' }}>"{inputText}"</p>
              </div>
            )}

            <div className="mt-5 rounded-xl p-3 text-left"
              style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Como usar:</p>
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <p>🛒 "Gastei cinquenta reais no mercado"</p>
                <p>💼 "Recebi três mil de salário"</p>
                <p>🏠 "Paguei duzentos de aluguel"</p>
                <p>⛽ "Comprei gasolina cento e cinquenta"</p>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALISANDO ── */}
        {status === 'parsing' && (
          <div className="card text-center py-12">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 animate-spin"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #8A6820)' }}>
              <RefreshCw size={24} color="#0A0A0A" />
            </div>
            <p className="font-bold text-white">Analisando texto...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Detectando valor, tipo e categoria</p>
          </div>
        )}

        {/* ── CONFIRMAR ── */}
        {status === 'preview' && editData && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Confirmar Transação</h3>
              <button onClick={handleReset}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
                <X size={16} />
              </button>
            </div>

            {inputText && (
              <div className="rounded-xl px-3 py-2 mb-4"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Detectado:</p>
                <p className="text-xs italic mt-0.5" style={{ color: 'var(--text-dim)' }}>"{inputText}"</p>
              </div>
            )}

            {/* Tipo */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setEditData({ ...editData, type: 'expense', category: 'outros' })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: editData.type === 'expense' ? 'rgba(239,68,68,0.15)' : 'var(--surface-2)',
                  color: editData.type === 'expense' ? '#EF4444' : 'var(--text-muted)',
                  border: editData.type === 'expense' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                💸 Despesa
              </button>
              <button onClick={() => setEditData({ ...editData, type: 'income', category: 'outros_receita' })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: editData.type === 'income' ? 'rgba(34,197,94,0.12)' : 'var(--surface-2)',
                  color: editData.type === 'income' ? '#22C55E' : 'var(--text-muted)',
                  border: editData.type === 'income' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                💰 Receita
              </button>
            </div>

            {/* Valor */}
            <div className="mb-3">
              <label className="label">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--gold)' }}>R$</span>
                <input type="number" inputMode="decimal" step="0.01" min="0"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                  className="input-field pl-10 text-2xl font-bold" />
              </div>
              {!editData.amount && (
                <p className="text-xs text-red-400 mt-1">⚠️ Valor não detectado — preencha manualmente</p>
              )}
            </div>

            {/* Categoria */}
            <div className="mb-3">
              <label className="label">Categoria</label>
              <select value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="input-field">
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="mb-3">
              <label className="label">Descrição</label>
              <input type="text" value={editData.description} maxLength={100}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="input-field text-sm" />
            </div>

            {/* Data */}
            <div className="mb-5">
              <label className="label">Data</label>
              <input type="date" value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                className="input-field" />
            </div>

            <button onClick={handleConfirm} disabled={!editData.amount}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Check size={18} />
              Adicionar {editData.type === 'income' ? 'Receita' : 'Despesa'}
            </button>
          </div>
        )}

        {/* ── SUCESSO ── */}
        {status === 'success' && editData && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}>
              <Check size={32} color="#22C55E" strokeWidth={3} />
            </div>
            <p className="font-bold text-white text-xl">Transação Adicionada!</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {editData.type === 'income' ? '💰 Receita' : '💸 Despesa'} de{' '}
              <span className="font-bold text-white">{formatCurrency(editData.amount)}</span> registrada
            </p>
            <div className="mt-4 rounded-xl px-4 py-2 inline-block"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
                {(editData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
                  .find((c) => c.id === editData.category)?.icon}{' '}
                {(editData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
                  .find((c) => c.id === editData.category)?.label}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
