import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'negativeValues',
  standalone: true,
})
export class NegativeValuesPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 0) {
      return 'color: #10b981';
    }
    if (value < 0) {
      return 'color: #f43f5e';
    }
    return '';
  }
}
