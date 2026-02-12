import { Routes } from '@angular/router';
import { TreasureHuntCreateComponent } from './components/create/create.component';
import { TreasureHuntPlayComponent } from './components/play/play.component';

export const TREASURE_HUNT_ROUTES: Routes = [
  {
    path: 'create',
    component: TreasureHuntCreateComponent
  },
  {
    path: ':id',
    component: TreasureHuntPlayComponent
  }
];
