import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const FinanceContext = createContext(null)

function getUserKey(userName, suffix) {
  const normalized = (userName || 'guest')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  return `tr_${normalized}_${suffix}`
}

export function FinanceProvider({ userName, children }) {
  const txKey      = getUserKey(userName, 'transactions')
  const budgetKey  = getUserKey(userName, 'budgets')
  const goalKey    = getUserKey(userName, 'goals')

  const [transactions, setTransactions] = useLocalStorage(txKey, [])
  const [budgets, setBudgets]           = useLocalStorage(budgetKey, [])
  const [goals, setGoals]               = useLocalStorage(goalKey, [])

  // --- Transactions ---
  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }, [setTransactions])

  const updateTransaction = useCallback((id, updates) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }, [setTransactions])

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [setTransactions])

  // --- Budgets ---
  const addBudget = useCallback((budget) => {
    const newBudget = { ...budget, id: Date.now().toString() }
    setBudgets((prev) => [...prev, newBudget])
  }, [setBudgets])

  const updateBudget = useCallback((id, updates) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
  }, [setBudgets])

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }, [setBudgets])

  // --- Goals ---
  const addGoal = useCallback((goal) => {
    const newGoal = { ...goal, id: Date.now().toString() }
    setGoals((prev) => [...prev, newGoal])
  }, [setGoals])

  const updateGoal = useCallback((id, updates) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    )
  }, [setGoals])

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [setGoals])

  // --- Computed Stats ---
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyTransactions = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0
      ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0

    const allTimeIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const allTimeExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalBalance = allTimeIncome - allTimeExpenses

    return {
      totalBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      monthlyBalance: balance,
      savingsRate,
      monthlyTransactions,
    }
  }, [transactions])

  const monthlyChartData = useMemo(() => {
    const now = new Date()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === month && d.getFullYear() === year
      })

      const income = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      data.push({
        name: monthNames[month],
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
      })
    }

    return data
  }, [transactions])

  const categoryBreakdown = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const expenses = transactions.filter((t) => {
      const d = new Date(t.date)
      return (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })

    const breakdown = {}
    expenses.forEach((t) => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount
    })

    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
    }))
  }, [transactions])

  const budgetSpending = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyExpenses = transactions.filter((t) => {
      const d = new Date(t.date)
      return (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })

    return budgets.map((budget) => {
      const spent = monthlyExpenses
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0)
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0

      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: Math.min(percentage, 100),
        isOver: spent > budget.limit,
      }
    })
  }, [budgets, transactions])

  const value = {
    transactions,
    budgets,
    goals,
    stats,
    monthlyChartData,
    categoryBreakdown,
    budgetSpending,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
