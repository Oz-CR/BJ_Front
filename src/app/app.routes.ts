import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Ingame } from './pages/ingame/ingame';
import { Rooms } from './pages/rooms/rooms';
import { WaitingRoom } from './pages/waiting-room/waiting-room';

export const routes: Routes = [
  { path: '', component: LandingPage, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'ingame', component: Ingame, canActivate: [authGuard] },
  { path: 'rooms', component: Rooms, canActivate: [authGuard] },
  { path: 'waiting-room/:id', component: WaitingRoom, canActivate: [authGuard] },
];
