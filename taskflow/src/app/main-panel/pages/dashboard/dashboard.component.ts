import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { Conta } from './models/conta.model';
import { DashboardService } from './services/dashboard.service';
import { CurrencyPipe, CommonModule, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, PanelModule, CurrencyPipe, CommonModule, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  conta$ = this.dashboardService.conta$;
  contaAtiva$ = this.dashboardService.contaAtiva$;

  ngOnInit(): void {
    // Carrega o nome do titular
    this.dashboardService.obterConta().subscribe({
      error: (err) => console.error('Erro ao carregar conta:', err),
    });
    // Carrega as contas (saldo da conta ativa)
    this.dashboardService.obterContas().subscribe({
      error: (err) => console.error('Erro ao carregar contas:', err),
    });
  }
}
