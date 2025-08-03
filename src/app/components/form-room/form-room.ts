import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

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
  
  constructor(private gameService: GameService, private router: Router) {}

  onCancel() {
    this.cancel.emit();
  }
  
  onSubmit() {
    if (!this.gameName.trim()) {
      alert('Por favor ingresa un nombre para la mesa');
      return;
    }
    
    this.isCreating = true;
    
    this.gameService.createGame(this.gameName.trim()).subscribe({
      next: (response) => {
        console.log('Game created:', response);
        this.gameCreated.emit(response);
        
        // Redirigir a la sala de espera
        const gameId = response.data.game._id;
        this.router.navigate(['/waiting-room', gameId]);
        
        this.cancel.emit(); // Cerrar el modal
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating game:', error);
        alert('Error al crear la mesa. Inténtalo de nuevo.');
        this.isCreating = false;
      }
    });
  }

}
