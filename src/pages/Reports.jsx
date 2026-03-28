import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Download } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ALL_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/formatters'
import PageHeader from '../components/PageHeader'
import CategoryIcon from '../components/CategoryIcon'

const CHART_COLORS = ['#C9A84C','#E2C472','#A87C2A','#D4A843','#F0D080','#8A6820','#BF9A40','#E8C060','#9A7030','#D0B050']

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}
      className="p-3 text-xs shadow-xl min-w-[140px]">
      <p className="font-semibold mb-2" style={{ color: '#888' }}>{label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex justify-between gap-3">
          <span style={{ color: e.color }} className="font-medium">
            {e.name === 'receitas' ? 'Receitas' : e.name === 'despesas' ? 'Despesas' : e.name === 'economia' ? 'Economia' : e.name}:
          </span>
          <span className="font-bold text-white">{formatCurrencyCompact(e.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}
      className="p-3 text-xs shadow-xl">
      <p className="font-bold text-white">{payload[0].name}</p>
      <p style={{ color: 'var(--gold)' }}>{formatCurrency(payload[0].value)}</p>
      <p style={{ color: '#666' }}>{formatPercent(payload[0].payload.percent * 100)}</p>
    </div>
  )
}

function ChangeTag({ value }) {
  if (value === null || !isFinite(value)) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
  const positive = value <= 0
  const color = positive ? '#22C55E' : '#EF4444'
  const sign = value > 0 ? '+' : ''
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color }}>
      {sign}{value.toFixed(0)}%
    </span>
  )
}

