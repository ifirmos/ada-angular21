import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { EmprestimoService, SimulacaoEmprestimo } from './services/emprestimo.service';
import { TransacaoService } from '../transactions/services/transacao.service';
import { ContaCorrenteService } from '../contas/services/conta-corrente.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-loan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SliderModule,
    InputNumberModule,
    ButtonModule,
    DividerModule,
    CurrencyPipe,
    ConfirmDialogModule,
  ],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css',
})
export class LoanComponent {
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly transacaoService = inject(TransacaoService);
  private readonly contaCorrenteService = inject(ContaCorrenteService);
  private readonly confirmationService = inject(ConfirmationService);

  valorSolicitado: number = 5000;
  parcelas: number = 12;
  taxaJurosMensal: number = 2.5;
  emprestimoConcluido = false;

  get simulacao(): SimulacaoEmprestimo {
    return this.emprestimoService.simular(this.valorSolicitado, this.parcelas, this.taxaJurosMensal);
  }

  get valorParcela(): number {
    return this.simulacao.valorParcela;
  }

  get totalPagar(): number {
    return this.simulacao.totalPagar;
  }

  get custoEfetivo(): number {
    return this.simulacao.custoEfetivo;
  }

  solicitarEmprestimo(): void {
    const sim = this.simulacao;
    const valorFormatado = sim.valorSolicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const parcelaFormatada = sim.valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    this.confirmationService.confirm({
      header: 'Confirmar Contratação de Empréstimo',
      message: `Você está prestes a contratar um empréstimo de <strong>${valorFormatado}</strong>
        em <strong>${sim.parcelas}x</strong> de <strong>${parcelaFormatada}</strong>.
        <br><br>O valor será creditado no seu saldo. Confirmar?`,
      icon: 'pi pi-briefcase',
      acceptLabel: 'Confirmar Contratação',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.concluirEmprestimo(sim),
    });
  }

  private concluirEmprestimo(sim: SimulacaoEmprestimo): void {
    const contaAtiva = this.contaCorrenteService.obterContaAtiva();
    if (!contaAtiva) {
      console.error('Nenhuma conta ativa encontrada.');
      return;
    }

    const novoSaldo = contaAtiva.saldo + sim.valorSolicitado;

    // 1. Persiste o registro do empréstimo em /emprestimos
    this.emprestimoService
      .salvarEmprestimo(sim)
      .pipe(first())
      .subscribe({
        next: () => {
          // 2. Credita o valor no saldo da conta
          this.transacaoService
            .atualizarSaldo(novoSaldo)
            .pipe(first())
            .subscribe({
              next: () => {
                this.emprestimoConcluido = true;
              },
              error: (err) => console.error('Erro ao creditar empréstimo:', err),
            });
        },
        error: (err) => console.error('Erro ao salvar empréstimo:', err),
      });
  }
}

