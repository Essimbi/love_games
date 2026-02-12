import { Routes } from '@angular/router';
import { LoveWheelCreateComponent } from './components/create/create.component';
import { LoveWheelPlayComponent } from './components/play/play.component';

export const LOVE_WHEEL_ROUTES: Routes = [
  {
    path: 'create',
    component: LoveWheelCreateComponent
  },
  {
    path: ':id',
    component: LoveWheelPlayComponent
  }
];
