/**
 * Utilitários para itens de menu da aplicação.
 * Centraliza as definições para fácil manutenção.
 */

import { Pages } from '../../constants/pages.enum';

export interface ItemMenu {
  label: string;
  icon: string;
  pagina: Pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Retorna todos os itens de menu da aplicação
// ─────────────────────────────────────────────────────────────────────────────
export function obterItensMenu(): ItemMenu[] {
  return [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      pagina: Pages.DASHBOARD,
    },
    {
      label: 'Minhas Transações',
      icon: 'pi pi-list',
      pagina: Pages.TRANSACTIONS,
    },
    {
      label: 'Transferências',
      icon: 'pi pi-arrow-right-arrow-left',
      pagina: Pages.TRANSFERENCIA,
    },
    {
      label: 'Empréstimos',
      icon: 'pi pi-money-bill',
      pagina: Pages.LOAN,
    },
    {
      label: 'Contas Correntes',
      icon: 'pi pi-credit-card',
      pagina: Pages.CONTAS,
    },
  ];
}
