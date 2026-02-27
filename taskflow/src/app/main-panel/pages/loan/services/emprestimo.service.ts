import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SimulacaoEmprestimo {
  valorSolicitado: number;
  parcelas: number;
  taxaJurosMensal: number;
  valorParcela: number;
  totalPagar: number;
  custoEfetivo: number;
}

export interface Emprestimo extends SimulacaoEmprestimo {
  id?: string;
  data: string;
  status: 'ativo' | 'quitado';
}

@Injectable({
  providedIn: 'root',
})
export class EmprestimoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  calcularValorParcela(valorSolicitado: number, parcelas: number, taxaJurosMensal: number): number {
    const i = taxaJurosMensal / 100;
    const n = parcelas;
    const p = valorSolicitado;

    // Fórmula de amortização Price
    if (i === 0) return p / n;
    return (p * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  }

  calcularTotalPagar(valorParcela: number, parcelas: number): number {
    return valorParcela * parcelas;
  }

  simular(valorSolicitado: number, parcelas: number, taxaJurosMensal: number): SimulacaoEmprestimo {
    const valorParcela = this.calcularValorParcela(valorSolicitado, parcelas, taxaJurosMensal);
    const totalPagar = this.calcularTotalPagar(valorParcela, parcelas);
    const custoEfetivo = totalPagar - valorSolicitado;

    return {
      valorSolicitado,
      parcelas,
      taxaJurosMensal,
      valorParcela,
      totalPagar,
      custoEfetivo,
    };
  }

  // Persiste o empréstimo no endpoint /emprestimos do json-server
  salvarEmprestimo(simulacao: SimulacaoEmprestimo): Observable<Emprestimo> {
    const emprestimo: Emprestimo = {
      ...simulacao,
      data: new Date().toISOString(),
      status: 'ativo',
    };
    return this.http.post<Emprestimo>(`${this.apiUrl}/emprestimos`, emprestimo);
  }
}
