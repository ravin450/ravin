import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowRight, LogOut, ChevronUp, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/formatters'
import TransactionModal from '../components/TransactionModal'
import TransactionItem from '../components/TransactionItem'
import { MONTHS_PT } from '../utils/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
      className="p-3 text-xs shadow-card-md">
      <p className="font-semibold text-dim mb-1.5">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="font-medium" style={{ color: e.color }}>
          {e.name === 'receitas' ? '↑ Receitas' : '↓ Despesas'}: {formatCurrencyCompact(e.value)}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { stats, monthlyChartData, transactions } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const now = new Date()
  const monthName = MONTHS_PT[now.getMonth()]
  const userName = localStorage.getItem('finance_user_name') || 'Usuário'
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const handleLogout = () => { localStorage.removeItem('finance_user_name'); window.location.href = '/boas-vindas' }
  const handleEdit = (t) => { setEditingTransaction(t); setModalOpen(true) }
  const handleClose = () => { setModalOpen(false); setEditingTransaction(null) }

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="min-h-screen bg-page">

      {/* ── Header ─────────────────────────────── */}
      <div className="px-5 pt-12 pb-6" style={{ background: '#0C0E14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ background: '#131720', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src="/favicon.svg" alt="App" className="w-10 h-10" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-none mb-0.5">{greeting},</p>
              <p className="text-white font-bold text-base leading-none">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }} className="text-xs">{monthName} {now.getFullYear()}</span>
            <button onClick={handleLogout} style={{ color: 'var(--text-muted)' }} className="hover:text-white transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} className="p-4">
          <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-widest mb-2">Saldo Total</p>
          <p className={`text-4xl font-bold tracking-tight mb-2 ${stats.totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(stats.totalBalance)}
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md"
              style={{
                background: stats.savingsRate >= 20 ? 'rgba(16,185,129,0.12)' : stats.savingsRate >= 10 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                color: stats.savingsRate >= 20 ? '#10B981' : stats.savingsRate >= 10 ? '#FBBF24' : '#F87171'
              }}>
              {stats.totalBalance >= 0 ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
              {formatPercent(stats.savingsRate)} poupado
            </span>
            <span style={{ color: 'var(--text-muted)' }} className="text-xs">este mês</span>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────── */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Receitas</p>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <TrendingUp size={13} color="#10B981" />
              </div>
            </div>
            <p className="text-white text-xl font-bold">{formatCurrencyCompact(stats.monthlyIncome)}</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">{monthName}</p>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Despesas</p>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.15)' }}>
                <TrendingDown size={13} color="#F87171" />
              </div>
            </div>
            <p className="text-white text-xl font-bold">{formatCurrencyCompact(stats.monthlyExpenses)}</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">{monthName}</p>
          </div>
        </div>
      </div>

      {/* ── Add Button ─────────────────────────── */}
      <div className="px-4 mt-4">
        <button onClick={() => setModalOpen(true)}
          className="w-full text-white rounded-xl py-3.5 flex items-center justify-center gap-2.5 font-semibold text-sm active:scale-98 transition-transform"
          style={{ background: 'var(--blue)' }}>
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <Plus size={13} />
          </div>
          Novo Lançamento
        </button>
      </div>

      {/* ── Chart ──────────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-sm">Evolução</h2>
              <p className="text-muted text-xs">Últimos 6 meses</p>
            </div>
            <Link to="/relatorios" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
              Ver mais <ArrowRight size={11} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={monthlyChartData} barSize={8} barGap={3} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="receitas" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesas" fill="#F87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-emerald-500" />
              <span className="text-xs text-muted">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#F87171' }} />
              <span className="text-xs text-muted">Despesas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent ─────────────────────────────── */}
      <div className="px-4 mt-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-sm">Recentes</h2>
          <Link to="/transacoes" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card text-center py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--surface-2)' }}>
              <Plus size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-white text-sm font-medium">Nenhum lançamento</p>
            <p className="text-muted text-xs mt-1">Adicione sua primeira transação</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((t) => <TransactionItem key={t.id} transaction={t} onEdit={handleEdit} />)}
          </div>
        )}
      </div>

      <TransactionModal isOpen={modalOpen} onClose={handleClose} transaction={editingTransaction} />
    </div>
  )
}
