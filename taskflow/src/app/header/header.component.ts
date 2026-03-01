import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TemaService } from '../core/services/tema.service';
import { CommonModule } from '@angular/common';
import { SidebarStateService } from '../core/services/sidebar-state.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, CommonModule, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public readonly temaService = inject(TemaService);
  public readonly sidebarState = inject(SidebarStateService);

  alternarTema() {
    this.temaService.toggleTema();
  }
}
