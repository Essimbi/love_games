import { Routes } from '@angular/router';
import { MemoryGameCreateComponent } from './components/create/create.component';
import { MemoryGamePlayComponent } from './components/play/play.component';

export const MEMORY_GAME_ROUTES: Routes = [
  {
    path: 'create',
    component: MemoryGameCreateComponent
  },
  {
    path: ':id',
    component: MemoryGamePlayComponent
  }
];
