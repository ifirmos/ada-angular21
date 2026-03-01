import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conta } from '../models/conta.model';
import { TransacaoService } from '../../transactions/services/transacao.service';
import { ContaCorrenteService } from '../../contas/services/conta-corrente.service';
import { ContaCorrente } from '../../contas/models/conta-corrente.model';
import { Transacao, TipoTransacao } from '../../transactions/models/transacao.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly transacaoService = inject(TransacaoService);
  private readonly contaCorrenteService = inject(ContaCorrenteService);

  obterConta(): Observable<Conta> {
    return this.transacaoService.obterConta();
  }

  obterContas() {
    return this.contaCorrenteService.obterContas();
  }

  obterTransacoes() {
    return this.transacaoService.obterTransacoes();
  }

  get conta$() {
    return this.transacaoService.conta$;
  }

  get contas$() {
    return this.contaCorrenteService.contas$;
  }

  get transacoes$() {
    return this.transacaoService.transacoes$;
  }

  // Saldo e dados financeiros vêm da conta corrente ativa
  get contaAtiva$() {
    return this.contaCorrenteService.contaAtiva$;
  }

  // Calcula totais de receitas/despesas/transferências a partir das transações carregadas
  calcularResumo(transacoes: Transacao[]): { receitas: number; despesas: number; transferencias: number } {
    let receitas = 0;
    let despesas = 0;
    let transferencias = 0;
    for (const t of transacoes) {
      const val = Math.abs(t.valor);
      if (t.tipo === TipoTransacao.RECEITA) receitas += val;
      else if (t.tipo === TipoTransacao.DESPESA) despesas += val;
      else if (t.tipo === TipoTransacao.TRANSFERENCIA) transferencias += val;
    }
    return { receitas, despesas, transferencias };
  }
}
