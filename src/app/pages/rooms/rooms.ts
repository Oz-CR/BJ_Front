import { Component } from '@angular/core';
import { CradGame } from '../../components/crad-game/crad-game';
import { FormRoom } from '../../components/form-room/form-room';

@Component({
  selector: 'app-rooms',
  imports: [CradGame, FormRoom],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms {}
