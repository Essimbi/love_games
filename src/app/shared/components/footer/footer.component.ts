import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Heart } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="footer-logo">
              <img src="/assets/images/love_logo.png" alt="Valentine Games Logo" class="footer-logo-img">
              <span>Valentine Games</span>
            </div>
            <p class="slogan">L'amour se partage, les souvenirs restent. Créez des moments inoubliables pour ceux qui comptent vraiment.</p>
          </div>
          
          <div class="footer-col">
            <h4>Expériences</h4>
            <ul>
              <li><a routerLink="/secret-message/create">Messages Cryptés</a></li>
              <li><a routerLink="/memory/create">Memory Photos</a></li>
              <!-- <li><a routerLink="/treasure-hunt">Parcours Surprise</a></li> -->
              <li><a routerLink="/love-wheel/create">Roue de l'Amour</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><a routerLink="/terms">Conditions d'Utilisation</a></li>
              <li><a routerLink="/privacy">Politique de Confidentialité</a></li>
              <!-- <li><a>Cookies</a></li> -->
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>Fait avec ❤️ pour la Saint-Valentin 2026. © Valentine Games By Eslojo Deranot.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  readonly Heart = Heart;
}
