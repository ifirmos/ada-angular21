import { Component, inject } from '@angular/core';
import { Pages } from '../constants/pages.enum';
import { RouterService } from '../core/services/router.service';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { DrawerModule } from 'primeng/drawer';
import { obterItensMenu } from '../shared/utils/menu-items.utils';
import { SidebarStateService } from '../core/services/sidebar-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RippleModule, DrawerModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private readonly routerService = inject(RouterService);
  readonly sidebarState = inject(SidebarStateService);

  paginaAtual$ = this.routerService.getCurrentPage();

  // Itens de menu centralizados no utilitário shared/utils/menu-items.utils.ts
  itensMenu = obterItensMenu();

  irParaPagina(pagina: Pages): void {
    this.routerService.setCurrentPage(pagina);
    this.sidebarState.close();
  }
}
