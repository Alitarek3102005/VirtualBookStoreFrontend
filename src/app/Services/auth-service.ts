import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Logincred } from './../Models/logincred';
import { environment } from '../../environments/environment.development';
import { Observable, BehaviorSubject, tap } from 'rxjs'; // 🟢 Added BehaviorSubject
import { User } from '../Models/user';
import { Registercred } from '../Models/registercred';
import { UserResponseForPublishers } from '../Models/user-response-for-publishers';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private adminSubject = new BehaviorSubject<boolean>(this.getUserRole() === 'ADMIN');
  public isLoggedIn$ = this.loggedInSubject.asObservable();
  public isAdmin$ = this.adminSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  login(Logincred: Logincred): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/login`, Logincred).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.loggedInSubject.next(true);
          this.adminSubject.next(this.getUserRole() === 'ADMIN');
        }
      })
    );
  }

  register(Registercred: Registercred): Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/register`, Registercred).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.loggedInSubject.next(true);
          this.adminSubject.next(this.getUserRole() === 'ADMIN');
        }
      })
    );
  }
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.loggedInSubject.next(false);
    this.adminSubject.next(false);
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }
  getCurrentUser(): Observable<UserResponseForPublishers | null> {
    const token: string | null = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const userId = this.decodeToken(token).id;
    return this.httpClient.get<UserResponseForPublishers | null>(`${environment.apiUrl}/user/${userId}`);
  }
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
  isLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$;
  }
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedJson = JSON.parse(atob(payload));
      return decodedJson;
    } catch (e) {
      return null;
    }
  }
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.role : null;
  }
  isAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }
  getPublisherUsers(): Observable<UserResponseForPublishers[]> {
    return this.httpClient.get<UserResponseForPublishers[]>(`${environment.apiUrl}/admin/publishers`);
  }
  getUserData(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const decodedToken = this.decodeToken(token);
    return this.httpClient.get(`${environment.apiUrl}/admin/users/${decodedToken.id}`);
  }
  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${environment.apiUrl}/admin/users`);
  }

  editUserRole(userId: number, newRole: string): Observable<any> {
    let queryParams = new HttpParams().set('newRole', newRole);
    return this.httpClient.put(`${environment.apiUrl}/admin/users/${userId}/role`, null, { 
      params: queryParams 
    });
  }
  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.id : null;
  }
}