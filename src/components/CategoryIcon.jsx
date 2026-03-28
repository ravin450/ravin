import { Utensils, Car, Home, Heart, BookOpen, Coffee, ShoppingBag, Box, Briefcase, Laptop, TrendingUp, Wallet } from 'lucide-react'

const META = {
  alimentacao:   { Icon: Utensils,    color: '#f97316' },
  transporte:    { Icon: Car,         color: '#3b82f6' },
  moradia:       { Icon: Home,        color: '#8b5cf6' },
  saude:         { Icon: Heart,       color: '#ef4444' },
  educacao:      { Icon: BookOpen,    color: '#06b6d4' },
  lazer:         { Icon: Coffee,      color: '#ec4899' },
  roupas:        { Icon: ShoppingBag, color: '#a855f7' },
  outros:        { Icon: Box,         color: '#6b7280' },
  salario:       { Icon: Briefcase,   color: '#10b981' },
  freelance:     { Icon: Laptop,      color: '#059669' },
  investimentos: { Icon: TrendingUp,  color: '#0d9488' },
  outros_receita:{ Icon: Wallet,      color: '#6b7280' },
}

export function getCategoryMeta(id) {
  return META[id] || { Icon: Box, color: '#6b7280' }
}

export default function CategoryIcon({ categoryId, size = 'md' }) {
  const { Icon, color } = getCategoryMeta(categoryId)
  const dim    = size === 'sm' ? 28 : size === 'lg' ? 44 : 36
  const iSize  = size === 'sm' ? 13 : size === 'lg' ? 20 : 16
  const radius = size === 'sm' ?  8 : size === 'lg' ? 12 : 10
  return (
    <div style={{
      width: dim, height: dim, borderRadius: radius, flexShrink: 0,
      background: `${color}1a`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={iSize} color={color} strokeWidth={1.8} />
    </div>
  )
}
