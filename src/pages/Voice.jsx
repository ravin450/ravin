import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Check, X, RefreshCw, Sparkles } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants'
import { formatCurrency } from '../utils/formatters'

// ──────────────────────────────────────────────
// Mapeamento de palavras-chave → categoria
// ──────────────────────────────────────────────
const CATEGORY_MAP = {
  // Receitas
  salário: 'salario', salario: 'salario', 'contra-cheque': 'salario', contracheque: 'salario',
  freelance: 'freelance', projeto: 'freelance', 'trabalho extra': 'freelance',
  investimento: 'investimentos', rendimento: 'investimentos', dividendo: 'investimentos', juros: 'investimentos',
  // Despesas
  mercado: 'alimentacao', supermercado: 'alimentacao', feira: 'alimentacao',
  restaurante: 'alimentacao', almoço: 'alimentacao', almoco: 'alimentacao',
  lanche: 'alimentacao', café: 'alimentacao', cafe: 'alimentacao', pizza: 'alimentacao', hamburguer: 'alimentacao',
  combustível: 'transporte', combustivel: 'transporte', gasolina: 'transporte',
  uber: 'transporte', '99': 'transporte', ônibus: 'transporte', onibus: 'transporte',
  metrô: 'transporte', metro: 'transporte', passagem: 'transporte', pedágio: 'transporte',
  aluguel: 'moradia', condomínio: 'moradia', condominio: 'moradia',
  água: 'moradia', agua: 'moradia', luz: 'moradia', energia: 'moradia', internet: 'moradia', conta: 'moradia',
  farmácia: 'saude', farmacia: 'saude', remédio: 'saude', remedios: 'saude',
  médico: 'saude', medico: 'saude', consulta: 'saude', dentista: 'saude', hospital: 'saude',
  escola: 'educacao', faculdade: 'educacao', curso: 'educacao', livro: 'educacao', apostila: 'educacao',
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

  // ── Tipo: receita ou despesa ──
  let type = 'expense'
  for (const kw of INCOME_TRIGGERS) {
    if (t.includes(kw)) { type = 'income'; break }
  }

  // ── Valor ──
  const patterns = [
    /r\$\s*(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)/,
    /(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)\s*(?:reais|real|r\$)/,
    /(\d+(?:[.,]\d{1,2})?)/,
  ]
  let amount = 0
  for (const p of patterns) {
    const m = t.match(p)
    if (m) {
      amount = parseFloat(m[1].replace(/\./g, '').replace(',', '.'))
      break
    }
  }

  // ── Categoria ──
  let category = type === 'income' ? 'outros_receita' : 'outros'
  for (const [kw, cat] of Object.entries(CATEGORY_MAP)) {
    if (t.includes(kw)) { category = cat; break }
  }

  // ── Descrição ──
  const description = text.trim().slice(0, 80)

  return { type, amount, category, description }
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function Voice() {
  const { addTransaction } = useFinance()
  const [mode, setMode] = useState('text')
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('idle') // idle | parsing | preview | success
  const [editData, setEditData] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  // ── Voz ──
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Reconhecimento de voz não suportado. Use Chrome ou Edge.')
      return
    }
    const r = new SR()
    r.lang = 'pt-BR'
    r.continuous = false
    r.interimResults = false
    recognitionRef.current = r

    r.onstart = () => { setIsListening(true); setStatus('idle') }
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInputText(transcript)
      runParse(transcript)
    }
    r.onerror = (e) => {
      setIsListening(false)
      if (e.error !== 'no-speech') alert('Erro: ' + e.error)
    }
    r.onend = () => setIsListening(false)
    r.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // ── Parse ──
  const runParse = (text) => {
    if (!text.trim()) return
    setStatus('parsing')
    setTimeout(() => {
      const parsed = parseTransactionText(text)
      const today = new Date().toISOString().split('T')[0]
      setEditData({ ...parsed, date: today })
      setStatus('preview')
    }, 500)
  }

  const handleReset = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setStatus('idle')
    setEditData(null)
    setInputText('')
  }

  const handleConfirm = () => {
    if (!editData?.amount) return
    addTransaction({
      ...editData,
      date: new Date(editData.date + 'T12:00:00').toISOString(),
    })
    setStatus('success')
    setTimeout(() => {
      handleReset()
    }, 2200)
  }

  const cats = editData?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="gradient-main px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-300" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Entrada Rápida</h1>
            <p className="text-primary-200 text-sm">Fale ou escreva — cadastro automático</p>
          </div>
        </div>

        {/* Toggle voice / text */}
        <div className="flex mt-5 bg-white/20 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setMode('voice'); handleReset() }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              mode === 'voice' ? 'bg-white text-primary-700 shadow' : 'text-white/75 hover:text-white'
            }`}
          >
            <Mic size={15} /> Voz
          </button>
          <button
            onClick={() => { setMode('text'); handleReset() }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              mode === 'text' ? 'bg-white text-primary-700 shadow' : 'text-white/75 hover:text-white'
            }`}
          >
            ✏️ Texto
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-10">

        {/* ── TEXTO ── */}
        {mode === 'text' && status === 'idle' && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-700 mb-3">Descreva sua transação em português:</p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={"Ex: Gastei R$ 45 no supermercado\nRecebi 5500 de salário\nPaguei 1200 de aluguel"}
              className="input-field resize-none h-28 text-sm leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runParse(inputText) }
              }}
            />
            <button
              onClick={() => runParse(inputText)}
              disabled={!inputText.trim()}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} /> Analisar e Cadastrar
            </button>

            {/* Exemplos rápidos */}
            <div className="mt-4 border-t border-stone-100 pt-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Toque para testar:</p>
              <div className="space-y-1.5">
                {[
                  'Gastei R$ 85 no supermercado',
                  'Recebi R$ 5.500 de salário',
                  'Paguei 1200 de aluguel',
                  'Comprei combustível 180 reais',
                  'Paguei consulta médica 250',
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInputText(ex)}
                    className="w-full text-left text-xs text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors border border-primary-100"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VOZ ── */}
        {mode === 'voice' && status === 'idle' && (
          <div className="card text-center pt-8 pb-6">
            {/* Botão microfone */}
            <div className="relative inline-flex items-center justify-center mb-5">
              {isListening && (
                <span className="absolute w-24 h-24 rounded-full bg-amber-400/30 animate-ping" />
              )}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 scale-110 shadow-red-300'
                    : 'gradient-main shadow-green'
                }`}
              >
                {isListening
                  ? <MicOff size={32} className="text-white" />
                  : <Mic size={32} className="text-white" />
                }
              </button>
            </div>

            {isListening ? (
              <>
                <p className="font-bold text-gray-800 text-lg">Ouvindo...</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Fale sua transação agora</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary-500 rounded-full animate-bounce"
                      style={{ height: `${10 + i * 5}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <button onClick={stopListening} className="btn-danger mx-auto text-sm px-5 py-2.5">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <p className="font-bold text-gray-800 text-lg">Toque para falar</p>
                <p className="text-sm text-gray-400 mt-1 px-6 mb-5">
                  Diga o que gastou ou recebeu em voz alta
                </p>
                <button onClick={startListening} className="btn-primary mx-auto flex items-center gap-2 text-sm px-6">
                  <Mic size={16} /> Iniciar Gravação
                </button>
              </>
            )}

            {inputText && (
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                <p className="text-xs text-amber-700 font-semibold mb-1">Você disse:</p>
                <p className="text-sm text-gray-700 italic">"{inputText}"</p>
              </div>
            )}

            {/* Dicas */}
            <div className="mt-5 bg-stone-50 rounded-xl p-3 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Como usar:</p>
              <div className="space-y-1 text-xs text-gray-500">
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
            <div className="w-14 h-14 rounded-full gradient-main mx-auto flex items-center justify-center mb-4 animate-spin">
              <RefreshCw size={24} className="text-white" />
            </div>
            <p className="font-bold text-gray-800">Analisando texto...</p>
            <p className="text-sm text-gray-400 mt-1">Detectando valor, tipo e categoria</p>
          </div>
        )}

        {/* ── CONFIRMAR ── */}
        {status === 'preview' && editData && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-base">Confirmar Transação</h3>
              <button onClick={handleReset} className="p-1.5 rounded-lg bg-stone-100 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Texto detectado */}
            {inputText && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-amber-700 font-semibold">Detectado:</p>
                <p className="text-xs text-gray-600 italic mt-0.5">"{inputText}"</p>
              </div>
            )}

            {/* Tipo */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setEditData({ ...editData, type: 'expense', category: 'outros' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  editData.type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'bg-stone-100 text-gray-600'
                }`}
              >
                💸 Despesa
              </button>
              <button
                onClick={() => setEditData({ ...editData, type: 'income', category: 'outros_receita' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  editData.type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-100 text-gray-600'
                }`}
              >
                💰 Receita
              </button>
            </div>

            {/* Valor */}
            <div className="mb-3">
              <label className="label">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                  className="input-field pl-10 text-2xl font-bold text-gray-900"
                />
              </div>
              {!editData.amount && (
                <p className="text-xs text-red-500 mt-1">⚠️ Valor não detectado — preencha manualmente</p>
              )}
            </div>

            {/* Categoria */}
            <div className="mb-3">
              <label className="label">Categoria</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="input-field"
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="mb-3">
              <label className="label">Descrição</label>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="input-field text-sm"
                maxLength={100}
              />
            </div>

            {/* Data */}
            <div className="mb-5">
              <label className="label">Data</label>
              <input
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Botão confirmar */}
            <button
              onClick={handleConfirm}
              disabled={!editData.amount}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              Adicionar {editData.type === 'income' ? 'Receita' : 'Despesa'}
            </button>
          </div>
        )}

        {/* ── SUCESSO ── */}
        {status === 'success' && editData && (
          <div className="card text-center py-12">
            <div className="w-18 h-18 mx-auto mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center shadow-lg">
                <Check size={32} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <p className="font-bold text-gray-800 text-xl">Transação Adicionada!</p>
            <p className="text-sm text-gray-500 mt-2">
              {editData.type === 'income' ? '💰 Receita' : '💸 Despesa'} de{' '}
              <span className="font-bold text-gray-800">{formatCurrency(editData.amount)}</span> registrada
            </p>
            <div className="mt-4 bg-primary-50 rounded-xl px-4 py-2 inline-block">
              <p className="text-xs text-primary-700 font-medium">
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
