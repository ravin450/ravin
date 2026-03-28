import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query
} from 'firebase/firestore'
import { ALL_CATEGORIES } from '../utils/constants'

const FinanceContext = createContext(null)

export function FinanceProvider({ householdId, children }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets]           = useState([])
  const [goals, setGoals]               = useState([])
  const [loading, setLoading]           = useState(true)

  // Categorias personalizadas — armazenadas em localStorage por householdId
  const storageKey = `cultivei_custom_cats_${householdId}`
  const [customCategories, setCustomCategories] = useState(() =>
    JSON.parse(localStorage.getItem(storageKey) || '[]')
  )

  // Todas as categorias (padrão + custom)
  const allCategories = useMemo(() => [...ALL_CATEGORIES, ...customCategories], [customCategories])

  useEffect(() => {
    if (!householdId) return

    let loaded = 0
    const done = () => { loaded++; if (loaded >= 3) setLoading(false) }

    const txQ     = query(collection(db, 'households', householdId, 'transactions'))
    const budgetQ = query(collection(db, 'households', householdId, 'budgets'))
    const goalQ   = query(collection(db, 'households', householdId, 'goals'))

    const unsubTx     = onSnapshot(txQ,     snap => { setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() }))); done() })
    const unsubBudget = onSnapshot(budgetQ, snap => { setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() }))); done() })
    const unsubGoal   = onSnapshot(goalQ,   snap => { setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() }))); done() })

    return () => { unsubTx(); unsubBudget(); unsubGoal() }
  }, [householdId])

  // ── Transactions ──
  const addTransaction = useCallback(async (transaction) => {
    await addDoc(collection(db, 'households', householdId, 'transactions'), {
      ...transaction, createdAt: serverTimestamp(),
    })
  }, [householdId])

  const addTransactions = useCallback(async (list) => {
    await Promise.all(list.map(t =>
      addDoc(collection(db, 'households', householdId, 'transactions'), {
        ...t, createdAt: serverTimestamp(),
      })
    ))
  }, [householdId])

  const updateTransaction = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'households', householdId, 'transactions', id), updates)
  }, [householdId])

  const deleteTransaction = useCallback(async (id) => {
    await deleteDoc(doc(db, 'households', householdId, 'transactions', id))
  }, [householdId])

  // ── Installments ──
  const deleteInstallmentGroup = useCallback(async (groupId) => {
    const txs = transactions.filter(t => t.installmentGroup === groupId)
    await Promise.all(txs.map(t => deleteDoc(doc(db, 'households', householdId, 'transactions', t.id))))
  }, [householdId, transactions])

  const installmentGroups = useMemo(() => {
    const groups = {}
    transactions.forEach(t => {
      if (!t.installmentGroup) return
      if (!groups[t.installmentGroup]) {
        groups[t.installmentGroup] = {
          id: t.installmentGroup,
          description: t.description,
          category: t.category,
          installmentTotal: t.installmentTotal || 1,
          monthlyAmount: t.amount,
          transactions: [],
        }
      }
      groups[t.installmentGroup].transactions.push(t)
    })
    const now = new Date()
    return Object.values(groups).map(g => {
      const paid = g.transactions.filter(t => new Date(t.date) <= now).length
      const startDate = g.transactions
        .map(t => t.date).sort()[0]
      return {
        ...g,
        paid,
        remaining: g.installmentTotal - paid,
        totalAmount: g.monthlyAmount * g.installmentTotal,
        startDate,
        isActive: paid < g.installmentTotal,
      }
    }).sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0) || new Date(b.startDate) - new Date(a.startDate))
  }, [transactions])

  // ── Budgets ──
  const addBudget = useCallback(async (budget) => {
    await addDoc(collection(db, 'households', householdId, 'budgets'), budget)
  }, [householdId])

  const updateBudget = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'households', householdId, 'budgets', id), updates)
  }, [householdId])

  const deleteBudget = useCallback(async (id) => {
    await deleteDoc(doc(db, 'households', householdId, 'budgets', id))
  }, [householdId])

  // ── Goals ──
  const addGoal = useCallback(async (goal) => {
    await addDoc(collection(db, 'households', householdId, 'goals'), goal)
  }, [householdId])

  const updateGoal = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'households', householdId, 'goals', id), updates)
  }, [householdId])

  const deleteGoal = useCallback(async (id) => {
    await deleteDoc(doc(db, 'households', householdId, 'goals', id))
  }, [householdId])

  // ── Custom Categories ──
  const addCustomCategory = useCallback((cat) => {
    const newCat = { ...cat, id: `custom_${Date.now()}`, custom: true }
    setCustomCategories(prev => {
      const updated = [...prev, newCat]
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
    return newCat
  }, [storageKey])

  const deleteCustomCategory = useCallback((id) => {
    setCustomCategories(prev => {
      const updated = prev.filter(c => c.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }, [storageKey])

  // ── Stats ──
  const stats = useMemo(() => {
    const now = new Date()
    const m = now.getMonth(), y = now.getFullYear()

    const monthly = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === m && d.getFullYear() === y
    })

    const monthlyIncome   = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const allIncome       = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const allExpenses     = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    return {
      totalBalance:        allIncome - allExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance:      monthlyIncome - monthlyExpenses,
      savingsRate:         monthlyIncome > 0 ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0,
      monthlyTransactions: monthly,
    }
  }, [transactions])

  const monthlyChartData = useMemo(() => {
    const now   = new Date()
    const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const m   = d.getMonth(), y = d.getFullYear()
      const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth()===m && td.getFullYear()===y })
      const receitas = txs.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0)
      const despesas = txs.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0)
      return { name: names[m], receitas, despesas, saldo: receitas - despesas }
    })
  }, [transactions])

  const categoryBreakdown = useMemo(() => {
    const now = new Date()
    const m = now.getMonth(), y = now.getFullYear()
    const map = {}
    transactions
      .filter(t => t.type==='expense' && new Date(t.date).getMonth()===m && new Date(t.date).getFullYear()===y)
      .forEach(t => { map[t.category] = (map[t.category]||0) + t.amount })
    return Object.entries(map).map(([category, amount]) => ({ category, amount }))
  }, [transactions])

  const budgetSpending = useMemo(() => {
    const now = new Date()
    const m = now.getMonth(), y = now.getFullYear()
    const monthly = transactions.filter(t => {
      const d = new Date(t.date)
      return t.type==='expense' && d.getMonth()===m && d.getFullYear()===y
    })
    return budgets.map(budget => {
      const spent = monthly.filter(t => t.category===budget.category).reduce((s,t) => s+t.amount, 0)
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      return { ...budget, spent, remaining: budget.limit - spent, percentage: Math.min(percentage, 100), isOver: spent > budget.limit }
    })
  }, [budgets, transactions])

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, goals, loading,
      stats, monthlyChartData, categoryBreakdown, budgetSpending,
      allCategories, customCategories, addCustomCategory, deleteCustomCategory,
      installmentGroups, deleteInstallmentGroup,
      addTransaction, addTransactions, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
