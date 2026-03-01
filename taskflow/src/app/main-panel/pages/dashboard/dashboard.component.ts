import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Conta } from './models/conta.model';
import { DashboardService } from './services/dashboard.service';
import { CurrencyPipe, CommonModule, AsyncPipe, DatePipe } from '@angular/common';
import { TipoTransacao, Transacao } from '../transactions/models/transacao.model';
import { ContaCorrente } from '../contas/models/conta-corrente.model';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, PanelModule, ChartModule, TableModule, TagModule, CurrencyPipe, CommonModule, AsyncPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private sub?: Subscription;

  conta$ = this.dashboardService.conta$;
  contaAtiva$ = this.dashboardService.contaAtiva$;
  contas$ = this.dashboardService.contas$;
  transacoes$ = this.dashboardService.transacoes$;

  // Computed data
  contas: ContaCorrente[] = [];
  contasAtivas: ContaCorrente[] = [];
  saldoTotal = 0;
  resumo = { receitas: 0, despesas: 0, transferencias: 0 };
  ultimasTransacoes: Transacao[] = [];
  todasTransacoes: Transacao[] = [];

  // Chart data
  doughnutData: any;
  doughnutOptions: any;
  barData: any;
  barOptions: any;

  ngOnInit(): void {
    this.dashboardService.obterConta().subscribe({
      error: (err) => console.error('Erro ao carregar conta:', err),
    });
    this.dashboardService.obterContas().subscribe({
      error: (err) => console.error('Erro ao carregar contas:', err),
    });
    this.dashboardService.obterTransacoes().subscribe({
      error: (err) => console.error('Erro ao carregar transações:', err),
    });

    this.sub = combineLatest([this.contas$, this.transacoes$]).subscribe(
      ([contas, transacoes]) => {
        this.contas = contas;
        this.contasAtivas = contas.filter((c) => c.ativa);
        this.saldoTotal = this.contasAtivas.reduce((acc, c) => acc + c.saldo, 0);
        this.resumo = this.dashboardService.calcularResumo(transacoes);
        this.todasTransacoes = transacoes;

        // Últimas 5 transações (mais recentes primeiro)
        this.ultimasTransacoes = [...transacoes]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .slice(0, 5);

        this.montarGraficos();
      },
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private montarGraficos(): void {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#334155';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--surface-border').trim() || '#e2e8f0';

    // Doughnut — Receitas vs Despesas vs Transferências
    this.doughnutData = {
      labels: ['Receitas', 'Despesas', 'Transferências'],
      datasets: [
        {
          data: [this.resumo.receitas, this.resumo.despesas, this.resumo.transferencias],
          backgroundColor: ['#10b981', '#f43f5e', '#3B82F6'],
          hoverBackgroundColor: ['#059669', '#e11d48', '#2563eb'],
          borderWidth: 0,
        },
      ],
    };
    this.doughnutOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, padding: 16, usePointStyle: true },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };

    // Bar — Receitas vs Despesas mensais (últimos meses agrupados)
    const meses = this.agruparPorMes();
    this.barData = {
      labels: meses.map((m) => m.label),
      datasets: [
        {
          label: 'Receitas',
          backgroundColor: '#10b981',
          data: meses.map((m) => m.receitas),
          borderRadius: 4,
        },
        {
          label: 'Despesas',
          backgroundColor: '#f43f5e',
          data: meses.map((m) => m.despesas),
          borderRadius: 4,
        },
      ],
    };
    this.barOptions = {
      plugins: {
        legend: {
          labels: { color: textColor, usePointStyle: true },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: borderColor, drawBorder: false },
        },
        y: {
          ticks: { color: textColor },
          grid: { color: borderColor, drawBorder: false },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
  }

  private agruparPorMes(): { label: string; receitas: number; despesas: number }[] {
    const mapa = new Map<string, { receitas: number; despesas: number }>();
    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (const t of this.todasTransacoes) {
      const d = new Date(t.data);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      if (!mapa.has(key)) mapa.set(key, { receitas: 0, despesas: 0 });
      const entry = mapa.get(key)!;
      const val = Math.abs(t.valor);
      if (t.tipo === TipoTransacao.RECEITA) entry.receitas += val;
      else entry.despesas += val;
    }

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [ano, mes] = key.split('-');
        return { label: `${mesesNome[parseInt(mes)]}/${ano.slice(2)}`, ...val };
      });
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

  getCorSaldo(saldo: number): string {
    return saldo >= 0 ? 'var(--primary-color)' : '#f43f5e';
  }
}
