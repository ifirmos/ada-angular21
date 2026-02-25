import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TemaService } from '../core/services/tema.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public readonly temaService = inject(TemaService);

  alternarTema() {
    this.temaService.toggleTema();
  }
}
