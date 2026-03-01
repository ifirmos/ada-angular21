/**
 * Utilitários de formatação de valores.
 * Funções puras que podem ser usadas em pipes, componentes e serviços.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Retorna a cor CSS para exibição de valores financeiros
// Receita = verde, Despesa/Transferência = vermelho
// ─────────────────────────────────────────────────────────────────────────────
export function corParaValorFinanceiro(tipo: string): string {
  if (tipo === 'receita') return 'color: #10b981';
  if (tipo === 'despesa' || tipo === 'transferencia') return 'color: #f43f5e';
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Formata um número como moeda BRL (sem depender do Angular)
// ─────────────────────────────────────────────────────────────────────────────
export function formatarMoedaBrBrl(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Formata uma data ISO para dd/mm/yyyy
// ─────────────────────────────────────────────────────────────────────────────
export function formatarDataBrl(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString('pt-BR');
}
