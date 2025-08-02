import { Component } from '@angular/core';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
styleUrls: ['./login.css']
})
export class Login {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: err => {
        console.error('Login error', err);
        this.errorMessage = err.error?.message || 'Credenciales incorrectas';
      }
    });
  }
}
