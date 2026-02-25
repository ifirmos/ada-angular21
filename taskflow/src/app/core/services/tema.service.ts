import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly _isDarkMode = signal(false);

  readonly isDarkMode = this._isDarkMode.asReadonly();

  toggleTema() {
    this._isDarkMode.update((valor) => !valor);
    const element = document.querySelector('html');
    if (element) {
      element.classList.toggle('my-app-dark', this._isDarkMode());
    }
  }

  iniciarTema() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      this.toggleTema();
    }
  }
}
