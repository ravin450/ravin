import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import { formatCurrency, formatPercent } from '../utils/formatters'
import PageHeader from '../components/PageHeader'
import CategoryIcon from '../components/CategoryIcon'

function BudgetModal({ isOpen, onClose, budget = null }) {
  const { addBudget, updateBudget, budgets } = useFinance()
  const [form, setForm] = useState({ category: budget?.category || '', limit: budget?.limit?.toString() || '' })
  const [errors, setErrors] = useState({})
  const isEditing = !!budget

  const usedCategories = budgets.filter((b) => !budget || b.id !== budget.id).map((b) => b.category)
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !usedCategories.includes(c.id))

  if (!isOpen) return null

  const validate = () => {
    const e = {}
    if (!form.category) e.category = 'Selecione uma categoria'
    if (!form.limit || parseFloat(form.limit) <= 0) e.limit = 'Informe um limite válido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = { category: form.category, limit: parseFloat(form.limit.replace(',', '.')), period: 'monthly' }
    isEditing ? updateBudget(budget.id, data) : addBudget(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end modal-overlay" onClick={onClose}>
      <div className="w-full max-w-md mx-auto rounded-t-3xl shadow-2xl modal-content"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.15)', borderBottom: 'none' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="px-5 pt-6 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>
            <div className="gold-bar mt-1.5" style={{ width: 32 }} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="label">Categoria</label>
            {isEditing ? (
              <div className="input-field flex items-center gap-2 opacity-70 cursor-not-allowed">
                <CategoryIcon categoryId={form.category} size="sm" />
                {EXPENSE_CATEGORIES.find((c) => c.id === form.category)?.label}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableCategories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all"
                    style={{
                      borderColor: form.category === cat.id ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                      background: form.category === cat.id ? 'rgba(201,168,76,0.08)' : 'var(--surface-2)'
                    }}>
                    <CategoryIcon categoryId={cat.id} size="sm" />
                    <span className="text-[10px] font-medium text-center leading-tight"
                      style={{ color: form.category === cat.id ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="label">Limite Mensal (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: 'var(--gold)' }}>R$</span>
              <input type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00"
                value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })}
                className={`input-field pl-10 text-lg font-bold ${errors.limit ? 'border-red-400' : ''}`} />
            </div>
            {errors.limit && <p className="text-red-400 text-xs mt-1">{errors.limit}</p>}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 font-bold tracking-wide">
            <Check size={18} />
            {isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}
          </button>
        </form>
      </div>
    </div>
  )
}

function BudgetCard({ budget, onEdit }) {
  const { deleteBudget } = useFinance()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === budget.category)

  const pct = Math.min(budget.percentage, 100)
  const barColor = budget.isOver ? '#EF4444' : budget.percentage >= 80 ? '#F59E0B' : '#C9A84C'
  const glowColor = budget.isOver ? 'rgba(239,68,68,0.3)' : budget.percentage >= 80 ? 'rgba(245,158,11,0.3)' : 'rgba(201,168,76,0.3)'

  const handleDelete = () => {
    if (confirmDelete) deleteBudget(budget.id)
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div className="card" style={{ borderColor: budget.isOver ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <CategoryIcon categoryId={budget.category} size="lg" />
          <div>
            <p className="font-semibold text-white">{cat?.label || budget.category}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Limite: {formatCurrency(budget.limit)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(budget)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
            <Pencil size={13} />
          </button>
          <button onClick={handleDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: confirmDelete ? '#DC2626' : 'rgba(239,68,68,0.08)',
              color: confirmDelete ? '#fff' : '#EF4444'
            }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium" style={{ color: barColor }}>
            {formatPercent(budget.percentage)} utilizado
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
          </span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${glowColor}` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: budget.isOver ? 'rgba(239,68,68,0.1)' : budget.percentage >= 80 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
            color: budget.isOver ? '#EF4444' : budget.percentage >= 80 ? '#F59E0B' : '#22C55E'
          }}>
          {budget.isOver ? `${formatCurrency(Math.abs(budget.remaining))} acima` : `${formatCurrency(budget.remaining)} restante`}
        </span>
        {budget.isOver && <AlertCircle size={14} color="#EF4444" />}
      </div>
    </div>
  )
}

export default function Budget() {
  const { budgetSpending } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const totalLimit = budgetSpending.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgetSpending.reduce((s, b) => s + b.spent, 0)
  const totalPct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  const overCount = budgetSpending.filter((b) => b.isOver).length

  const handleEdit = (b) => { setEditingBudget(b); setModalOpen(true) }
  const handleClose = () => { setModalOpen(false); setEditingBudget(null) }

  return (
    <div className="min-h-screen bg-page">
      <PageHeader title="Orçamento" subtitle="Controle seus gastos mensais"
        action={
          <button onClick={() => setModalOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Overview */}
        <div className="card">
          <h3 className="font-bold text-white mb-0.5">Visão Geral</h3>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total de todos os orçamentos</p>
          <div className="gold-bar mb-4" style={{ width: 24 }} />

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
              {formatCurrency(totalSpent)} de {formatCurrency(totalLimit)}
            </span>
            <span className="text-sm font-bold"
              style={{ color: totalPct > 100 ? '#EF4444' : totalPct >= 80 ? '#F59E0B' : '#22C55E' }}>
              {formatPercent(totalPct)}
            </span>
          </div>

          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(totalPct, 100)}%`,
                background: totalPct > 100 ? '#EF4444' : totalPct >= 80 ? '#F59E0B' : 'linear-gradient(90deg, #C9A84C, #E2C472)',
                boxShadow: `0 0 10px ${totalPct > 100 ? 'rgba(239,68,68,0.4)' : 'rgba(201,168,76,0.35)'}`
              }} />
          </div>

          {overCount > 0 && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle size={12} color="#EF4444" />
              <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                {overCount} categoria{overCount > 1 ? 's' : ''} acima do orçamento
              </p>
            </div>
          )}
        </div>

        {/* Cards */}
        {budgetSpending.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-white font-semibold">Nenhum orçamento definido</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crie orçamentos para controlar seus gastos</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 mx-auto flex items-center gap-2">
              <Plus size={16} /> Criar Orçamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {budgetSpending.map((b) => <BudgetCard key={b.id} budget={b} onEdit={handleEdit} />)}
          </div>
        )}

        {budgetSpending.length > 0 && (
          <button onClick={() => setModalOpen(true)}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
            style={{
              border: '1.5px dashed rgba(201,168,76,0.3)',
              color: 'var(--gold)',
              background: 'rgba(201,168,76,0.04)'
            }}>
            <Plus size={18} /> Novo Orçamento
          </button>
        )}
      </div>

      <BudgetModal isOpen={modalOpen} onClose={handleClose} budget={editingBudget} />
    </div>
  )
}
