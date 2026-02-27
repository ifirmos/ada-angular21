export interface ContaCorrente {
  id?: number | string;
  nome: string;
  agencia: string;
  numeroConta: string;
  ativa: boolean;
  saldo: number;
  principal?: boolean;
}