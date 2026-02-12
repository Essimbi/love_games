import { Routes } from '@angular/router';
import { SecretMessageCreateComponent } from './components/create/create.component';
import { SecretMessageViewComponent } from './components/view/view.component';

export const SECRET_MESSAGE_ROUTES: Routes = [
  {
    path: 'create',
    component: SecretMessageCreateComponent
  },
  {
    path: ':id',
    component: SecretMessageViewComponent
  }
];
