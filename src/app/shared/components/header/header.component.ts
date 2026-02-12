import { Component, OnInit, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import {
  LucideAngularModule,
  Heart,
  Mail,
  Brain,
  MapPin,
  RotateCcw,
  Sparkles,
  Menu,
  X
} from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <header class="header" [class.transparent]="isTransparent && isHome" [class.scrolled]="isScrolled">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo" routerLink="/">
          <div class="logo-icon-wrapper">
            <img src="/assets/images/love_logo.png" alt="Valentine Games Logo" class="logo-img">
            <div class="logo-glow"></div>
          </div>
          <h1>Valentine <span class="light">Games</span></h1>
        </div>

        <!-- Desktop Nav -->
        <nav class="nav desktop-only">
          <a routerLink="/secret-message/create" class="nav-link" routerLinkActive="active">
            <span>Messages</span>
            <div class="underline"></div>
          </a>
          <!-- <a routerLink="/memory" class="nav-link" routerLinkActive="active">
            <span>Memory</span>
            <div class="underline"></div>
          </a>
          <a routerLink="/treasure-hunt" class="nav-link" routerLinkActive="active">
            <span>Parcours</span>
            <div class="underline"></div>
          </a> -->
          <a routerLink="/love-wheel/create" class="nav-link" routerLinkActive="active">
            <span>Roue</span>
            <div class="underline"></div>
          </a>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <a routerLink="/secret-message/create" 
             class="btn-cta-nav desktop-only" 
             [class.visible]="isScrolled || !isHome">
            Créer ma surprise
            <lucide-icon [name]="Sparkles" class="mini-icon"></lucide-icon>
          </a>
          <button class="menu-toggle mobile-only" 
            [class.menu-open]="isMenuOpen" 
            (click)="toggleMenu()">
            <lucide-icon [name]="isMenuOpen ? X : Menu"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="isMenuOpen">
        <nav class="mobile-nav">
          <a routerLink="/secret-message/create" (click)="isMenuOpen = false">Messages</a>
          <a routerLink="/memory" (click)="isMenuOpen = false">Memory</a>
          <a routerLink="/treasure-hunt" (click)="isMenuOpen = false">Parcours</a>
          <a routerLink="/love-wheel" (click)="isMenuOpen = false">Roue</a>
          <hr>
          <a routerLink="/secret-message/create" class="btn-primary" (click)="isMenuOpen = false">Créer ma surprise</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #FF0055 0%, #C9184A 100%);
      color: white;
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

      &.transparent {
        background: transparent;
        padding: 1.75rem 0;
      }

      &.scrolled {
        background: rgba(15, 5, 20, 0.85);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        color: white;
        padding: 0.75rem 0;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(255, 0, 85, 0.2);

        .logo-img { filter: drop-shadow(0 0 10px rgba(255, 0, 85, 0.5)); }
        .nav-link { 
          color: rgba(255, 255, 255, 0.7); 
          &:hover { color: #FF0055; }
          &.active { color: #FF0055; }
        }
        .menu-toggle { color: white; }
      }
    }

    .header-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    // --- Logo ---
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      z-index: 1001;
      
      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -1px;
        .light { font-weight: 300; opacity: 0.9; }
      }
      
      .logo-icon-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        transition: all 0.4s ease;
        z-index: 2;
      }

      .logo-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        background: #FF6B9D;
        filter: blur(15px);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      &:hover {
        .logo-img { transform: scale(1.2) rotate(10deg); filter: drop-shadow(0 0 15px rgba(255, 0, 85, 0.6)); }
        .logo-glow { opacity: 0.5; background: #FF0055; }
      }
    }

    // --- Desktop Nav ---
    .nav {
      display: flex;
      gap: 2.5rem;

      .nav-link {
        color: white;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.95rem;
        position: relative;
        padding: 0.5rem 0;
        transition: color 0.3s ease;

        .underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #FF0055;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px #FF0055;
        }

        &:hover .underline, &.active .underline {
          width: 100%;
        }
      }
    }

    // --- Actions ---
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .btn-cta-nav {
      background: #FFD700;
      color: #2D132C;
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.85rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      opacity: 0;
      transform: translateY(-10px);
      pointer-events: none;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);

      &.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .mini-icon { width: 14px; height: 14px; }

      &:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 0, 85, 0.5);
        background: white;
        color: #FF0055;
      }
    }

    .menu-toggle {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1002;
      transition: color 0.3s ease;

      &.menu-open {
        color: #2D132C; /* Dark color for white menu background */
      }
    }

    // --- Mobile Menu ---
    .mobile-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      height: 100vh;
      background: white;
      z-index: 1000;
      transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;

      &.open { right: 0; }

      .mobile-nav {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        text-align: center;
        width: 100%;
        padding: 2rem;

        a {
          font-size: 1.5rem;
          font-weight: 800;
          color: #2D132C;
          text-decoration: none;
          
          &.btn-primary {
            background: #FF6B9D;
            color: white;
            padding: 1rem;
            border-radius: 15px;
            font-size: 1.1rem;
          }
        }
        
        hr { border: none; border-top: 1px solid rgba(0,0,0,0.05); margin: 1rem 0; }
      }
    }

    // --- Utilities ---
    .desktop-only { display: none; }
    @media (min-width: 1024px) { .desktop-only { display: flex; } }
    .mobile-only { display: block; }
    @media (min-width: 1024px) { .mobile-only { display: none; } }

    @media (max-width: 1024px) {
      .header { padding: 0.75rem 0; }
      .header-container { padding: 0 1.25rem; }
      .logo h1 { font-size: 1.3rem; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isScrolled = false;
  isTransparent = true;
  isHome = false;
  isMenuOpen = false;

  readonly Heart = Heart;
  readonly Sparkles = Sparkles;
  readonly Menu = Menu;
  readonly X = X;

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHome = event.url === '/' || event.url === '/home';
      this.isMenuOpen = false;
    });

    this.isHome = this.router.url === '/' || this.router.url === '/home';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}
