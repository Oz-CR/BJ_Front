import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Game {
  _id: string;
  name: string;
  owner_id: number;
  pack?: any[];
  is_active: boolean;
  is_ended: boolean;
  player_ids: number[];
  turn: number;
  winner_id?: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private socket: Socket;
  private games$ = new BehaviorSubject<Game[]>([]);
  private gameUpdates$ = new BehaviorSubject<any>(null);
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {
    // Ajusta la URL si tu servidor WS corre en otro host/puerto
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      // Solicita partidas en cuanto se conecta
      this.findGames();
    });

    this.socket.on('available_games', (games: Game[]) => {
      console.log('Received games from server:', games);
      this.games$.next(games);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
    
    this.socket.on('game_list_updated', () => {
      console.log('Game list updated, refreshing...');
      this.findGames();
    });

    // Eventos específicos para sala de espera
    this.socket.on('player_joined', (data) => {
      console.log('Player joined game:', data);
      // Emitir evento para que los componentes puedan reaccionar
    });

    this.socket.on('player_left', (data) => {
      console.log('Player left game:', data);
      // Emitir evento para que los componentes puedan reaccionar
    });

    this.socket.on('game_started', (data) => {
      console.log('Game started:', data);
      // Emitir evento para que los componentes puedan reaccionar
    });

    console.log('GameService initialized and connecting to WebSocket server');
  }

  findGames() {
    this.socket.emit('find_available_games');
  }

  getGames(): Observable<Game[]> {
    return this.games$.asObservable();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  createGame(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-game`, { name }, {
      headers: this.getAuthHeaders()
    });
  }

  joinGame(gameId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/join`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getGameById(gameId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}`, {
      headers: this.getAuthHeaders()
    });
  }

  startGame(gameId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/start`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  leaveGame(gameId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/leave`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Métodos para manejar WebSocket en sala de espera
  joinGameRoom(gameId: string) {
    this.socket.emit('join_game_room', { gameId });
  }

  leaveGameRoom(gameId: string) {
    this.socket.emit('leave_game_room', { gameId });
  }

  // Observable para escuchar actualizaciones de juego
  getGameUpdates(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('gameNotify', (data) => {
        console.log('GameNotify received:', data);
        observer.next(data);
      });

      this.socket.on('player_joined', (data) => {
        console.log('Player joined event:', data);
        observer.next({ type: 'player_joined', data });
      });

      this.socket.on('player_left', (data) => {
        console.log('Player left event:', data);
        observer.next({ type: 'player_left', data });
      });

      this.socket.on('host_left', (data) => {
        console.log('Host left event:', data);
        observer.next({ type: 'host_left', data });
      });

      this.socket.on('game_started', (data) => {
        console.log('Game started event:', data);
        observer.next({ type: 'game_started', data });
      });

      return () => {
        this.socket.off('gameNotify');
        this.socket.off('player_joined');
        this.socket.off('player_left');
        this.socket.off('host_left');
        this.socket.off('game_started');
      };
    });
  }
}
