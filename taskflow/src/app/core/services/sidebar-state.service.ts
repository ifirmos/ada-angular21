import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly sidebarVisible = signal<boolean>(false);

  toggle(): void {
    this.sidebarVisible.update(v => !v);
  }

  open(): void {
    this.sidebarVisible.set(true);
  }

  close(): void {
    this.sidebarVisible.set(false);
  }
}
