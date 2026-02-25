import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { EmprestimoService, SimulacaoEmprestimo } from './services/emprestimo.service';

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
    CurrencyPipe
  ],
  templateUrl: './loan.component.html',
  styleUrl: './loan.component.css'
})
export class LoanComponent {
  private readonly emprestimoService = inject(EmprestimoService);

  valorSolicitado: number = 5000;
  parcelas: number = 12;
  taxaJurosMensal: number = 2.5;

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

  solicitarEmprestimo() {
    console.log('Simulação solicitada:', this.simulacao);
  }
}
