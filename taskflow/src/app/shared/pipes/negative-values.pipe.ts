import { Pipe, PipeTransform } from '@angular/core';
import { corParaValorFinanceiro } from '../utils/formatacao.utils';

@Pipe({
  name: 'negativeValues',
  standalone: true,
})
export class NegativeValuesPipe implements PipeTransform {
  // Delega para a função utilitária pura, que pode ser usada fora do Angular também
  transform(value: number): string {
    return corParaValorFinanceiro(value);
  }
}
