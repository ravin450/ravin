import {
  Utensils, Car, Home, Heart, BookOpen, Coffee, ShoppingBag, Box,
  Briefcase, Laptop, TrendingUp, Wallet, Scissors,
  Tag, Star, Zap, Music, Gift, Dumbbell, Plane, Smile, Camera, Tv, PawPrint
} from 'lucide-react'

const META = {
  // Categorias padrão — despesas
  alimentacao:   { Icon: Utensils,    color: '#f97316' },
  transporte:    { Icon: Car,         color: '#3b82f6' },
  moradia:       { Icon: Home,        color: '#8b5cf6' },
  saude:         { Icon: Heart,       color: '#ef4444' },
  educacao:      { Icon: BookOpen,    color: '#06b6d4' },
  lazer:         { Icon: Coffee,      color: '#ec4899' },
  roupas:        { Icon: ShoppingBag, color: '#a855f7' },
  beleza:        { Icon: Scissors,    color: '#f43f5e' },
  outros:        { Icon: Box,         color: '#6b7280' },
  // Categorias padrão — receitas
  salario:       { Icon: Briefcase,   color: '#10b981' },
  freelance:     { Icon: Laptop,      color: '#059669' },
  investimentos: { Icon: TrendingUp,  color: '#0d9488' },
  outros_receita:{ Icon: Wallet,      color: '#6b7280' },
  // Ícones para categorias personalizadas
  tag:      { Icon: Tag,      color: '#6b7280' },
  star:     { Icon: Star,     color: '#f59e0b' },
  zap:      { Icon: Zap,      color: '#eab308' },
  music:    { Icon: Music,    color: '#8b5cf6' },
  gift:     { Icon: Gift,     color: '#ec4899' },
  dumbbell: { Icon: Dumbbell, color: '#6366f1' },
  plane:    { Icon: Plane,    color: '#0ea5e9' },
  smile:    { Icon: Smile,    color: '#22c55e' },
  camera:   { Icon: Camera,   color: '#f97316' },
  tv:       { Icon: Tv,       color: '#8b5cf6' },
  paw:      { Icon: PawPrint, color: '#f59e0b' },
}

export const CUSTOM_ICON_OPTIONS = [
  { id: 'tag',      Icon: Tag,      label: 'Geral' },
  { id: 'star',     Icon: Star,     label: 'Especial' },
  { id: 'zap',      Icon: Zap,      label: 'Energia' },
  { id: 'music',    Icon: Music,    label: 'Música' },
  { id: 'gift',     Icon: Gift,     label: 'Presente' },
  { id: 'dumbbell', Icon: Dumbbell, label: 'Academia' },
  { id: 'plane',    Icon: Plane,    label: 'Viagem' },
  { id: 'smile',    Icon: Smile,    label: 'Diversão' },
  { id: 'camera',   Icon: Camera,   label: 'Foto' },
  { id: 'tv',       Icon: Tv,       label: 'Streaming' },
  { id: 'paw',      Icon: PawPrint, label: 'Pet' },
]

export const CUSTOM_COLOR_OPTIONS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#22c55e', '#f59e0b',
  '#6366f1', '#f43f5e',
]

export function getCategoryMeta(id) {
  return META[id] || { Icon: Tag, color: '#6b7280' }
}

/**
 * categoryId  — id padrão ou custom (ex: 'custom_123')
 * categoryMeta — objeto { icon, color } passado para categorias custom
 * size         — 'sm' | 'md' | 'lg'
 */
export default function CategoryIcon({ categoryId, categoryMeta, size = 'md' }) {
  let Icon, color

  if (META[categoryId]) {
    Icon = META[categoryId].Icon
    color = META[categoryId].color
  } else if (categoryMeta?.icon && META[categoryMeta.icon]) {
    Icon = META[categoryMeta.icon].Icon
    color = categoryMeta.color || META[categoryMeta.icon].color
  } else if (categoryMeta?.color) {
    Icon = Tag
    color = categoryMeta.color
  } else {
    Icon = Tag
    color = '#6b7280'
  }

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
