// Palavras que indicam despesa
const EXPENSE_TRIGGERS = ['gastei', 'paguei', 'comprei', 'gasto', 'despesa', 'saiu', 'tirei', 'custo', 'custou']
// Palavras que indicam receita
const INCOME_TRIGGERS = ['recebi', 'ganhei', 'entrou', 'receita', 'depositou', 'caiu', 'transferiram']

// Mapa de palavras-chave por categoria
const CATEGORY_KEYWORDS = {
  alimentacao: ['mercado', 'supermercado', 'restaurante', 'comida', 'lanche', 'pizza', 'ifood', 'delivery',
    'padaria', 'almoço', 'jantar', 'café', 'hamburger', 'sushi', 'açougue', 'hortifruti', 'feira',
    'churrasco', 'sorvete', 'doce', 'bebida', 'água', 'refri'],
  transporte: ['uber', '99', 'taxi', 'táxi', 'ônibus', 'metrô', 'metro', 'combustível', 'combustivel',
    'gasolina', 'etanol', 'estacionamento', 'pedágio', 'pedagio', 'passagem', 'moto', 'carro', 'bicicleta'],
  moradia: ['aluguel', 'condomínio', 'condominio', 'luz', 'energia', 'água', 'internet', 'gás', 'gas',
    'iptu', 'reforma', 'manutenção', 'manutencao', 'faxina', 'limpeza', 'móveis', 'moveis'],
  saude: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico', 'dentista', 'hospital',
    'consulta', 'exame', 'plano', 'academia', 'ginásio', 'ginasio', 'psicólogo', 'psicologo'],
  educacao: ['escola', 'faculdade', 'curso', 'livro', 'mensalidade', 'material', 'aula',
    'treinamento', 'certificado', 'inglês', 'ingles', 'idioma'],
  lazer: ['cinema', 'netflix', 'spotify', 'jogo', 'viagem', 'festa', 'bar', 'show',
    'teatro', 'parque', 'clube', 'passeio', 'streaming', 'disney', 'amazon prime'],
  roupas: ['roupa', 'calçado', 'calcado', 'sapato', 'tênis', 'tenis', 'camisa', 'vestido',
    'calça', 'calca', 'moda', 'loja', 'shopping', 'bolsa', 'cinto'],
  salario: ['salário', 'salario', 'holerite', 'pagamento do mês'],
  freelance: ['freelance', 'freela', 'serviço', 'servico', 'projeto', 'trabalho extra'],
  investimentos: ['dividendo', 'rendimento', 'investimento', 'ações', 'acoes', 'fundo', 'cdb', 'tesouro'],
  outros_receita: ['presente', 'doação', 'doacao', 'venda'],
}

const INCOME_CATEGORIES = ['salario', 'freelance', 'investimentos', 'outros_receita']

/**
 * Extrai valor monetário de um texto
 * Suporta: "50", "50,00", "50.00", "R$50", "R$ 50", "50 reais"
 */
function extractAmount(text) {
  const patterns = [
    /r\$\s?(\d+(?:[.,]\d{1,2})?)/i,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:reais|real|r\$)/i,
    /(\d{1,6}(?:[.,]\d{1,2})?)/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'))
      if (!isNaN(num) && num > 0) return num
    }
  }
  return null
}

/**
 * Detecta a categoria baseado nas palavras-chave do texto
 */
export function suggestCategory(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return lower.includes(kwNorm)
    })) {
      return cat
    }
  }
  return null
}

/**
 * Analisa texto em linguagem natural e extrai dados financeiros
 * Ex: "gastei 50 no mercado" → { amount: 50, type: 'expense', category: 'alimentacao' }
 */
export function parseSmartInput(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const result = { amount: null, type: null, category: null }

  // Detectar valor
  result.amount = extractAmount(lower)

  // Detectar tipo (receita ou despesa)
  if (INCOME_TRIGGERS.some(w => lower.includes(w))) {
    result.type = 'income'
  } else if (EXPENSE_TRIGGERS.some(w => lower.includes(w))) {
    result.type = 'expense'
  }

  // Detectar categoria
  const category = suggestCategory(text)
  if (category) {
    result.category = category
    // Ajustar tipo baseado na categoria
    if (INCOME_CATEGORIES.includes(category) && !result.type) {
      result.type = 'income'
    } else if (!result.type) {
      result.type = 'expense'
    }
  }

  return result
}
