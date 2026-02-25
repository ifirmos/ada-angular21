import { Injectable } from '@angular/core';

export interface SimulacaoEmprestimo {
  valorSolicitado: number;
  parcelas: number;
  taxaJurosMensal: number;
  valorParcela: number;
  totalPagar: number;
  custoEfetivo: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmprestimoService {

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
}
