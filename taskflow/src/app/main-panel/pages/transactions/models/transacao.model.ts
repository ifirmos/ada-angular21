export enum TipoTransacao {
  RECEITA = 'receita',
  DESPESA = 'despesa'
}

export interface Transacao {
  id?: number | string;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
}
