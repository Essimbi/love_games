import { Routes } from '@angular/router';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

export const LEGAL_ROUTES: Routes = [
    {
        path: 'terms',
        component: TermsComponent
    },
    {
        path: 'privacy',
        component: PrivacyComponent
    }
];
