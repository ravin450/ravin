import React, { useState, useEffect } from 'react'
import { X, Check, Zap, RefreshCw, CreditCard, Plus, Trash2 } from 'lucide-react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants'
import { useFinance } from '../context/FinanceContext'
import { parseSmartInput } from '../utils/smartInput'
import CategoryIcon, { CUSTOM_ICON_OPTIONS, CUSTOM_COLOR_OPTIONS } from './CategoryIcon'

const defaultForm = {
  type: 'expense', amount: '', category: '', description: '',
  date: new Date().toISOString().split('T')[0],
  necessity: 'need',
  recurring: false,
  installments: 1,
}

const INSTALLMENT_PRESETS = [2, 3, 4, 6, 10, 12, 18, 24, 36, 48]

export default function TransactionModal({ isOpen, onClose, transaction = null }) {
  const { addTransaction, addTransactions, updateTransaction, customCategories, addCustomCategory, deleteCustomCategory } = useFinance()
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [smartText, setSmartText] = useState('')
  const [smartApplied, setSmartApplied] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCat, setNewCat] = useState({ label: '', color: '#f97316', icon: 'tag' })
  const isEditing = !!transaction

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type, amount: transaction.amount.toString(),
        category: transaction.category, description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        necessity: transaction.necessity || 'need',
        recurring: transaction.recurring || false,
        installments: 1,
      })
    } else { setForm(defaultForm) }
    setErrors({})
    setSmartText('')
    setSmartApplied(false)
    setShowAddCat(false)
    setNewCat({ label: '', color: '#f97316', icon: 'tag' })
  }, [transaction, isOpen])

  if (!isOpen) return null

  const defaultCats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const customCatsForType = customCategories.filter(c => c.type === form.type)
  const allCats = [...defaultCats, ...customCatsForType]

  const handleSmartInput = (text) => {
    setSmartText(text)
    if (text.length > 4) {
      const parsed = parseSmartInput(text)
      const updates = {}
      if (parsed.amount) updates.amount = parsed.amount.toString()
      if (parsed.type) updates.type = parsed.type
      if (parsed.category) updates.category = parsed.category
      if (Object.keys(updates).length > 0) {
        setForm(prev => {
          const newForm = { ...prev, ...updates }
          if (updates.type && updates.type !== prev.type && !updates.category) newForm.category = ''
          return newForm
        })
        setSmartApplied(true)
      } else { setSmartApplied(false) }
    } else { setSmartApplied(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = 'Valor inválido'
    if (!form.category) e.category = 'Selecione uma categoria'
    if (!form.date) e.date = 'Informe a data'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault(); if (!validate()) return
    const userName = localStorage.getItem('finance_user_name') || 'Usuário'
    const total = parseFloat(form.amount.replace(',', '.'))
    const cat = allCats.find(c => c.id === form.category)
    const baseData = {
      type: form.type, amount: total, category: form.category,
      description: form.description.trim(),
      necessity: form.type === 'expense' ? form.necessity : null,
      recurring: form.recurring,
      addedBy: isEditing ? (transaction.addedBy || userName) : userName,
    }

    if (!isEditing && form.installments > 1) {
      const monthly = total / form.installments
      const groupId = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const startDate = new Date(form.date + 'T12:00:00')
      const desc = form.description.trim() || cat?.label || 'Parcela'
      addTransactions(
        Array.from({ length: form.installments }, (_, i) => {
          const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate())
          return {
            ...baseData, amount: monthly,
            date: d.toISOString(),
            description: `${desc} (${i + 1}/${form.installments})`,
            installmentGroup: groupId,
            installmentNumber: i + 1,
            installmentTotal: form.installments,
          }
        })
      )
    } else if (isEditing) {
      updateTransaction(transaction.id, { ...baseData, date: new Date(form.date + 'T12:00:00').toISOString() })
    } else {
      addTransaction({ ...baseData, date: new Date(form.date + 'T12:00:00').toISOString() })
    }
    onClose()
  }

  const handleSaveNewCat = () => {
    if (!newCat.label.trim()) return
    addCustomCategory({ label: newCat.label.trim(), type: form.type, color: newCat.color, icon: newCat.icon })
    setShowAddCat(false)
    setNewCat({ label: '', color: '#f97316', icon: 'tag' })
  }

  const monthly = form.installments > 1 && form.amount
    ? (parseFloat(form.amount.replace(',', '.')) / form.installments).toFixed(2).replace('.', ',')
    : null

  return (
    <div className="fixed inset-0 z-[100] flex items-end modal-overlay"
      style={{ paddingBottom: 'max(64px, env(safe-area-inset-bottom) + 64px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-auto rounded-t-2xl shadow-modal modal-content flex flex-col"
        style={{
          background: '#131720', border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none', maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
              <X size={16} />
            </button>
          </div>
          <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--surface-2)' }}>
            {['expense', 'income'].map((t) => (
              <button key={t} type="button"
                onClick={() => setForm({ ...form, type: t, category: '' })}
                className="flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-150"
                style={{
                  background: form.type === t ? (t === 'expense' ? 'rgba(248,113,113,0.2)' : 'rgba(16,185,129,0.2)') : 'transparent',
                  color: form.type === t ? (t === 'expense' ? '#F87171' : '#10B981') : 'var(--text-muted)',
                }}>
                {t === 'expense' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-5 py-4 space-y-4">

            {/* Lançamento Rápido */}
            {!isEditing && (
              <div>
                <label className="label flex items-center gap-1.5">
                  <Zap size={12} style={{ color: 'var(--gold)' }} />
                  Lançamento Rápido
                </label>
                <div className="relative">
                  <input type="text"
                    placeholder='Ex: "gastei 50 no mercado" ou "recebi 3000 de salário"'
                    value={smartText} onChange={(e) => handleSmartInput(e.target.value)}
                    className="input-field text-sm"
                    style={{ paddingRight: smartApplied ? '84px' : '12px' }} />
                  {smartApplied && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)' }}>aplicado</span>
                  )}
                </div>
              </div>
            )}

            {/* Valor */}
            <div>
              <label className="label">Valor</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>R$</span>
                <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.,]/g, '') })}
                  className={`input-field pl-10 text-xl font-bold ${errors.amount ? 'border-red-500' : ''}`} />
              </div>
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
            </div>

            {/* Categoria */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Categoria</label>
                <button type="button" onClick={() => setShowAddCat(!showAddCat)}
                  className="flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: showAddCat ? 'var(--text-muted)' : 'var(--gold)' }}>
                  <Plus size={12} />
                  {showAddCat ? 'Cancelar' : 'Nova'}
                </button>
              </div>

              {/* Form nova categoria */}
              {showAddCat && (
                <div className="rounded-xl p-3 mb-3 space-y-3"
                  style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <input type="text" placeholder="Nome da categoria" value={newCat.label}
                    onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
                    className="input-field text-sm" maxLength={30} />
                  <div>
                    <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Ícone</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {CUSTOM_ICON_OPTIONS.map(({ id, Icon }) => (
                        <button key={id} type="button"
                          onClick={() => setNewCat({ ...newCat, icon: id })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: newCat.icon === id ? `${newCat.color}25` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${newCat.icon === id ? newCat.color + '50' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                          <Icon size={14} color={newCat.icon === id ? newCat.color : '#666'} strokeWidth={1.8} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Cor</p>
                    <div className="flex gap-2">
                      {CUSTOM_COLOR_OPTIONS.map(c => (
                        <button key={c} type="button"
                          onClick={() => setNewCat({ ...newCat, color: c })}
                          className="w-6 h-6 rounded-full transition-all"
                          style={{
                            background: c,
                            boxShadow: newCat.color === c ? `0 0 0 2px #131720, 0 0 0 4px ${c}` : 'none',
                          }} />
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={handleSaveNewCat}
                    disabled={!newCat.label.trim()}
                    className="w-full py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: newCat.label.trim() ? 'linear-gradient(135deg, #C9A84C, #8A6820)' : 'rgba(255,255,255,0.05)',
                      color: newCat.label.trim() ? '#0A0A0A' : 'var(--text-muted)',
                    }}>
                    Criar Categoria
                  </button>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {allCats.map((cat) => (
                  <button key={cat.id} type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all duration-150 relative group"
                    style={{
                      background: form.category === cat.id ? 'rgba(59,130,246,0.08)' : 'var(--surface-2)',
                      borderColor: form.category === cat.id ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)',
                    }}>
                    <CategoryIcon categoryId={cat.id} categoryMeta={cat} size="sm" />
                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-dim)' }}>
                      {cat.label}
                    </span>
                    {cat.custom && (
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); deleteCustomCategory(cat.id); if (form.category === cat.id) setForm({...form, category: ''}) }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center hidden group-hover:flex"
                        style={{ background: '#DC2626' }}>
                        <Trash2 size={8} color="#fff" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Necessidade vs Desejo */}
            {form.type === 'expense' && (
              <div>
                <label className="label">Tipo de gasto</label>
                <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--surface-2)' }}>
                  {[{ id: 'need', label: 'Necessidade', emoji: '✅' }, { id: 'want', label: 'Desejo', emoji: '✨' }].map((opt) => (
                    <button key={opt.id} type="button"
                      onClick={() => setForm({ ...form, necessity: opt.id })}
                      className="flex-1 py-2 rounded-md text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
                      style={{
                        background: form.necessity === opt.id ? (opt.id === 'need' ? 'rgba(34,197,94,0.15)' : 'rgba(168,85,247,0.15)') : 'transparent',
                        color: form.necessity === opt.id ? (opt.id === 'need' ? '#22C55E' : '#A855F7') : 'var(--text-muted)',
                      }}>
                      <span>{opt.emoji}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            <div>
              <label className="label">Descrição</label>
              <input type="text" placeholder="Opcional..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" maxLength={100} />
            </div>

            {/* Data */}
            <div>
              <label className="label">Data</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`input-field ${errors.date ? 'border-red-500' : ''}`} />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Parcelamento — apenas despesas, apenas criação */}
            {form.type === 'expense' && !isEditing && (
              <div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-white flex items-center gap-1.5">
                      <CreditCard size={13} style={{ color: 'var(--text-muted)' }} />
                      Parcelado
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Dividir em parcelas mensais</p>
                  </div>
                  <button type="button"
                    onClick={() => setForm({ ...form, installments: form.installments > 1 ? 1 : 2 })}
                    className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{ background: form.installments > 1 ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                      style={{ left: form.installments > 1 ? '22px' : '2px' }} />
                  </button>
                </div>
                {form.installments > 1 && (
                  <div className="mt-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {INSTALLMENT_PRESETS.map(n => (
                        <button key={n} type="button"
                          onClick={() => setForm({ ...form, installments: n })}
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: form.installments === n ? 'linear-gradient(135deg, #C9A84C, #8A6820)' : 'var(--surface-2)',
                            color: form.installments === n ? '#0A0A0A' : 'var(--text-muted)',
                          }}>
                          {n}x
                        </button>
                      ))}
                    </div>
                    {monthly && (
                      <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--gold)' }}>
                        {form.installments}x de R$ {monthly} / mês
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recorrente */}
            {form.installments <= 1 && (
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-1.5">
                    <RefreshCw size={13} style={{ color: 'var(--text-muted)' }} />
                    Transação recorrente
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Repete todo mês</p>
                </div>
                <button type="button"
                  onClick={() => setForm({ ...form, recurring: !form.recurring })}
                  className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                  style={{ background: form.recurring ? '#22C55E' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                    style={{ left: form.recurring ? '22px' : '2px' }} />
                </button>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2 pb-2">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Check size={15} />
                {isEditing ? 'Salvar' : form.installments > 1 ? `Confirmar ${form.installments}x` : 'Confirmar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
