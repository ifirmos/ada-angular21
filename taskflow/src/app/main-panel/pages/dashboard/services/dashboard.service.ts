import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conta } from '../models/conta.model';
import { TransacaoService } from '../../transactions/services/transacao.service';
import { ContaCorrenteService } from '../../contas/services/conta-corrente.service';

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

  get conta$() {
    return this.transacaoService.conta$;
  }

  // Saldo e dados financeiros vêm da conta corrente ativa
  get contaAtiva$() {
    return this.contaCorrenteService.contaAtiva$;
  }
}
