import { Injectable } from '@angular/core';
import { Pages } from '../../constants/pages.enum';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private currentPage$ = new BehaviorSubject<Pages>(Pages.TRANSACTIONS);

  setCurrentPage(page: Pages): void {
    this.currentPage$.next(page);
  }

  getCurrentPage(): Observable<Pages> {
    return this.currentPage$;
  }
}
