import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Target, PlusCircle, MinusCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters'
import PageHeader from '../components/PageHeader'

const GOAL_ICONS = ['🛡️', '✈️', '💻', '🏠', '🚗', '📱', '💍', '🎓', '💰', '🏖️', '🎯', '⭐']
const GOAL_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
]

function GoalModal({ isOpen, onClose, goal = null }) {
  const { addGoal, updateGoal } = useFinance()
  const [form, setForm] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '0',
    deadline: goal?.deadline
      ? new Date(goal.deadline).toISOString().split('T')[0]
      : '',
    icon: goal?.icon || '🎯',
    color: goal?.color || '#6366f1',
  })
  const [errors, setErrors] = useState({})
  const isEditing = !!goal

  if (!isOpen) return null

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Informe um nome'
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) newErrors.targetAmount = 'Informe um valor alvo'
    if (!form.deadline) newErrors.deadline = 'Informe um prazo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const data = {
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount.replace(',', '.')),
      currentAmount: parseFloat(form.currentAmount.replace(',', '.')) || 0,
      deadline: new Date(form.deadline + 'T12:00:00').toISOString(),
      icon: form.icon,
      color: form.color,
    }
    if (isEditing) {
      updateGoal(goal.id, data)
    } else {
      addGoal(data)
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
            {isEditing ? 'Editar Meta' : 'Nova Meta'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="label">Nome da Meta</label>
            <input
              type="text"
              placeholder="Ex: Reserva de Emergência"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              maxLength={50}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="label">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${
                    form.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="label">Cor</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    form.color === color ? 'border-gray-800 scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="label">Valor Alvo (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className={`input-field pl-10 text-lg font-bold ${errors.targetAmount ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount}</p>}
          </div>

          {/* Current Amount */}
          <div>
            <label className="label">Valor Atual (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                className="input-field pl-10 text-lg font-bold"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="label">Prazo</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className={`input-field ${errors.deadline ? 'border-red-400' : ''}`}
            />
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Check size={18} />
            {isEditing ? 'Salvar Meta' : 'Criar Meta'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ContributeModal({ isOpen, onClose, goal }) {
  const { updateGoal } = useFinance()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('add')

  if (!isOpen || !goal) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = parseFloat(amount.replace(',', '.'))
    if (!value || value <= 0) return

    const newAmount = type === 'add'
      ? goal.currentAmount + value
      : Math.max(0, goal.currentAmount - value)

    updateGoal(goal.id, { currentAmount: Math.min(newAmount, goal.targetAmount) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl modal-content p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {goal.icon} {goal.name}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setType('add')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'add' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PlusCircle size={16} /> Depositar
          </button>
          <button
            type="button"
            onClick={() => setType('remove')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              type === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <MinusCircle size={16} /> Retirar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-10 text-xl font-bold"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Progresso atual: {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
          <button type="submit" className="btn-primary w-full">
            Confirmar
          </button>
        </form>
      </div>
    </div>
  )
}

function GoalCard({ goal, onEdit }) {
  const { deleteGoal } = useFinance()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [contributeOpen, setContributeOpen] = useState(false)

  const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0
  const isComplete = goal.currentAmount >= goal.targetAmount
  const deadline = new Date(goal.deadline)
  const today = new Date()
  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  const remaining = goal.targetAmount - goal.currentAmount

  const handleDelete = () => {
    if (confirmDelete) deleteGoal(goal.id)
    else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <>
      <div className={`card border-l-4 ${isComplete ? 'border-emerald-500' : 'border-gray-100'}`}
        style={{ borderLeftColor: isComplete ? '#10b981' : goal.color }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: goal.color + '20' }}
            >
              {goal.icon}
            </div>
            <div>
              <p className="font-bold text-gray-800">{goal.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isComplete ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✅ Concluída!
                  </span>
                ) : daysLeft <= 0 ? (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    Prazo expirado
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-colors ${
                confirmDelete ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">{formatCurrency(goal.currentAmount)}</span>
            <span className="text-gray-400">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-bold" style={{ color: goal.color }}>
                {formatPercent(pct)}
              </p>
              <p className="text-xs text-gray-400">concluído</p>
            </div>
            {!isComplete && (
              <div>
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(remaining)}</p>
                <p className="text-xs text-gray-400">faltam</p>
              </div>
            )}
          </div>

          {!isComplete && (
            <button
              onClick={() => setContributeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold transition-all active:scale-95"
              style={{ backgroundColor: goal.color }}
            >
              <PlusCircle size={14} />
              Contribuir
            </button>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">Prazo: {formatDate(goal.deadline)}</p>
          {!isComplete && daysLeft > 0 && (
            <p className="text-xs text-gray-400">
              ~{formatCurrency(remaining / Math.max(daysLeft / 30, 1))}/mês
            </p>
          )}
        </div>
      </div>

      <ContributeModal
        isOpen={contributeOpen}
        onClose={() => setContributeOpen(false)}
        goal={goal}
      />
    </>
  )
}

export default function Goals() {
  const { goals } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount)
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount)
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0)
  const overallPct = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingGoal(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Metas"
        subtitle={`${activeGoals.length} ativa${activeGoals.length !== 1 ? 's' : ''} · ${completedGoals.length} concluída${completedGoals.length !== 1 ? 's' : ''}`}
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
        {/* Overall Progress */}
        {goals.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">Progresso Total</h3>
              <span className="text-primary-600 font-bold text-lg">{formatPercent(overallPct)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
              <div
                className="h-3 rounded-full gradient-main transition-all duration-700"
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Guardado: {formatCurrency(totalCurrent)}</span>
              <span>Meta total: {formatCurrency(totalTarget)}</span>
            </div>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide px-1">
              Metas Ativas
            </h3>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-600 text-sm uppercase tracking-wide px-1">
              Metas Concluídas ✅
            </h3>
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-gray-600 font-semibold text-lg">Nenhuma meta ainda</p>
            <p className="text-gray-400 text-sm mt-1 px-4">
              Defina objetivos financeiros e acompanhe seu progresso
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-5 mx-auto flex items-center gap-2"
            >
              <Target size={16} />
              Criar Primeira Meta
            </button>
          </div>
        )}

        {goals.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full border-2 border-dashed border-primary-200 text-primary-600 rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-sm hover:bg-primary-50 transition-colors"
          >
            <Plus size={18} />
            Nova Meta
          </button>
        )}
      </div>

      <GoalModal isOpen={modalOpen} onClose={handleClose} goal={editingGoal} />
    </div>
  )
}
