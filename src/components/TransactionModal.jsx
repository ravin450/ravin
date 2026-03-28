import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants'
import { useFinance } from '../context/FinanceContext'

const defaultForm = { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] }

export default function TransactionModal({ isOpen, onClose, transaction = null }) {
  const { addTransaction, updateTransaction } = useFinance()
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!transaction

  useEffect(() => {
    if (transaction) {
      setForm({ type: transaction.type, amount: transaction.amount.toString(),
        category: transaction.category, description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0] })
    } else { setForm(defaultForm) }
    setErrors({})
  }, [transaction, isOpen])

  if (!isOpen) return null

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const validate = () => {
    const e = {}
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = 'Valor inválido'
    if (!form.category) e.category = 'Selecione uma categoria'
    if (!form.date) e.date = 'Informe a data'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault(); if (!validate()) return
    const data = { type: form.type, amount: parseFloat(form.amount.replace(',', '.')),
      category: form.category, description: form.description.trim(),
      date: new Date(form.date + 'T12:00:00').toISOString() }
    isEditing ? updateTransaction(transaction.id, data) : addTransaction(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end modal-overlay"
      style={{ paddingBottom: 'max(64px, env(safe-area-inset-bottom) + 64px)' }}
      onClick={onClose}>
      {/* Card: maxHeight no card inteiro, flex-col para header+scroll+footer */}
      <div
        className="w-full max-w-md mx-auto rounded-t-2xl shadow-modal modal-content flex flex-col"
        style={{
          background: '#131720',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">
              {isEditing ? 'Editar' : 'Novo Lançamento'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
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

        {/* Form: rolável com botão no final */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-5 py-4 space-y-4">
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

            <div>
              <label className="label">Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button key={cat.id} type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all duration-150"
                    style={{
                      background: form.category === cat.id ? 'rgba(59,130,246,0.12)' : 'var(--surface-2)',
                      borderColor: form.category === cat.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)',
                    }}>
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: 'var(--text-dim)' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="label">Descrição</label>
              <input type="text" placeholder="Opcional..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" maxLength={100} />
            </div>

            <div>
              <label className="label">Data</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`input-field ${errors.date ? 'border-red-500' : ''}`} />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Botão dentro da área de scroll — sempre acessível */}
            <div className="pt-2 pb-2">
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Check size={15} />
                {isEditing ? 'Salvar' : 'Confirmar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
