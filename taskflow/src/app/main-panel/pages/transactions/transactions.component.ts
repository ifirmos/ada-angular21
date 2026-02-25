import { Component } from '@angular/core';
import { CreateTransactionComponent } from './components/create-transaction/create-transaction.component';
import { ListTransactionsComponent } from './components/list-transactions/list-transactions.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [CreateTransactionComponent, ListTransactionsComponent, ButtonModule, CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent {
  mostrarFormulario = false;

  alternarFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  aocriarTransacao(): void {
    this.mostrarFormulario = false;
  }
}
