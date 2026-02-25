import { Component, inject } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { RouterService } from '../core/services/router.service';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly routerService = inject(RouterService);

  paginasEnum = Pages;
  paginaAtual$ = this.routerService.getCurrentPage();

  itensMenu = [
    {
      label: 'Painel Geral',
      icon: 'pi pi-home',
      pagina: Pages.DASHBOARD,
    },
    {
      label: 'Minhas Transações',
      icon: 'pi pi-list',
      pagina: Pages.TRANSACTIONS,
    },
    {
      label: 'Empréstimos',
      icon: 'pi pi-money-bill',
      pagina: Pages.LOAN,
    }
  ];

  irParaPagina(pagina: Pages): void {
    this.routerService.setCurrentPage(pagina);
  }
}
