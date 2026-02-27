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
import { exportarTransacoesParaPdf } from '../../../../../shared/utils/pdf.utils';
import { map } from 'rxjs';

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
    InputTextModule,
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

  // Filtro por período (date range)
  periodoFiltro: Date[] | null = null;

  // Transações filtradas para exibição na tabela
  get transacoesFiltradas$() {
    return this.transacoes$.pipe(
      map((lista) => this.aplicarFiltroPeriodo(lista)),
    );
  }

  ngOnInit(): void {
    this.transacaoService.obterTransacoes().subscribe({
      error: (err) => console.error('Erro ao carregar transações:', err),
    });
  }

  private aplicarFiltroPeriodo(lista: Transacao[]): Transacao[] {
    if (!this.periodoFiltro || this.periodoFiltro.length < 2) return lista;
    const [inicio, fim] = this.periodoFiltro;
    if (!inicio || !fim) return lista;

    const inicioMs = inicio.setHours(0, 0, 0, 0);
    // Inclui o dia final completo
    const fimMs = new Date(fim).setHours(23, 59, 59, 999);

    return lista.filter((t) => {
      const dataMs = new Date(t.data).getTime();
      return dataMs >= inicioMs && dataMs <= fimMs;
    });
  }

  limparFiltro(): void {
    this.periodoFiltro = null;
  }

  exportarPdf(): void {
    // Exporta exatamente o que está sendo exibido na tabela (com filtro aplicado)
    const lista = this.aplicarFiltroPeriodo(
      this.transacaoService['transacoesSubject'].getValue(),
    );

    const conta = this.transacaoService['contaSubject'].getValue();

    let inicio: Date | undefined;
    let fim: Date | undefined;
    if (this.periodoFiltro && this.periodoFiltro.length === 2) {
      inicio = this.periodoFiltro[0];
      fim = this.periodoFiltro[1];
    }

    exportarTransacoesParaPdf(
      lista,
      {
        titulo: 'Extrato de Transações',
        nomeArquivo: 'extrato-transacoes',
        nomeTitular: conta?.nome,
      },
      inicio,
      fim,
    );
  }

  // No primeng success é o verde e o outro é vermelho,
  // então estou usando isso para diferenciar visualmente receitas e despesas
  getSeveridade(tipo: TipoTransacao): 'success' | 'danger' | 'info' {
    if (tipo === TipoTransacao.RECEITA) return 'success';
    if (tipo === TipoTransacao.TRANSFERENCIA) return 'info';
    return 'danger';
  }

  getLabelTipo(tipo: TipoTransacao): string {
    switch (tipo) {
      case TipoTransacao.RECEITA: return 'Entrada';
      case TipoTransacao.DESPESA: return 'Saída';
      case TipoTransacao.TRANSFERENCIA: return 'Transferência';
      default: return tipo;
    }
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

