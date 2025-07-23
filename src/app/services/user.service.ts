import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<{id: string, name: string} | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  setCurrentUser(name: string): void {
    const user = {
      id: this.generateUserId(),
      name: name.trim()
    };
    
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): {id: string, name: string} | null {
    return this.currentUserSubject.value;
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
}
