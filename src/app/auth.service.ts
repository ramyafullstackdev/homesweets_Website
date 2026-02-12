import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.getLoginStatus());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() { }

  login(username: string, password: string): boolean {
    // Simple hardcoded credentials for testing
    if (username === 'test' && password === 'test') {
      localStorage.setItem('isLoggedIn', 'true');
      this.isLoggedInSubject.next(true);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  private getLoginStatus(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}