import { Pipe, PipeTransform } from '@angular/core';
import { corParaValorFinanceiro } from '../utils/formatacao.utils';

@Pipe({
  name: 'negativeValues',
  standalone: true,
})
export class NegativeValuesPipe implements PipeTransform {
  // Delega para a função utilitária pura — agora identifica cor pelo tipo da transação
  transform(tipo: string): string {
    return corParaValorFinanceiro(tipo);
  }
}
