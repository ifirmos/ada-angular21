import { Component, inject, OnInit } from '@angular/core';
import { Transacao, TipoTransacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { NegativeValuesPipe } from '../../../../../shared/pipes/negative-values.pipe';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-list-transactions',
  imports: [
    DatePipe,
    CurrencyPipe,
    AsyncPipe,
    TableModule,
    TagModule,
    ButtonModule,
    DatePickerModule,
    ConfirmDialogModule,
    NegativeValuesPipe,
    FormsModule,
    InputTextModule
  ],
  templateUrl: './list-transactions.component.html',
  styleUrl: './list-transactions.component.css',
})
export class ListTransactionsComponent implements OnInit {
  private readonly transacaoService = inject(TransacaoService);
  private readonly confirmationService = inject(ConfirmationService);

  transacoes$ = this.transacaoService.transacoes$;
  tiposTransacao = TipoTransacao;
  clonedTransactions: { [id: string]: Transacao } = {};
  editingDates: { [id: string]: Date } = {};

  ngOnInit(): void {
    this.transacaoService.obterTransacoes().subscribe({
      error: (err) => console.error('Erro ao carregar transações:', err),
    });
  }

  getSeveridade(tipo: TipoTransacao): 'success' | 'danger' {
    return tipo === TipoTransacao.RECEITA ? 'success' : 'danger';
  }

  onRowEditInit(transaction: Transacao): void {
    this.clonedTransactions[transaction.id!] = { ...transaction };
    this.editingDates[transaction.id!] = new Date(transaction.data);
  }

  onRowEditSave(transaction: Transacao): void {
    const dateVal = this.editingDates[transaction.id!];
    if (dateVal) {
      transaction.data = dateVal.toISOString();
    }
    this.transacaoService.atualizarTransacao(transaction).subscribe({
      error: (err) => console.error('Erro ao atualizar transação:', err),
    });
    delete this.clonedTransactions[transaction.id!];
    delete this.editingDates[transaction.id!];
  }

  onRowEditCancel(transaction: Transacao, rowIndex: number): void {
    const original = this.clonedTransactions[transaction.id!];
    if (original) {
      Object.assign(transaction, original);
      delete this.clonedTransactions[transaction.id!];
      delete this.editingDates[transaction.id!];
    }
  }

  onDeleteClick(transaction: Transacao): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a transação "${transaction.descricao}"?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.transacaoService.removerTransacao(transaction.id!).subscribe({
          error: (err) => console.error('Erro ao excluir transação:', err),
        });
      },
    });
  }
}
