import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  standalone: true,
  selector: 'app-crad-game',
  imports: [CommonModule],
  templateUrl: './crad-game.html',
  styleUrl: './crad-game.css',
})
export class CradGame {
  @Input() game?: any;
  isJoining: boolean = false;

  constructor(private gameService: GameService, private router: Router) {}

  joinGame() {
    if (!this.game?._id || this.isJoining) {
      return;
    }

    this.isJoining = true;

    this.gameService.joinGame(this.game._id).subscribe({
      next: (response) => {
        console.log('Joined game successfully:', response);
        // Redirigir a la sala de espera
        this.router.navigate(['/waiting-room', this.game._id]);
        this.isJoining = false;
      },
      error: (error) => {
        console.error('Error joining game:', error);
        alert('Error al unirse a la partida: ' + (error.error?.message || 'Error desconocido'));
        this.isJoining = false;
      }
    });
  }
}
