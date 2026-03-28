import React, { useState } from 'react'
import { CreditCard, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatCurrencyCompact } from '../utils/formatters'
import PageHeader from '../components/PageHeader'
import CategoryIcon from '../components/CategoryIcon'

export default function Installments() {
  const { installmentGroups, deleteInstallmentGroup, allCategories } = useFinance()
  const [confirmId, setConfirmId] = useState(null)

  const active    = installmentGroups.filter(g => g.isActive)
  const completed = installmentGroups.filter(g => !g.isActive)

  const totalMonthly = active.reduce((s, g) => s + g.monthlyAmount, 0)

  const handleDelete = (id) => {
    if (confirmId === id) { deleteInstallmentGroup(id); setConfirmId(null) }
    else { setConfirmId(id); setTimeout(() => setConfirmId(null), 3000) }
  }

  const GroupCard = ({ group }) => {
    const cat = allCategories.find(c => c.id === group.category)
    const pct = (group.paid / group.installmentTotal) * 100
    const barColor = group.isActive ? '#C9A84C' : '#22C55E'

    return (
      <div className="card" style={{ borderColor: group.isActive ? 'rgba(255,255,255,0.06)' : 'rgba(34,197,94,0.15)' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <CategoryIcon categoryId={group.category} categoryMeta={cat} size="lg" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#131720', border: '1px solid rgba(201,168,76,0.3)' }}>
              <CreditCard size={10} color="#C9A84C" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate leading-tight">
              {group.description?.replace(/ \(\d+\/\d+\)$/, '') || cat?.label || 'Parcelamento'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {cat?.label} · {group.installmentTotal}x de {formatCurrency(group.monthlyAmount)}
            </p>
          </div>
          <button onClick={() => handleDelete(group.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{
              background: confirmId === group.id ? '#DC2626' : 'rgba(239,68,68,0.08)',
              color: confirmId === group.id ? '#fff' : '#EF4444',
            }}>
            <Trash2 size={13} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {group.isActive
                ? <Clock size={11} color="#C9A84C" />
                : <CheckCircle2 size={11} color="#22C55E" />}
              <span className="text-xs font-semibold" style={{ color: barColor }}>
                {group.paid}/{group.installmentTotal} pagas
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {group.remaining > 0 ? `${group.remaining} restante${group.remaining > 1 ? 's' : ''}` : 'Quitado'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}40` }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
            <p className="text-sm font-bold text-white">{formatCurrency(group.totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pendente</p>
            <p className="text-sm font-bold" style={{ color: group.isActive ? '#C9A84C' : '#22C55E' }}>
              {formatCurrency(group.monthlyAmount * group.remaining)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <PageHeader title="Parcelamentos" subtitle="Compras parceladas em andamento" />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Resumo */}
        {active.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                  Compromisso Mensal
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                  {formatCurrency(totalMonthly)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {active.length} parcelamento{active.length > 1 ? 's' : ''} ativo{active.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <CreditCard size={24} color="var(--gold)" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        {/* Ativos */}
        {active.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock size={14} color="#C9A84C" />
              Em andamento
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}>
                {active.length}
              </span>
            </h3>
            <div className="space-y-3">
              {active.map(g => <GroupCard key={g.id} group={g} />)}
            </div>
          </div>
        )}

        {/* Concluídos */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} color="#22C55E" />
              Concluídos
            </h3>
            <div className="space-y-3">
              {completed.map(g => <GroupCard key={g.id} group={g} />)}
            </div>
          </div>
        )}

        {/* Vazio */}
        {installmentGroups.length === 0 && (
          <div className="card text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <CreditCard size={24} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <p className="text-white text-sm font-semibold">Nenhum parcelamento</p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Ao lançar uma despesa parcelada,<br />ela aparece aqui para acompanhamento
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
