import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { useFinance } from '../context/FinanceContext'
import { ALL_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants'
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/formatters'
import PageHeader from '../components/PageHeader'

const COLORS = [
  '#6366f1', '#f97316', '#3b82f6', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#6b7280'
]

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 text-xs min-w-[140px]">
        <p className="font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between gap-3">
            <span style={{ color: entry.color }} className="font-medium capitalize">
              {entry.name === 'receitas' ? 'Receitas' : entry.name === 'despesas' ? 'Despesas' : 'Saldo'}:
            </span>
            <span className="font-bold text-gray-800">{formatCurrencyCompact(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 text-xs">
        <p className="font-bold text-gray-700">{payload[0].name}</p>
        <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        <p className="text-gray-400">{formatPercent(payload[0].payload.percent * 100)}</p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
    {payload.map((entry, index) => (
      <div key={index} className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-gray-600">{entry.value}</span>
      </div>
    ))}
  </div>
)

export default function Reports() {
  const { monthlyChartData, categoryBreakdown, stats, transactions } = useFinance()
  const [activeChart, setActiveChart] = useState('bar')

  const pieData = categoryBreakdown
    .map(({ category, amount }) => {
      const cat = ALL_CATEGORIES.find((c) => c.id === category)
      return {
        name: cat?.label || category,
        value: amount,
        color: cat?.color || '#6b7280',
        icon: cat?.icon || '📦',
      }
    })
    .sort((a, b) => b.value - a.value)

  const total = pieData.reduce((s, d) => s + d.value, 0)

  const savingsData = monthlyChartData.map((d) => ({
    name: d.name,
    economia: Math.max(0, d.receitas - d.despesas),
    taxa: d.receitas > 0 ? Math.max(0, ((d.receitas - d.despesas) / d.receitas) * 100) : 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Relatórios"
        subtitle="Análise das suas finanças"
      />

      <div className="px-4 -mt-3 pb-6 space-y-4">
        {/* Summary Cards Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center p-3">
            <p className="text-xs text-gray-500 mb-1">Receitas</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrencyCompact(stats.monthlyIncome)}</p>
          </div>
          <div className="card text-center p-3">
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className="text-sm font-bold text-red-500">{formatCurrencyCompact(stats.monthlyExpenses)}</p>
          </div>
          <div className="card text-center p-3">
            <p className="text-xs text-gray-500 mb-1">Poupança</p>
            <p className="text-sm font-bold text-primary-600">{formatPercent(stats.savingsRate)}</p>
          </div>
        </div>

        {/* Chart Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[
            { id: 'bar', label: 'Mensal' },
            { id: 'pie', label: 'Categorias' },
            { id: 'savings', label: 'Economia' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeChart === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bar Chart: Monthly */}
        {activeChart === 'bar' && (
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-1">Receitas vs Despesas</h3>
            <p className="text-xs text-gray-400 mb-4">Comparação dos últimos 6 meses</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} barSize={12} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  width={55}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="receitas" />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="despesas" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-gray-500">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-xs text-gray-500">Despesas</span>
              </div>
            </div>
          </div>
        )}

        {/* Pie Chart: Categories */}
        {activeChart === 'pie' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-gray-800 mb-1">Despesas por Categoria</h3>
              <p className="text-xs text-gray-400 mb-3">Mês atual</p>

              {pieData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-gray-500 text-sm">Nenhuma despesa este mês</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-4 mb-4">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(total)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Category breakdown list */}
            {pieData.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-3">Detalhamento</h3>
                <div className="space-y-3">
                  {pieData.map((item) => {
                    const pct = total > 0 ? (item.value / total) * 100 : 0
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-800">{formatCurrency(item.value)}</span>
                            <span className="text-xs text-gray-400 ml-1.5">{formatPercent(pct)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Line Chart: Savings */}
        {activeChart === 'savings' && (
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-1">Economia Mensal</h3>
            <p className="text-xs text-gray-400 mb-4">Valor poupado por mês</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  width={55}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'economia' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                    name === 'economia' ? 'Economia' : 'Taxa de Poupança'
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="economia"
                  stroke="#3e880e"
                  strokeWidth={2.5}
                  dot={{ fill: '#3e880e', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Savings tips */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dicas</p>
              {stats.savingsRate < 10 && (
                <div className="bg-red-50 rounded-xl p-3 flex gap-2">
                  <span>⚠️</span>
                  <div>
                    <p className="text-xs font-semibold text-red-700">Taxa de poupança baixa</p>
                    <p className="text-xs text-red-600 mt-0.5">Tente poupar pelo menos 10-20% da sua renda mensal</p>
                  </div>
                </div>
              )}
              {stats.savingsRate >= 10 && stats.savingsRate < 20 && (
                <div className="bg-yellow-50 rounded-xl p-3 flex gap-2">
                  <span>💡</span>
                  <div>
                    <p className="text-xs font-semibold text-yellow-700">Bom progresso!</p>
                    <p className="text-xs text-yellow-600 mt-0.5">Você está poupando {formatPercent(stats.savingsRate)}. A meta ideal é 20%</p>
                  </div>
                </div>
              )}
              {stats.savingsRate >= 20 && (
                <div className="bg-emerald-50 rounded-xl p-3 flex gap-2">
                  <span>🎉</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Excelente!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Você está poupando {formatPercent(stats.savingsRate)} da sua renda!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
