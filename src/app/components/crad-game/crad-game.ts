import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-crad-game',
imports: [CommonModule],
  templateUrl: './crad-game.html',
  styleUrl: './crad-game.css',
})
export class CradGame {
  @Input() game?: any;
}
