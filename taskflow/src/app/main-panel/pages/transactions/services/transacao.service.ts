import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { Transacao, TipoTransacao } from '../models/transacao.model';
import { Conta } from '../../dashboard/models/conta.model';
import { ContaCorrente } from '../../contas/models/conta-corrente.model';
import { ContaCorrenteService } from '../../contas/services/conta-corrente.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TransacaoService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly contaCorrenteService = inject(ContaCorrenteService);
  private readonly apiUrl = 'http://localhost:3000';

  private transacoesSubject = new BehaviorSubject<Transacao[]>([]);
  transacoes$ = this.transacoesSubject.asObservable();

  // Mantido para exibir o nome do titular (carregado via obterConta de /conta)
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

  // Atualiza o saldo da conta corrente ativa (fonte de verdade → /contas-correntes/:id)
  atualizarSaldo(novoSaldo: number): Observable<ContaCorrente> {
    const contaAtiva = this.contaCorrenteService.obterContaAtiva();
    if (!contaAtiva) {
      return throwError(() => new Error('Nenhuma conta ativa encontrada.'));
    }
    return this.contaCorrenteService.atualizarSaldo(contaAtiva.id!, novoSaldo).pipe(
      tap((cc) => {
        const saldoFormatado = cc.saldo.toLocaleString('pt-BR', {
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

  // Registra no extrato SEM atualizar saldo — usado internamente
  private registrarTransacao(transacao: Transacao): Observable<Transacao> {
    return this.http.post<Transacao>(`${this.apiUrl}/transacoes`, transacao).pipe(
      tap((nova) => {
        const atuais = this.transacoesSubject.getValue();
        this.transacoesSubject.next([...atuais, nova]);
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

  // Receita/Despesa: registra no extrato E atualiza saldo da conta ativa
  criarTransacao(transacao: Transacao): Observable<Transacao> {
    return this.registrarTransacao(transacao).pipe(
      switchMap((nova) => {
        const contaAtiva = this.contaCorrenteService.obterContaAtiva();
        if (!contaAtiva) return throwError(() => new Error('Nenhuma conta ativa.'));
        // Saldo: receita soma, despesa subtrai (valores são sempre positivos no JSON)
        const delta = transacao.tipo === TipoTransacao.RECEITA
          ? Math.abs(transacao.valor)
          : -Math.abs(transacao.valor);
        const novoSaldo = contaAtiva.saldo + delta;
        return this.contaCorrenteService.atualizarSaldo(contaAtiva.id!, novoSaldo).pipe(
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Transação registrada',
              life: 3000,
            });
          }),
          switchMap(() => [nova]),
        );
      }),
    );
  }

  realizarTransferencia(
    contaOrigem: ContaCorrente | null,
    contaDestino: ContaCorrente,
    descricao: string,
    valor: number,
  ): Observable<Transacao> {
    if (!contaDestino.ativa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Conta inativa',
        detail: `A conta "${contaDestino.nome}" está inativa. A transferência não foi realizada.`,
        life: 5000,
      });
      return throwError(() => new Error('Conta destino inativa'));
    }

    if (!contaOrigem) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Conta de origem inválida',
        detail: 'Selecione a conta de origem da transferência.',
        life: 5000,
      });
      return throwError(() => new Error('Conta origem não selecionada'));
    }

    if (contaOrigem.saldo < valor) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Saldo insuficiente',
        detail: `A conta "${contaOrigem.nome}" não possui saldo suficiente para esta transferência.`,
        life: 5000,
      });
      return throwError(() => new Error('Saldo insuficiente'));
    }

    const descricaoFinal = descricao || `Transferência para ${contaDestino.nome}`;

    const transacaoExtrato: Transacao = {
      data: new Date().toISOString(),
      descricao: descricaoFinal,
      valor: Math.abs(valor),
      tipo: TipoTransacao.TRANSFERENCIA,
      contaDestinoId: contaDestino.id,
    };

    const registroHistorico = {
      data: transacaoExtrato.data,
      descricao: descricaoFinal,
      valor: Math.abs(valor),
      contaOrigemId: contaOrigem.id,
      contaDestinoId: contaDestino.id,
    };

    // Histórico em /transferencias (fire-and-forget)
    this.http
      .post(`${this.apiUrl}/transferencias`, registroHistorico)
      .subscribe({ error: (err) => console.error('Erro ao persistir em /transferencias:', err) });

    // Fluxo: POST extrato → PATCH saldo origem (débito) → PATCH saldo destino (crédito)
    return this.registrarTransacao(transacaoExtrato).pipe(
      switchMap((nova) => {
        const saldoOrigemNovo = contaOrigem.saldo - Math.abs(valor);
        const saldoDestinoNovo = contaDestino.saldo + Math.abs(valor);

        return this.contaCorrenteService
          .atualizarSaldo(contaOrigem.id!, saldoOrigemNovo)
          .pipe(
            switchMap(() =>
              this.contaCorrenteService.atualizarSaldo(contaDestino.id!, saldoDestinoNovo),
            ),
            tap(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'Transferência realizada',
                detail: `R$ ${Math.abs(valor).toFixed(2)} transferidos de "${contaOrigem.nome}" para "${contaDestino.nome}".`,
                life: 5000,
              });
            }),
            switchMap(() => [nova]),
          );
      }),
    );
  }
}
