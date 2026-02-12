import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './privacy.component.html',
    styleUrls: ['../terms/terms.component.scss'] // Reusing styles from Terms page for consistency
})
export class PrivacyComponent { }
