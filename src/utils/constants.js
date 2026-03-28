export const EXPENSE_CATEGORIES = [
  { id: 'alimentacao', label: 'Alimentação', color: '#f97316' },
  { id: 'transporte',  label: 'Transporte',  color: '#3b82f6' },
  { id: 'moradia',     label: 'Moradia',     color: '#8b5cf6' },
  { id: 'saude',       label: 'Saúde',       color: '#ef4444' },
  { id: 'educacao',    label: 'Educação',    color: '#06b6d4' },
  { id: 'lazer',       label: 'Lazer',       color: '#ec4899' },
  { id: 'roupas',      label: 'Roupas',      color: '#a855f7' },
  { id: 'outros',      label: 'Outros',      color: '#6b7280' },
]

export const INCOME_CATEGORIES = [
  { id: 'salario',        label: 'Salário',        color: '#10b981' },
  { id: 'freelance',      label: 'Freelance',      color: '#059669' },
  { id: 'investimentos',  label: 'Investimentos',  color: '#0d9488' },
  { id: 'outros_receita', label: 'Outros',         color: '#6b7280' },
]

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const MONTHS_SHORT_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
}

export const SAMPLE_TRANSACTIONS = [
  {
    id: '1',
    type: 'income',
    amount: 5500,
    category: 'salario',
    description: 'Salário mensal',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
  },
  {
    id: '2',
    type: 'expense',
    amount: 1200,
    category: 'moradia',
    description: 'Aluguel',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString(),
  },
  {
    id: '3',
    type: 'expense',
    amount: 450,
    category: 'alimentacao',
    description: 'Supermercado',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
  },
  {
    id: '4',
    type: 'expense',
    amount: 180,
    category: 'transporte',
    description: 'Combustível',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(),
  },
  {
    id: '5',
    type: 'income',
    amount: 800,
    category: 'freelance',
    description: 'Projeto web',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
  },
  {
    id: '6',
    type: 'expense',
    amount: 120,
    category: 'saude',
    description: 'Farmácia',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(),
  },
  {
    id: '7',
    type: 'expense',
    amount: 200,
    category: 'lazer',
    description: 'Cinema e jantar',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
  },
  {
    id: '8',
    type: 'expense',
    amount: 80,
    category: 'educacao',
    description: 'Curso online',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22).toISOString(),
  },
]

export const SAMPLE_BUDGETS = [
  { id: '1', category: 'alimentacao', limit: 600, period: 'monthly' },
  { id: '2', category: 'transporte', limit: 250, period: 'monthly' },
  { id: '3', category: 'moradia', limit: 1300, period: 'monthly' },
  { id: '4', category: 'lazer', limit: 300, period: 'monthly' },
  { id: '5', category: 'saude', limit: 200, period: 'monthly' },
  { id: '6', category: 'educacao', limit: 150, period: 'monthly' },
]

export const SAMPLE_GOALS = [
  {
    id: '1',
    name: 'Reserva de Emergência',
    targetAmount: 20000,
    currentAmount: 8500,
    deadline: new Date(new Date().getFullYear() + 1, 5, 30).toISOString(),
    icon: '🛡️',
    color: '#6366f1',
  },
  {
    id: '2',
    name: 'Viagem de Férias',
    targetAmount: 8000,
    currentAmount: 3200,
    deadline: new Date(new Date().getFullYear() + 1, 11, 15).toISOString(),
    icon: '✈️',
    color: '#0ea5e9',
  },
  {
    id: '3',
    name: 'Novo Notebook',
    targetAmount: 4500,
    currentAmount: 4500,
    deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1).toISOString(),
    icon: '💻',
    color: '#10b981',
  },
]
