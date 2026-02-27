import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Transacao, TipoTransacao } from '../models/transacao.model';
import { Conta } from '../../dashboard/models/conta.model';
import { ContaCorrente } from '../../contas/models/conta-corrente.model';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TransacaoService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly apiUrl = 'http://localhost:3000';

  private transacoesSubject = new BehaviorSubject<Transacao[]>([]);
  transacoes$ = this.transacoesSubject.asObservable();

  private contaSubject = new BehaviorSubject<Conta | null>(null);
  conta$ = this.contaSubject.asObservable();

  obterConta(): Observable<Conta> {
    return this.http.get<Conta>(`${this.apiUrl}/conta`).pipe(
      tap((conta) => {
        this.contaSubject.next(conta);
        this.messageService.add({
          severity: 'info',
          summary: 'Conta carregada',
          detail: `Bem-vindo, ${conta.nome}!`,
          life: 3000,
        });
      }),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados da conta.',
          life: 3000,
        });
        return throwError(() => err);
      }),
    );
  }

  atualizarSaldo(novoSaldo: number): Observable<Conta> {
    return this.http
      .patch<Conta>(`${this.apiUrl}/conta`, { saldo: novoSaldo })
      .pipe(
        tap((conta) => {
          this.contaSubject.next(conta);
          const saldoFormatado = conta.saldo.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Saldo atualizado',
            detail: `Saldo atual: ${saldoFormatado}`,
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar o saldo.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  obterTransacoes(): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(`${this.apiUrl}/transacoes`).pipe(
      tap((transacoes) => {
        this.transacoesSubject.next(transacoes);
      }),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as transações.',
          life: 3000,
        });
        return throwError(() => err);
      }),
    );
  }

  atualizarTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http
      .put<Transacao>(`${this.apiUrl}/transacoes/${transacao.id}`, transacao)
      .pipe(
        tap((atualizada) => {
          const atuais = this.transacoesSubject.getValue();
          const idx = atuais.findIndex((t) => t.id === atualizada.id);
          if (idx !== -1) {
            const novaLista = [...atuais];
            novaLista[idx] = atualizada;
            this.transacoesSubject.next(novaLista);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Transação atualizada',
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar a transação.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  removerTransacao(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transacoes/${id}`).pipe(
      tap(() => {
        const atuais = this.transacoesSubject.getValue();
        this.transacoesSubject.next(atuais.filter((t) => t.id !== id));
        this.messageService.add({
          severity: 'success',
          summary: 'Transação excluída',
          life: 3000,
        });
      }),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir a transação.',
          life: 3000,
        });
        return throwError(() => err);
      }),
    );
  }

  criarTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http
      .post<Transacao>(`${this.apiUrl}/transacoes`, transacao)
      .pipe(
        tap((novaTransacao) => {
          const atuais = this.transacoesSubject.getValue();
          this.transacoesSubject.next([...atuais, novaTransacao]);

          const contaAtual = this.contaSubject.getValue();
          if (contaAtual) {
            this.atualizarSaldo(contaAtual.saldo + transacao.valor).subscribe({
              error: (err) => console.error('Erro ao atualizar saldo:', err),
            });
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Transação registrada',
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível registrar a transação.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  realizarTransferencia(
    contaOrigem: ContaCorrente | null,
    contaDestino: ContaCorrente,
    descricao: string,
    valor: number,
  ): Observable<Transacao> {
    // Conta destino inativa: bloqueia e avisa via MessageService
    if (!contaDestino.ativa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Conta inativa',
        detail: `A conta "${contaDestino.nome}" está inativa. A transferência não foi realizada.`,
        life: 5000,
      });
      return throwError(() => new Error('Conta destino inativa'));
    }

    const descricaoFinal = descricao || `Transferência para ${contaDestino.nome}`;

    const transferencia: Transacao = {
      data: new Date().toISOString(),
      descricao: descricaoFinal,
      valor: -Math.abs(valor),
      tipo: TipoTransacao.TRANSFERENCIA,
      contaDestinoId: contaDestino.id,
    };

    // Persiste em /transferencias (registro histórico da operação)
    const registroTransferencia = {
      data: transferencia.data,
      descricao: descricaoFinal,
      valor: Math.abs(valor),
      contaOrigemId: contaOrigem?.id ?? null,
      contaDestinoId: contaDestino.id,
    };

    this.http
      .post(`${this.apiUrl}/transferencias`, registroTransferencia)
      .subscribe({
        error: (err) => console.error('Erro ao persistir em /transferencias:', err),
      });

    // Persiste em /transacoes (aparece no extrato)
    return this.criarTransacao(transferencia);
  }
}
