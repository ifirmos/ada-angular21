import { Component, inject, OnInit } from '@angular/core';
import { Transacao, TipoTransacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NegativeValuesPipe } from '../../../../../shared/pipes/negative-values.pipe';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
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
    MultiSelectModule,
  ],
  templateUrl: './list-transactions.component.html',
  styleUrl: './list-transactions.component.css',
})
export class ListTransactionsComponent implements OnInit {
  private readonly transacaoService = inject(TransacaoService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  transacoes$ = this.transacaoService.transacoes$;
  tiposTransacao = TipoTransacao;
  clonedTransactions: { [id: string]: Transacao } = {};
  editingDates: { [id: string]: Date } = {};

  periodoFiltro: Date[] | null = null;

  tiposFiltro: string[] = [];
  opcoesFiltroPorTipo = [
    { label: 'Entrada', value: TipoTransacao.RECEITA },
    { label: 'Saída', value: TipoTransacao.DESPESA },
    { label: 'Transferência', value: TipoTransacao.TRANSFERENCIA },
  ];

  cols: { field: string; header: string }[] = [];

  descricaoFiltro = '';

  get transacoesFiltradas$() {
    return this.transacoes$.pipe(
      map((lista) => this.aplicarFiltros(lista)),
    );
  }

  ngOnInit(): void {
    this.transacaoService.obterTransacoes().subscribe({
      error: (err) => console.error('Erro ao carregar transações:', err),
    });

    this.cols = [
      { field: 'data', header: 'Data' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'valor', header: 'Valor' },
      { field: 'tipo', header: 'Tipo' },
    ];
    
  }

  private aplicarFiltros(lista: Transacao[]): Transacao[] {
    let resultado = lista;

    if (this.periodoFiltro && this.periodoFiltro.length >= 2) {
      const [inicio, fim] = this.periodoFiltro;
      if (inicio && fim) {
        const inicioMs = new Date(inicio).setHours(0, 0, 0, 0);
        const fimMs = new Date(fim).setHours(23, 59, 59, 999);
        resultado = resultado.filter((t) => {
          const dataMs = new Date(t.data).getTime();
          return dataMs >= inicioMs && dataMs <= fimMs;
        });
      }
    }

    if (this.tiposFiltro.length > 0) {
      resultado = resultado.filter((t) => this.tiposFiltro.includes(t.tipo));
    }

    if (this.descricaoFiltro.trim()) {
      const termo = this.descricaoFiltro.trim().toLowerCase();
      resultado = resultado.filter((t) =>
        t.descricao.toLowerCase().includes(termo),
      );
    }

    return resultado;
  }

  limparFiltro(): void {
    this.periodoFiltro = null;
    this.tiposFiltro = [];
    this.descricaoFiltro = '';
  }

  exportarPdf(): void {
    const lista = this.aplicarFiltros(
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
    const erros: string[] = [];

    if (!dateVal) {
      erros.push('A data é obrigatória.');
    }
    if (!transaction.descricao || !transaction.descricao.trim()) {
      erros.push('A descrição é obrigatória.');
    } else if (transaction.descricao.trim().length < 3) {
      erros.push('A descrição deve ter no mínimo 3 caracteres.');
    }
    if (transaction.valor == null || transaction.valor <= 0) {
      erros.push('O valor deve ser maior que zero.');
    }

    if (erros.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: erros.join(' '),
        life: 5000,
      });
      const original = this.clonedTransactions[transaction.id!];
      if (original) {
        Object.assign(transaction, original);
      }
      delete this.clonedTransactions[transaction.id!];
      delete this.editingDates[transaction.id!];
      return;
    }

    transaction.data = dateVal.toISOString();
    transaction.valor = Math.abs(transaction.valor);

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

