import React, { useState } from 'react'
import { Pencil, Trash2, RefreshCw } from 'lucide-react'
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

      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 relative"
        style={{
          background: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isIncome ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
        }}>
        {category?.icon || '📦'}
        {transaction.recurring && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#131720', border: '1px solid rgba(201,168,76,0.3)' }}>
            <RefreshCw size={8} style={{ color: '#C9A84C' }} />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-white text-sm truncate leading-tight">
            {transaction.description || category?.label || 'Transação'}
          </p>
          {!isIncome && transaction.necessity === 'want' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>
              Desejo
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
          {formatDateShort(transaction.date)} · {category?.label || 'Outros'}
          {transaction.addedBy ? ` · ${transaction.addedBy}` : ''}
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
