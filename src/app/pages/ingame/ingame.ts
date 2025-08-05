import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ingame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingame.html',
  styleUrl: './ingame.css'
})
export class Ingame implements OnInit, OnDestroy {
  gameId: string = '';
  game: any = null;
  currentUser: any = null;
  myCards: any[] = [];
  myTotalValue: number = 0;
  winner: string = '';
  loading: boolean = true;
  error: string = '';
  isMyTurn: boolean = false;
  
  private gameUpdatesSubscription?: Subscription;
  private routeSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    // Obtener gameId de los parámetros de consulta
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.gameId = params['gameId'];
      if (this.gameId) {
        this.loadGame();
        this.setupGameUpdates();
      } else {
        this.router.navigate(['/rooms']);
      }
    });
    
    // Obtener usuario actual
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUser = response.data.user;
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.router.navigate(['/login']);
      }
    });
  }
  
  ngOnDestroy() {
    if (this.gameUpdatesSubscription) {
      this.gameUpdatesSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
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
        this.isMyTurn = response.data.isYourTurn;
        
        // Si el juego no está activo, redirigir a sala de espera
        if (!this.game.is_active) {
          this.router.navigate(['/waiting-room', this.gameId]);
          return;
        }
        
        // Cargar mis cartas
        this.loadMyCards();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading game:', error);
        this.error = 'Error al cargar la partida';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/rooms']);
        }, 2000);
      }
    });
  }
  
  loadMyCards() {
    this.gameService.getMyCards(this.gameId).subscribe({
      next: (response) => {
        console.log('My cards loaded:', response);
        const playerPack = response.data.player_pack;
        this.myCards = playerPack.pack || [];
        this.myTotalValue = playerPack.total_value || 0;
      },
      error: (error) => {
        console.error('Error loading my cards:', error);
      }
    });
  }
  
  setupGameUpdates() {
    this.gameService.joinGameRoom(this.gameId);
    
    this.gameUpdatesSubscription = this.gameService.getGameUpdates().subscribe({
      next: (update) => {
        console.log('Game update received:', update);
        
        if (update && (update.game === this.gameId || update.data?.game === this.gameId)) {
          this.refreshGameData();
        }
        
        if (update && update.type === 'host_left') {
          alert(update.data.message || 'El anfitrión ha abandonado la partida.');
          this.router.navigate(['/rooms']);
          return;
        }
      },
      error: (error) => {
        console.error('Error in game updates:', error);
      }
    });
  }
  
  private refreshGameData() {
    if (!this.loading) {
      this.gameService.getGameById(this.gameId).subscribe({
        next: (response) => {
          console.log('Game data refreshed:', response);
          this.game = response.data.game;
          this.isMyTurn = response.data.isYourTurn;
          
          // Actualizar información del ganador
          if (this.game.winner_id) {
            const winnerPlayer = this.game.players.find((p: any) => p.id === this.game.winner_id);
            this.winner = winnerPlayer ? winnerPlayer.fullName || winnerPlayer.email : 'Desconocido';
          }
          
          // Recargar mis cartas
          this.loadMyCards();
        },
        error: (error) => {
          console.error('Error refreshing game data:', error);
        }
      });
    }
  }
  
  hitMe() {
    if (!this.isMyTurn || this.game?.winner_id) {
      return;
    }
    
    this.gameService.hitMe(this.gameId).subscribe({
      next: (response) => {
        console.log('Hit me successful:', response);
        // La actualización llegará por WebSocket
      },
      error: (error) => {
        console.error('Error hitting:', error);
        this.error = error.error?.message || 'Error al pedir carta';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
  
  endTurn() {
    if (!this.isMyTurn || this.game?.winner_id) {
      return;
    }
    
    this.gameService.endTurn(this.gameId).subscribe({
      next: (response) => {
        console.log('Turn ended successfully:', response);
        // La actualización llegará por WebSocket
      },
      error: (error) => {
        console.error('Error ending turn:', error);
        this.error = error.error?.message || 'Error al terminar turno';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
  
  checkBlackJack() {
    if (this.game?.winner_id) {
      return;
    }
    
    this.gameService.checkBlackJack(this.gameId).subscribe({
      next: (response) => {
        console.log('BlackJack check successful:', response);
        // La actualización llegará por WebSocket
      },
      error: (error) => {
        console.error('Error checking BlackJack:', error);
        this.error = error.error?.message || 'No tienes BlackJack';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
  
  leaveGame() {
    this.gameService.leaveGame(this.gameId).subscribe({
      next: () => {
        console.log('Left game successfully');
        this.router.navigate(['/rooms']);
      },
      error: (error) => {
        console.error('Error leaving game:', error);
        this.router.navigate(['/rooms']);
      }
    });
  }
  
  restartGame() {
    if (!this.isOwner() || !this.game.is_ended) {
      return;
    }
    
    this.gameService.restartGame(this.gameId).subscribe({
      next: (response) => {
        console.log('Game restarted successfully:', response);
        // Redirigir a la sala de espera para prepararse
        this.router.navigate(['/waiting-room', this.gameId]);
      },
      error: (error) => {
        console.error('Error restarting game:', error);
        this.error = error.error?.message || 'Error al reiniciar el juego';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
  
  isOwner(): boolean {
    return this.currentUser && this.game && this.currentUser.id === this.game.owner_id;
  }
  
  isPlayerTurn(playerId: number): boolean {
    if (!this.game || !this.game.player_ids) {
      return false;
    }
    const currentTurnIndex = this.game.turn;
    const playerIndex = this.game.player_ids.indexOf(playerId);
    return currentTurnIndex === playerIndex;
  }
}
