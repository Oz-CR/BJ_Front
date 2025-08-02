import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-form-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-room.html',
  styleUrls: ['./form-room.css']
})
export class FormRoom {
  @Output() cancel = new EventEmitter<void>();
  @Output() gameCreated = new EventEmitter<any>();
  
  gameName: string = '';
  isCreating: boolean = false;
  
  constructor(private http: HttpClient, private auth: AuthService) {}

  onCancel() {
    this.cancel.emit();
  }
  
  async onSubmit() {
    if (!this.gameName.trim()) {
      alert('Por favor ingresa un nombre para la mesa');
      return;
    }
    
    this.isCreating = true;
    
    try {
      const token = this.auth.getToken();
      const response = await this.http.post('http://localhost:3333/create-game', {
        name: this.gameName.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).toPromise();
      
      console.log('Game created:', response);
      this.gameCreated.emit(response);
      this.cancel.emit(); // Cerrar el modal
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error al crear la mesa. Inténtalo de nuevo.');
    } finally {
      this.isCreating = false;
    }
  }

}
