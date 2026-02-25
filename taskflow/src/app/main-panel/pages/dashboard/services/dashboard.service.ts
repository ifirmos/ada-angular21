import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conta } from '../models/conta.model';
import { TransacaoService } from '../../transactions/services/transacao.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly transacaoService = inject(TransacaoService);

  obterConta(): Observable<Conta> {
    return this.transacaoService.obterConta();
  }

  get conta$() {
    return this.transacaoService.conta$;
  }
}
