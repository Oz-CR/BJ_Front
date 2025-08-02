import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: any;
    token: {
      value: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3333/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.data?.token?.value) {
            localStorage.setItem('token', response.data.token.value);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.data?.token?.value) {
            localStorage.setItem('token', response.data.token.value);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        })
      );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
