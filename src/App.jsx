import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FinanceProvider } from './context/FinanceContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Voice from './pages/Voice'
import Welcome from './pages/Welcome'

function RequireName({ children }) {
  const name = localStorage.getItem('finance_user_name')
  if (!name) return <Navigate to="/boas-vindas" replace />
  return children
}

export default function App() {
  const userName = localStorage.getItem('finance_user_name') || ''

  return (
    <FinanceProvider key={userName} userName={userName}>
      <Router>
        <Routes>
          <Route path="/boas-vindas" element={<Welcome />} />
          <Route path="/" element={<RequireName><Layout /></RequireName>}>
            <Route index element={<Dashboard />} />
            <Route path="transacoes" element={<Transactions />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="orcamento" element={<Budget />} />
            <Route path="metas" element={<Goals />} />
            <Route path="voz" element={<Voice />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </FinanceProvider>
  )
}
