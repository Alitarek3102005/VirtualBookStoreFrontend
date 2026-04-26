import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Logincred } from './../Models/logincred';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { User } from '../Models/user';
import { Registercred } from '../Models/registercred';
import { UserResponseForPublishers } from '../Models/user-response-for-publishers';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}
  login(Logincred: Logincred):Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/login`, Logincred).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
}
  register(Registercred: Registercred):Observable<any> {
    return this.httpClient.post(`${environment.apiUrl}/auth/register`, Registercred).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }
  logout(): void {
    localStorage.removeItem('jwt_token');
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }
  getCurrentUser(): Observable<User> {
    return this.httpClient.get<User>(`${environment.apiUrl}/current-user`);
  }
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
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

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
  getPublisherUsers():Observable<UserResponseForPublishers[]>{
    return this.httpClient.get<UserResponseForPublishers[]>(`${environment.apiUrl}/user/publishers`);
  }
  getUserData(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const decodedToken = this.decodeToken(token);
    return this.httpClient.get(`${environment.apiUrl}/user/${decodedToken.id}`);
  }
}
