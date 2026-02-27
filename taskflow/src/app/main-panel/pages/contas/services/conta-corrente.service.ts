import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ContaCorrente } from '../models/conta-corrente.model';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ContaCorrenteService {
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);
  private readonly apiUrl = 'http://localhost:3000';

  private contasSubject = new BehaviorSubject<ContaCorrente[]>([]);
  contas$ = this.contasSubject.asObservable();

  obterContas(): Observable<ContaCorrente[]> {
    return this.http.get<ContaCorrente[]>(`${this.apiUrl}/contas-correntes`).pipe(
      tap((contas) => this.contasSubject.next(contas)),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as contas.',
          life: 3000,
        });
        return throwError(() => err);
      }),
    );
  }

  criarConta(conta: ContaCorrente): Observable<ContaCorrente> {
    return this.http
      .post<ContaCorrente>(`${this.apiUrl}/contas-correntes`, conta)
      .pipe(
        tap((nova) => {
          const atuais = this.contasSubject.getValue();
          this.contasSubject.next([...atuais, nova]);
          this.messageService.add({
            severity: 'success',
            summary: 'Conta cadastrada',
            detail: `Conta "${nova.nome}" adicionada com sucesso.`,
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível cadastrar a conta.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  atualizarConta(conta: ContaCorrente): Observable<ContaCorrente> {
    return this.http
      .put<ContaCorrente>(`${this.apiUrl}/contas-correntes/${conta.id}`, conta)
      .pipe(
        tap((atualizada) => {
          const atuais = this.contasSubject.getValue();
          const idx = atuais.findIndex((c) => c.id === atualizada.id);
          if (idx !== -1) {
            const nova = [...atuais];
            nova[idx] = atualizada;
            this.contasSubject.next(nova);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Conta atualizada',
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível atualizar a conta.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  removerConta(id: number | string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/contas-correntes/${id}`)
      .pipe(
        tap(() => {
          const atuais = this.contasSubject.getValue();
          this.contasSubject.next(atuais.filter((c) => c.id !== id));
          this.messageService.add({
            severity: 'success',
            summary: 'Conta removida',
            life: 3000,
          });
        }),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível remover a conta.',
            life: 3000,
          });
          return throwError(() => err);
        }),
      );
  }

  alternarAtivacao(conta: ContaCorrente): Observable<ContaCorrente> {
    const atualizada = { ...conta, ativa: !conta.ativa };
    return this.atualizarConta(atualizada);
  }

  obterContasAtivas(): ContaCorrente[] {
    return this.contasSubject.getValue().filter((c) => c.ativa);
  }
}
