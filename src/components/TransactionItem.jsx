import React, { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ALL_CATEGORIES } from '../utils/constants'
import { formatCurrency, formatDateShort } from '../utils/formatters'
import { useFinance } from '../context/FinanceContext'

export default function TransactionItem({ transaction, onEdit }) {
  const { deleteTransaction } = useFinance()
  const [showActions, setShowActions] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const category = ALL_CATEGORIES.find((c) => c.id === transaction.category)
  const isIncome = transaction.type === 'income'

  const handleDelete = () => {
    if (confirmDelete) { deleteTransaction(transaction.id) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer active:scale-[0.99]"
      style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)' }}
      onClick={() => setShowActions(!showActions)}>

      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{
          background: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isIncome ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
        }}>
        {category?.icon || '📦'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate leading-tight">
          {transaction.description || category?.label || 'Transação'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatDateShort(transaction.date)} · {category?.label || 'Outros'}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold text-sm"
          style={{ color: isIncome ? 'var(--income)' : 'var(--expense)' }}>
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </span>
        {showActions && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { onEdit(transaction); setShowActions(false) }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: confirmDelete ? '#DC2626' : 'rgba(239,68,68,0.1)', color: confirmDelete ? '#fff' : '#EF4444' }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
