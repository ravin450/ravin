import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, X, ArrowUpDown } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import TransactionItem from '../components/TransactionItem'
import TransactionModal from '../components/TransactionModal'
import PageHeader from '../components/PageHeader'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ALL_CATEGORIES } from '../utils/constants'
import { formatCurrency } from '../utils/formatters'

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Mais recentes' },
  { value: 'date_asc', label: 'Mais antigas' },
  { value: 'amount_desc', label: 'Maior valor' },
  { value: 'amount_asc', label: 'Menor valor' },
]

export default function Transactions() {
  const { transactions } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')
  const [showFilters, setShowFilters] = useState(false)

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTransaction(null)
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions]

    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType)
    }

    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          ALL_CATEGORIES.find((c) => c.id === t.category)?.label.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.date) - new Date(a.date)
        case 'date_asc': return new Date(a.date) - new Date(b.date)
        case 'amount_desc': return b.amount - a.amount
        case 'amount_asc': return a.amount - b.amount
        default: return 0
      }
    })

    return result
  }, [transactions, filterType, filterCategory, search, sortBy])

  const totalFiltered = useMemo(() => {
    const income = filteredAndSorted
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expense = filteredAndSorted
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return { income, expense }
  }, [filteredAndSorted])

  const availableCategories =
    filterType === 'income'
      ? INCOME_CATEGORIES
      : filterType === 'expense'
      ? EXPENSE_CATEGORIES
      : ALL_CATEGORIES

  const activeFiltersCount = [
    filterType !== 'all',
    filterCategory !== 'all',
    search.trim() !== '',
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilterType('all')
    setFilterCategory('all')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Transações"
        subtitle={`${filteredAndSorted.length} transação${filteredAndSorted.length !== 1 ? 'ões' : ''}`}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors"
          >
            <Plus size={22} />
          </button>
        }
      />

      {/* Summary Strip */}
      <div className="px-4 -mt-3 mb-4">
        <div className="bg-white rounded-2xl shadow-card p-3 flex items-center justify-around">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Receitas</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalFiltered.income)}</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Despesas</p>
            <p className="text-sm font-bold text-red-500">{formatCurrency(totalFiltered.expense)}</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Saldo</p>
            <p className={`text-sm font-bold ${totalFiltered.income - totalFiltered.expense >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
              {formatCurrency(totalFiltered.income - totalFiltered.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-4 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 pr-4 py-2.5 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative p-2.5 rounded-xl border-2 transition-all duration-200 ${
              showFilters || activeFiltersCount > 0
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <Filter size={18} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
            {/* Type Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo</p>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'income', label: 'Receitas' },
                  { value: 'expense', label: 'Despesas' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterType(opt.value); setFilterCategory('all') }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterType === opt.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoria</p>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="all">Todas as categorias</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ordenar por</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      sortBy === opt.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <ArrowUpDown size={10} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-xs text-red-500 font-semibold border border-red-100 rounded-xl bg-red-50"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="px-4 mt-3 pb-6 space-y-2">
        {filteredAndSorted.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-600 font-semibold">Nenhuma transação encontrada</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFiltersCount > 0 ? 'Tente ajustar os filtros' : 'Adicione sua primeira transação'}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-3 text-primary-600 text-sm font-medium">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          filteredAndSorted.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 gradient-main rounded-full shadow-lg flex items-center justify-center text-white z-40 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <TransactionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />
    </div>
  )
}
