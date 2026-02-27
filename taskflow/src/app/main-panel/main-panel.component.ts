import { Component, inject } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { RouterService } from '../core/services/router.service';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LoanComponent } from './pages/loan/loan.component';
import { ContasComponent } from './pages/contas/contas.component';
import { TransferenciaComponent } from './pages/transferencia/transferencia.component';

@Component({
  selector: 'app-main-panel',
  standalone: true,
  imports: [
    DashboardComponent,
    TransactionsComponent,
    LoanComponent,
    ContasComponent,
    TransferenciaComponent,
    AsyncPipe,
    CommonModule,
  ],
  templateUrl: './main-panel.component.html',
  styleUrl: './main-panel.component.css',
})
export class MainPanelComponent {
  private readonly routerService = inject(RouterService);

  pagina$ = this.routerService.getCurrentPage();
  paginasEnum = Pages;
}
