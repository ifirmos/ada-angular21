import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function valorPositivoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) return null;
    return valor > 0 ? null : { valorNaoPositivo: true };
  };
}

export function semEspacoEmBrancoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    return valor.trim().length > 0 || valor.length === 0
      ? null
      : { apenasEspacos: true };
  };
}

export function dataNaoFuturaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dataEscolhida = new Date(control.value);
    const hoje = new Date();
    // Zera horário para comparar apenas a data
    hoje.setHours(23, 59, 59, 999);
    return dataEscolhida <= hoje ? null : { dataFutura: true };
  };
}

export function valorMaximoValidator(maximo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) return null;
    return valor <= maximo
      ? null
      : { valorExcedeLimite: { maximo, atual: valor } };
  };
}

export function naoApenasNumerosValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor.trim()) return null;
    return /^\d+$/.test(valor.trim()) ? { apenasNumeros: true } : null;
  };
}
