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
              <li><a routerLink="/memory">Memory Photos</a></li>
              <li><a routerLink="/treasure-hunt">Parcours Surprise</a></li>
              <li><a routerLink="/love-wheel">Roue de l'Amour</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><a>Conditions d'Utilisation</a></li>
              <li><a>Politique de Confidentialité</a></li>
              <li><a>Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>Fait avec ❤️ pour la Saint-Valentin 2026. © Valentine Games Platform.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .main-footer {
      padding: 6rem 0 3rem;
      background: #1a0a19;
      color: rgba(255, 255, 255, 0.6);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 107, 157, 0.3), transparent);
      }
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 4rem;
      margin-bottom: 4rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.8rem;
      font-weight: 900;
      color: white;
      margin-bottom: 1.5rem;

      .footer-logo-img {
        width: 45px;
        height: 45px;
        object-fit: contain;
        animation: heartBeat 2s infinite;
        filter: drop-shadow(0 0 10px rgba(255, 0, 85, 0.5));
      }
    }

    .slogan {
      font-style: italic;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    h4 {
      color: white;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.75rem;

        a {
          color: inherit;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: inline-block;

          &:hover {
            color: #FF6B9D;
            transform: translateX(5px);
          }
        }
      }
    }

    .footer-bottom {
      padding-top: 3rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
      font-size: 0.9rem;
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    @media (max-width: 768px) {
      .main-footer { padding: 4rem 0 2rem; }
      .footer-grid { gap: 2rem; text-align: center; }
      .footer-logo { justify-content: center; }
      ul li a:hover { transform: none; }
    }
  `]
})
export class FooterComponent {
  readonly Heart = Heart;
}
