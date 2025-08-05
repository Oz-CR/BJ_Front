import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface Player {
  id: number;
  email: string;
  name: string;
}

interface GameWithPlayers extends Game {
  players: Player[];
}

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiting-room.html',
  styleUrl: './waiting-room.css'
})
export class WaitingRoom implements OnInit, OnDestroy {
  gameId: string = '';
  game: GameWithPlayers | null = null;
  currentUser: any = null;
  isOwner: boolean = false;
  private gameSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private gameUpdatesSubscription?: Subscription;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.gameId = params['id'];
      if (this.gameId) {
        this.loadGame();
        this.setupGameUpdates();
      }
    });

    // Obtener usuario actual
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.gameUpdatesSubscription) {
      this.gameUpdatesSubscription.unsubscribe();
    }
    // Salir de la sala WebSocket al destruir el componente
    if (this.gameId) {
      this.gameService.leaveGameRoom(this.gameId);
    }
  }

  loadGame() {
    this.loading = true;
    this.error = '';
    
    this.gameService.getGameById(this.gameId).subscribe({
      next: (response) => {
        console.log('Game loaded:', response);
        this.game = response.data.game;
        this.isOwner = response.data.isOwner;
        this.loading = false;
        
        // Si el juego ya está activo, redirigir a la página de juego
        if (this.game?.is_active) {
          this.router.navigate(['/ingame'], { queryParams: { gameId: this.gameId } });
        }
      },
      error: (error) => {
        console.error('Error loading game:', error);
        this.error = 'Error al cargar la partida';
        this.loading = false;
        // Si hay error, volver a la lista de salas
        setTimeout(() => {
          this.router.navigate(['/rooms']);
        }, 2000);
      }
    });
  }

  setupGameUpdates() {
    // Unirse a la sala WebSocket para este juego
    this.gameService.joinGameRoom(this.gameId);
    
    // Escuchar actualizaciones del juego vía WebSocket
    this.gameUpdatesSubscription = this.gameService.getGameUpdates().subscribe({
      next: (update) => {
        console.log('Game update received:', update);
        
        // Manejar cuando el anfitrión abandona la partida
        if (update && update.type === 'host_left') {
          alert(update.data.message || 'El anfitrión ha abandonado la partida.');
          this.router.navigate(['/rooms']);
          return;
        }
        
        // Manejar actualizaciones generales del juego
        if (update && (update.game === this.gameId || update.data?.game === this.gameId)) {
          // Recargar datos del juego cuando hay una actualización
          this.refreshGameData();
        }
        
        // Manejar específicamente cuando alguien se une
        if (update && update.type === 'player_joined') {
          console.log('Player joined, refreshing game data');
          this.refreshGameData();
        }
        
        // Manejar específicamente cuando alguien se va (no anfitrión)
        if (update && update.type === 'player_left') {
          console.log('Player left, refreshing game data');
          this.refreshGameData();
        }
        
        if (update && update.type === 'game_started') {
          // Si el juego ha iniciado, redirigir a la página de juego
          this.router.navigate(['/ingame'], { queryParams: { gameId: this.gameId } });
        }
        
        if (update && update.type === 'game_restarted') {
          // Si el juego ha sido reiniciado, mostrar mensaje y recargar datos
          console.log('Game has been restarted, refreshing data');
          this.refreshGameData();
        }
      },
      error: (error) => {
        console.error('Error in game updates:', error);
      }
    });
  }
  
  private refreshGameData() {
    // Solo refrescar si no estamos ya cargando
    if (!this.loading) {
      this.gameService.getGameById(this.gameId).subscribe({
        next: (response) => {
          console.log('Game data refreshed:', response);
          this.game = response.data.game;
          this.isOwner = response.data.isOwner;
          
          // Si el juego ya está activo, redirigir a la página de juego
          if (this.game?.is_active) {
            this.router.navigate(['/ingame'], { queryParams: { gameId: this.gameId } });
          }
        },
        error: (error) => {
          console.error('Error refreshing game data:', error);
        }
      });
    }
  }

  startGame() {
    if (!this.isOwner || !this.gameId) {
      return;
    }

    if (!this.game || this.game.player_ids.length < 2) {
      this.error = 'Se necesitan al menos 2 jugadores para iniciar la partida';
      return;
    }

    this.gameService.startGame(this.gameId).subscribe({
      next: (response) => {
        console.log('Game started:', response);
        // Redirigir a la página de juego
        this.router.navigate(['/ingame'], { queryParams: { gameId: this.gameId } });
      },
      error: (error) => {
        console.error('Error starting game:', error);
        this.error = 'Error al iniciar la partida: ' + (error.error?.message || 'Error desconocido');
      }
    });
  }

  leaveGame() {
    if (!this.gameId) {
      return;
    }

    this.gameService.leaveGame(this.gameId).subscribe({
      next: () => {
        console.log('Left game successfully');
        this.router.navigate(['/rooms']);
      },
      error: (error) => {
        console.error('Error leaving game:', error);
        // Incluso si hay error, redirigir a rooms
        this.router.navigate(['/rooms']);
      }
    });
  }

  copyGameId() {
    if (this.gameId) {
      navigator.clipboard.writeText(this.gameId).then(() => {
        console.log('Game ID copied to clipboard');
      });
    }
  }
}
