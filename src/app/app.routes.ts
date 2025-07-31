import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Ingame } from './pages/ingame/ingame';
import { Rooms } from './pages/rooms/rooms';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'ingame', component: Ingame },
  { path: 'rooms', component: Rooms },
];
