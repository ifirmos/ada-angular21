import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TemaService } from './core/services/tema.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, MainPanelComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly temaService = inject(TemaService);

  ngOnInit() {
    this.temaService.iniciarTema();
  }
}
