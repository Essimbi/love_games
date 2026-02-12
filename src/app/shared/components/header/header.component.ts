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
          <a routerLink="/memory/create" class="nav-link" routerLinkActive="active">
            <span>Memory</span>
            <div class="underline"></div>
          </a>
          <!-- <a routerLink="/treasure-hunt" class="nav-link" routerLinkActive="active">
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
  styleUrls: ['./header.component.scss']
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
