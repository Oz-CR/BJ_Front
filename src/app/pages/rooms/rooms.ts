import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CradGame } from '../../components/crad-game/crad-game';
import { FormRoom } from '../../components/form-room/form-room';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, CradGame, FormRoom],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms implements OnInit {
  isModalVisible = false;

  games: Game[] = [];

  constructor(private auth: AuthService, private router: Router, private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getGames().subscribe(g => {
      console.log('Games updated in component:', g);
      this.games = g;
    });
    this.gameService.findGames();
    console.log('Rooms component initialized');
  }

  openModal() {
    this.isModalVisible = true;
  }

  refreshGames() {
    console.log('Manually refreshing games...');
    this.gameService.findGames();
  }
  
  onGameCreated(gameData: any) {
    console.log('Game created successfully:', gameData);
    // Refrescar la lista de juegos
    this.refreshGames();
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
