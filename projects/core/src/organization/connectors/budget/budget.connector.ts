import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Budget } from '../../../model/budget.model';
import { BudgetAdapter } from './budget.adapter';

@Injectable({
  providedIn: 'root',
})
export class BudgetConnector {
  constructor(protected adapter: BudgetAdapter) {}

  get(userId: string, budgetCode: string): Observable<Budget> {
    return this.adapter.load(userId, budgetCode);
  }

  getBudgets(
    userId: string,
    pageSize?: number,
    currentPage?: number,
    sort?: string
  ): Observable<Budget[]> {
    return this.adapter.loadBudgets(userId, pageSize, currentPage, sort);
  }
}