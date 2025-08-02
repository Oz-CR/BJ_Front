import { Injectable } from '@angular/core';
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

  constructor() {
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

    console.log('GameService initialized and connecting to WebSocket server');
  }

  findGames() {
    this.socket.emit('find_available_games');
  }

  getGames(): Observable<Game[]> {
    return this.games$.asObservable();
  }
}
