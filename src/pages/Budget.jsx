import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import { formatCurrency, formatPercent } from '../utils/formatters'
import PageHeader from '../components/PageHeader'

function BudgetModal({ isOpen, onClose, budget = null }) {
  const { addBudget, updateBudget, budgets } = useFinance()
  const [form, setForm] = useState({
    category: budget?.category || '',
    limit: budget?.limit?.toString() || '',
  })
  const [errors, setErrors] = useState({})

  const isEditing = !!budget

  const usedCategories = budgets
    .filter((b) => !budget || b.id !== budget.id)
    .map((b) => b.category)

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !usedCategories.includes(c.id)
  )

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!form.category) newErrors.category = 'Selecione uma categoria'
    if (!form.limit || parseFloat(form.limit) <= 0) newErrors.limit = 'Informe um limite válido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = {
      category: form.category,
      limit: parseFloat(form.limit.replace(',', '.')),
      period: 'monthly',
    }
    if (isEditing) {
      updateBudget(budget.id, data)
    } else {
      addBudget(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-main px-5 pt-6 pb-5 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="label">Categoria</label>
            {isEditing ? (
              <div className="input-field flex items-center gap-2 cursor-not-allowed opacity-70">
                {EXPENSE_CATEGORIES.find((c) => c.id === form.category)?.icon}{' '}
                {EXPENSE_CATEGORIES.find((c) => c.id === form.category)?.label}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      form.category === cat.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            {availableCategories.length === 0 && !isEditing && (
              <p className="text-gray-500 text-xs mt-2 text-center">Todas as categorias já possuem orçamento</p>
            )}
          </div>

          <div>
            <label className="label">Limite Mensal (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                className={`input-field pl-10 text-lg font-bold ${errors.limit ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.limit && <p className="text-red-500 text-xs mt-1">{errors.limit}</p>}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Check size={18} />
            {isEditing ? 'Salvar' : 'Criar Orçamento'}
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

  const getBarColor = () => {
    if (budget.isOver) return 'bg-red-500'
    if (budget.percentage >= 80) return 'bg-yellow-500'
    return 'bg-primary-500'
  }

  const getStatusColor = () => {
    if (budget.isOver) return 'text-red-600 bg-red-50'
    if (budget.percentage >= 80) return 'text-yellow-700 bg-yellow-50'
    return 'text-emerald-700 bg-emerald-50'
  }

  const handleDelete = () => {
    if (confirmDelete) {
      deleteBudget(budget.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
          >
            {cat?.icon || '📦'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{cat?.label || budget.category}</p>
            <p className="text-xs text-gray-400">Limite: {formatCurrency(budget.limit)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {budget.isOver && <AlertCircle size={12} className="text-red-500" />}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor()}`}>
            {budget.isOver
              ? `${formatCurrency(Math.abs(budget.remaining))} acima`
              : `${formatCurrency(budget.remaining)} restante`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-700">{formatCurrency(budget.spent)}</span>
          <span className="text-xs text-gray-400"> / {formatCurrency(budget.limit)}</span>
        </div>
      </div>

      {budget.percentage >= 80 && !budget.isOver && (
        <div className="mt-2 flex items-center gap-1.5 text-yellow-600 bg-yellow-50 rounded-lg px-2.5 py-1.5">
          <AlertCircle size={12} />
          <p className="text-xs font-medium">Atenção: {formatPercent(budget.percentage)} utilizado</p>
        </div>
      )}
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
  const overBudgetCount = budgetSpending.filter((b) => b.isOver).length

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingBudget(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Orçamento"
        subtitle="Controle seus gastos mensais"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4 -mt-3 pb-6 space-y-4">
        {/* Overview Card */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-1">Visão Geral do Mês</h3>
          <p className="text-xs text-gray-400 mb-3">Total de todos os orçamentos</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {formatCurrency(totalSpent)} de {formatCurrency(totalLimit)}
            </span>
            <span className={`text-sm font-bold ${totalPct > 100 ? 'text-red-600' : totalPct >= 80 ? 'text-yellow-600' : 'text-emerald-600'}`}>
              {formatPercent(totalPct)}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                totalPct > 100 ? 'bg-red-500' : totalPct >= 80 ? 'bg-yellow-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(totalPct, 100)}%` }}
            />
          </div>
          {overBudgetCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
              <AlertCircle size={12} />
              <p className="text-xs font-medium">
                {overBudgetCount} categoria{overBudgetCount > 1 ? 's' : ''} acima do orçamento
              </p>
            </div>
          )}
        </div>

        {/* Budget Cards */}
        {budgetSpending.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-600 font-semibold">Nenhum orçamento definido</p>
            <p className="text-gray-400 text-sm mt-1">Crie orçamentos para controlar seus gastos</p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-4 mx-auto flex items-center gap-2"
            >
              <Plus size={16} />
              Criar Orçamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {budgetSpending.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {budgetSpending.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full border-2 border-dashed border-primary-200 text-primary-600 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-primary-50 transition-colors"
          >
            <Plus size={18} />
            Novo Orçamento
          </button>
        )}
      </div>

      <BudgetModal isOpen={modalOpen} onClose={handleClose} budget={editingBudget} />
    </div>
  )
}