export default function Reports() {
  const { monthlyChartData, categoryBreakdown, stats, transactions } = useFinance()
  const [activeChart, setActiveChart] = useState('bar')

  const pieData = categoryBreakdown
    .map(({ category, amount }) => {
      const cat = ALL_CATEGORIES.find((c) => c.id === category)
      return { name: cat?.label || category, value: amount, color: cat?.color || '#666', categoryId: category }
    })
    .sort((a, b) => b.value - a.value)

  const total = pieData.reduce((s, d) => s + d.value, 0)

  const savingsData = monthlyChartData.map((d) => ({
    name: d.name,
    economia: Math.max(0, d.receitas - d.despesas),
    taxa: d.receitas > 0 ? Math.max(0, ((d.receitas - d.despesas) / d.receitas) * 100) : 0,
  }))

  // ── Dados para comparativo mês a mês ──
  const curr = monthlyChartData[5] || { receitas: 0, despesas: 0 }
  const prev = monthlyChartData[4] || { receitas: 0, despesas: 0 }
  const incomeChange = prev.receitas > 0 ? ((curr.receitas - prev.receitas) / prev.receitas) * 100 : null
  const expenseChange = prev.despesas > 0 ? ((curr.despesas - prev.despesas) / prev.despesas) * 100 : null
  const currSavings = curr.receitas > 0 ? Math.max(0, ((curr.receitas - curr.despesas) / curr.receitas) * 100) : 0
  const prevSavings = prev.receitas > 0 ? Math.max(0, ((prev.receitas - prev.despesas) / prev.receitas) * 100) : 0
  const savingsChange = prevSavings > 0 ? ((currSavings - prevSavings) / prevSavings) * 100 : null

  // Comparativo por categoria entre meses
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const categoryCompare = EXPENSE_CATEGORIES.map(cat => {
    const currAmt = transactions
      .filter(t => t.type === 'expense' && t.category === cat.id &&
        new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((s, t) => s + t.amount, 0)
    const prevAmt = transactions
      .filter(t => t.type === 'expense' && t.category === cat.id &&
        new Date(t.date).getMonth() === prevMonth.getMonth() && new Date(t.date).getFullYear() === prevMonth.getFullYear())
      .reduce((s, t) => s + t.amount, 0)
    return { ...cat, currAmt, prevAmt }
  }).filter(c => c.currAmt > 0 || c.prevAmt > 0)

  // ── CSV Export ──
  const exportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Necessidade', 'Recorrente', 'Adicionado por']
    const rows = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(t => {
        const cat = ALL_CATEGORIES.find(c => c.id === t.category)
        return [
          new Date(t.date).toLocaleDateString('pt-BR'),
          t.type === 'income' ? 'Receita' : 'Despesa',
          cat?.label || t.category || '',
          t.description || '',
          t.amount.toFixed(2).replace('.', ','),
          t.necessity === 'want' ? 'Desejo' : t.necessity === 'need' ? 'Necessidade' : '',
          t.recurring ? 'Sim' : 'Não',
          t.addedBy || '',
        ]
      })
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cultivei-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'bar', label: 'Mensal' },
    { id: 'pie', label: 'Categorias' },
    { id: 'savings', label: 'Economia' },
    { id: 'compare', label: 'Comparativo' },
  ]

  return (
    <div className="min-h-screen bg-page">
      <PageHeader title="Relatórios" subtitle="Análise das suas finanças" />

      <div className="px-4 pt-4 pb-6 space-y-4">

        {/* Summary Cards + Export */}
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-3 gap-2">
            {[
              { label: 'Receitas', value: formatCurrencyCompact(stats.monthlyIncome), color: '#22C55E' },
              { label: 'Despesas', value: formatCurrencyCompact(stats.monthlyExpenses), color: '#EF4444' },
              { label: 'Poupança', value: formatPercent(stats.savingsRate), color: 'var(--gold)' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center"
                style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <button onClick={exportCSV}
            className="w-12 h-full min-h-[60px] rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0 active:scale-95 transition-transform"
            style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}
            title="Exportar CSV">
            <Download size={16} style={{ color: 'var(--gold)' }} />
            <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>CSV</span>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveChart(tab.id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: activeChart === tab.id ? 'linear-gradient(135deg, #C9A84C, #8A6820)' : 'transparent',
                color: activeChart === tab.id ? '#0A0A0A' : 'var(--text-muted)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        {activeChart === 'bar' && (
          <div className="card">
            <h3 className="font-bold text-white mb-0.5">Receitas vs Despesas</h3>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Últimos 6 meses</p>
            <div className="gold-bar mb-4" style={{ width: 28 }} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} barSize={13} barGap={3}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#555' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }}
                  tickFormatter={(v) => formatCurrencyCompact(v)} width={52} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="receitas" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="despesas" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 mt-2 pt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#22C55E' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#EF4444' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Despesas</span>
              </div>
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {activeChart === 'pie' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-white mb-0.5">Despesas por Categoria</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Mês atual</p>
              <div className="gold-bar mb-4" style={{ width: 28 }} />
              {pieData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma despesa este mês</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={92}
                        paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-6 mb-4">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(total)}</p>
                  </div>
                </>
              )}
            </div>
            {pieData.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-white mb-3">Detalhamento</h3>
                <div className="space-y-4">
                  {pieData.map((item, i) => {
                    const pct = total > 0 ? (item.value / total) * 100 : 0
                    const barColor = CHART_COLORS[i % CHART_COLORS.length]
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <CategoryIcon categoryId={item.categoryId} size="sm" />
                            <span className="text-sm font-medium text-white">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-white">{formatCurrency(item.value)}</span>
                            <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>{formatPercent(pct)}</span>
                          </div>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}60` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Savings Line */}
        {activeChart === 'savings' && (
          <div className="card">
            <h3 className="font-bold text-white mb-0.5">Economia Mensal</h3>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Valor poupado por mês</p>
            <div className="gold-bar mb-4" style={{ width: 28 }} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={savingsData}>
                <defs>
                  <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#555' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }}
                  tickFormatter={(v) => formatCurrencyCompact(v)} width={52} />
                <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.3)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="economia" stroke="#C9A84C" strokeWidth={2.5}
                  fill="url(#savGrad)" dot={{ fill: '#C9A84C', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#E2C472' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Análise</p>
              {stats.savingsRate < 10 && (
                <div className="rounded-xl p-3 flex gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <span>⚠️</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#EF4444' }}>Taxa de poupança baixa</p>
                    <p className="text-xs mt-0.5" style={{ color: '#EF444488' }}>Tente poupar pelo menos 10–20% da renda mensal</p>
                  </div>
                </div>
              )}
              {stats.savingsRate >= 10 && stats.savingsRate < 20 && (
                <div className="rounded-xl p-3 flex gap-2"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <span>💡</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Bom progresso!</p>
                    <p className="text-xs mt-0.5" style={{ color: '#C9A84C88' }}>Poupando {formatPercent(stats.savingsRate)}. A meta ideal é 20%</p>
                  </div>
                </div>
              )}
              {stats.savingsRate >= 20 && (
                <div className="rounded-xl p-3 flex gap-2"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <span>🏆</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#22C55E' }}>Excelente desempenho!</p>
                    <p className="text-xs mt-0.5" style={{ color: '#22C55E88' }}>Você está poupando {formatPercent(stats.savingsRate)} da renda!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparativo mês a mês */}
        {activeChart === 'compare' && (
          <div className="space-y-4">
            {/* Resumo do mês */}
            <div className="card">
              <h3 className="font-bold text-white mb-0.5">Mês Atual vs Anterior</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                {monthlyChartData[5]?.name} vs {monthlyChartData[4]?.name}
              </p>
              <div className="gold-bar mb-4" style={{ width: 28 }} />

              <div className="space-y-3">
                {[
                  {
                    label: 'Receitas', icon: '↑',
                    curr: curr.receitas, prev: prev.receitas,
                    change: incomeChange, positiveIsGood: true,
                    color: '#22C55E',
                  },
                  {
                    label: 'Despesas', icon: '↓',
                    curr: curr.despesas, prev: prev.despesas,
                    change: expenseChange, positiveIsGood: false,
                    color: '#EF4444',
                  },
                  {
                    label: 'Taxa de Poupança', icon: '💰',
                    curr: currSavings, prev: prevSavings,
                    change: savingsChange, positiveIsGood: true,
                    isSavings: true,
                    color: 'var(--gold)',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-3"
                    style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
                      </div>
                      <ChangeTag value={item.change} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mês atual</p>
                        <p className="text-base font-bold" style={{ color: item.color }}>
                          {item.isSavings ? formatPercent(item.curr) : formatCurrency(item.curr)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mês anterior</p>
                        <p className="text-sm font-medium text-white">
                          {item.isSavings ? formatPercent(item.prev) : formatCurrency(item.prev)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparativo por categoria */}
            {categoryCompare.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-white mb-0.5">Despesas por Categoria</h3>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Comparativo mensal</p>
                <div className="gold-bar mb-4" style={{ width: 28 }} />
                <div className="space-y-3">
                  {categoryCompare.sort((a, b) => b.currAmt - a.currAmt).map((cat) => {
                    const change = cat.prevAmt > 0 ? ((cat.currAmt - cat.prevAmt) / cat.prevAmt) * 100 : null
                    const maxAmt = Math.max(cat.currAmt, cat.prevAmt, 1)
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <CategoryIcon categoryId={cat.id} size="sm" />
                            <span className="text-xs font-medium text-white">{cat.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{formatCurrencyCompact(cat.currAmt)}</span>
                            <ChangeTag value={change} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-12 text-right" style={{ color: 'var(--text-muted)' }}>atual</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${(cat.currAmt / maxAmt) * 100}%`, background: '#C9A84C' }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] w-12 text-right" style={{ color: 'var(--text-muted)' }}>anterior</span>
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${(cat.prevAmt / maxAmt) * 100}%`, background: 'rgba(201,168,76,0.35)' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
