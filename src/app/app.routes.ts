import { Routes } from '@angular/router';
import { HOME_ROUTES } from './features/home/home.routes';
import { SECRET_MESSAGE_ROUTES } from './features/secret-message/secret-message.routes';
import { MEMORY_GAME_ROUTES } from './features/memory-game/memory-game.routes';
import { TREASURE_HUNT_ROUTES } from './features/treasure-hunt/treasure-hunt.routes';
import { LOVE_WHEEL_ROUTES } from './features/love-wheel/love-wheel.routes';
import { LEGAL_ROUTES } from './features/legal/legal.routes';

export const routes: Routes = [
  {
    path: '',
    children: HOME_ROUTES
  },
  {
    path: 'secret-message',
    children: SECRET_MESSAGE_ROUTES
  },
  {
    path: 'memory',
    children: MEMORY_GAME_ROUTES
  },
  {
    path: 'treasure-hunt',
    children: TREASURE_HUNT_ROUTES
  },
  {
    path: 'love-wheel',
    children: LOVE_WHEEL_ROUTES
  },
  {
    path: '',
    children: LEGAL_ROUTES
  },
  {
    path: '',
    redirectTo: '/secret-message/create',
    pathMatch: 'full'
  }
];
