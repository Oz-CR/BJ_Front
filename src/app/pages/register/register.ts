import { Component } from '@angular/core';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
styleUrls: ['./register.css']
})
export class Register {
  userData: RegisterRequest = {
    fullName: '',
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.register(this.userData).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: err => {
        console.error('Register error', err);
        this.errorMessage = err.error?.message || 'Datos inválidos';
      }
    });
  }
}
