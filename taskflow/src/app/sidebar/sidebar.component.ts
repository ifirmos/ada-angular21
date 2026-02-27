import { Component, inject } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { RouterService } from '../core/services/router.service';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { obterItensMenu } from '../shared/utils/menu-items.utils';

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

  // Itens de menu centralizados no utilitário shared/utils/menu-items.utils.ts
  itensMenu = obterItensMenu();

  irParaPagina(pagina: Pages): void {
    this.routerService.setCurrentPage(pagina);
  }
}
