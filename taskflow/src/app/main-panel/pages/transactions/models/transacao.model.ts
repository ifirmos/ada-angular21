export enum TipoTransacao {
  RECEITA = 'receita',
  DESPESA = 'despesa',
  TRANSFERENCIA = 'transferencia',
}

export interface Transacao {
  id?: number | string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  contaDestinoId?: number | string;
}
