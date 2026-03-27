import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowRight, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/formatters'
import TransactionModal from '../components/TransactionModal'
import TransactionItem from '../components/TransactionItem'
import { MONTHS_PT } from '../utils/constants'

function SavingsRing({ rate }) {
  const clamp = Math.min(Math.max(rate, 0), 100)
  const r = 36, cx = 44, cy = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (clamp / 100) * circ
  const color = clamp >= 20 ? '#22C55E' : clamp >= 10 ? '#C9A84C' : '#EF4444'
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
        {clamp.toFixed(0)}%
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fill="#666" fontSize="8" fontWeight="500">
        POUPADO
      </text>
    </svg>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}
      className="p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1.5" style={{ color: 'var(--text-dim)' }}>{label}</p>
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

      {/* ── Header ─── */}
      <div className="px-5 pt-12 pb-5" style={{ background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1px solid rgba(201,168,76,0.25)' }}>
              <img src="/favicon.svg" alt="TerraRica" className="w-10 h-10" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-none mb-0.5">{greeting},</p>
              <p className="text-white font-bold text-base leading-none">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }} className="text-xs">{monthName} {now.getFullYear()}</span>
            <button onClick={handleLogout} style={{ color: '#333' }} className="hover:text-white transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Balance + Ring */}
        <div className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Saldo Total
            </p>
            <p className={`text-4xl font-bold tracking-tight ${stats.totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(stats.totalBalance)}
            </p>
            <div className="gold-bar mt-2" style={{ width: 40 }} />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{monthName} {now.getFullYear()}</p>
          </div>
          <SavingsRing rate={stats.savingsRate} />
        </div>
      </div>

      {/* ── Stats Cards ─── */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Receitas</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <TrendingUp size={14} color="#22C55E" />
              </div>
            </div>
            <p className="text-white text-xl font-bold">{formatCurrencyCompact(stats.monthlyIncome)}</p>
            <p style={{ color: 'var(--income)' }} className="text-xs mt-0.5 font-medium">↑ {monthName}</p>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold uppercase tracking-wide">Despesas</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <TrendingDown size={14} color="#EF4444" />
              </div>
            </div>
            <p className="text-white text-xl font-bold">{formatCurrencyCompact(stats.monthlyExpenses)}</p>
            <p style={{ color: 'var(--expense)' }} className="text-xs mt-0.5 font-medium">↓ {monthName}</p>
          </div>
        </div>
      </div>

      {/* ── Add Button ─── */}
      <div className="px-4 mt-4">
        <button onClick={() => setModalOpen(true)}
          className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2.5 font-bold text-sm active:scale-[0.98] transition-transform tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #8A6820)',
            color: '#0A0A0A',
            boxShadow: '0 4px 20px rgba(201,168,76,0.25)'
          }}>
          <div className="w-5 h-5 rounded bg-black/20 flex items-center justify-center">
            <Plus size={13} />
          </div>
          Novo Lançamento
        </button>
      </div>

      {/* ── Chart ─── */}
      <div className="px-4 mt-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-sm">Evolução Financeira</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Últimos 6 meses</p>
              <div className="gold-bar mt-1.5" style={{ width: 24 }} />
            </div>
            <Link to="/relatorios" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--gold)' }}>
              Relatórios <ArrowRight size={11} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={monthlyChartData} barSize={9} barGap={3} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#444', fontWeight: 500 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="receitas" radius={[4, 4, 0, 0]}>
                {monthlyChartData.map((_, i) => (
                  <Cell key={i} fill={`rgba(34,197,94,${0.5 + (i / monthlyChartData.length) * 0.5})`} />
                ))}
              </Bar>
              <Bar dataKey="despesas" radius={[4, 4, 0, 0]}>
                {monthlyChartData.map((_, i) => (
                  <Cell key={i} fill={`rgba(239,68,68,${0.5 + (i / monthlyChartData.length) * 0.5})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#22C55E' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#EF4444' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Despesas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent ─── */}
      <div className="px-4 mt-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-white text-sm">Lançamentos Recentes</h2>
            <div className="gold-bar mt-1" style={{ width: 20 }} />
          </div>
          <Link to="/transacoes" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--gold)' }}>
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card text-center py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--surface-2)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <Plus size={20} style={{ color: 'var(--gold)' }} />
            </div>
            <p className="text-white text-sm font-medium">Nenhum lançamento</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Adicione sua primeira transação</p>
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
