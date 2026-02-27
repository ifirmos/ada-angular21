/**
 * Validadores customizados para fins didáticos.
 * Cada função tem um propósito claro, fácil de entender, replicar e ensinar.
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Validador: valor mínimo positivo
//    Garante que o valor numérico seja maior que zero.
// ─────────────────────────────────────────────────────────────────────────────
export function valorPositivoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) return null;
    return valor > 0 ? null : { valorNaoPositivo: true };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Validador: sem espaços em branco nas pontas (trim)
//    Impede que o campo contenha apenas espaços.
// ─────────────────────────────────────────────────────────────────────────────
export function semEspacoEmBrancoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    return valor.trim().length > 0 || valor.length === 0
      ? null
      : { apenasEspacos: true };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Validador: data não pode ser futura
//    Útil para registrar transações passadas ou do dia atual.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// 4. Validador de fábrica: limite de valor máximo customizável
//    Permite reutilizar com diferentes limites sem duplicar código.
// ─────────────────────────────────────────────────────────────────────────────
export function valorMaximoValidator(maximo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) return null;
    return valor <= maximo ? null : { valorExcedeLimite: { maximo, atual: valor } };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Validador: descrição não pode conter apenas números
//    Garante que o campo de texto seja descritivo.
// ─────────────────────────────────────────────────────────────────────────────
export function naoApenasNumerosValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor.trim()) return null;
    return /^\d+$/.test(valor.trim()) ? { apenasNumeros: true } : null;
  };
}
