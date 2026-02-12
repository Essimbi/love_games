import { Component, OnInit, inject, PLATFORM_ID, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
    LucideAngularModule,
    Heart,
    MessageCircleHeart,
    Brain,
    MapPin,
    RotateCcw,
    Sparkles,
    ArrowRight,
    Pencil,
    Link,
    PartyPopper,
    ShieldCheck,
    Gift,
    Rocket,
    Palette,
    Star,
    ChevronDown,
    Clock,
    Quote
} from 'lucide-angular';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedY: number;
    opacity: number;
    angle: number;
    spin: number;
}

interface Sparkle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    life: number;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('heroCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private platformId = inject(PLATFORM_ID);
    private ctx: CanvasRenderingContext2D | null = null;
    private particles: Particle[] = [];
    private sparkles: Sparkle[] = [];
    private animationId: number | null = null;

    // Custom Cursor state
    private mouseX = 0;
    private mouseY = 0;
    private cursorX = 0;
    private cursorY = 0;

    // Parallax state
    private parallaxX = 0;
    private parallaxY = 0;

    private galleryInterval: any;
    private resizeListener: (() => void) | null = null;

    // Icons
    readonly Icons = {
        Heart, Sparkles, ArrowRight, MessageCircleHeart, Brain, MapPin,
        RotateCcw, Pencil, Link, PartyPopper, ShieldCheck, Gift,
        Rocket, Palette, Star, ChevronDown, Clock, Quote
    };

    surprisesCreated = 2347;
    daysToValentine = 0;

    games = [
        {
            id: 'secret-message',
            title: '💌 Message Crypté',
            description: 'Un secret qui se révèle une seule fois... Magique.',
            icon: MessageCircleHeart,
            route: '/secret-message/create',
            color: '#FF6B9D',
            duration: '2 min',
            tag: 'Mystère',
            image: '/assets/images/secret-message.png'
        },
        {
            id: 'memory',
            title: '🧠 Memory',
            description: 'Testez votre complicité avec vos propres photos.',
            icon: Brain,
            route: '/memory',
            color: '#C9184A',
            duration: '5 min',
            tag: 'Complicité',
            image: '/assets/images/memory.png'
        },
        {
            id: 'treasure-hunt',
            title: '🗺️ Chasse au Trésor',
            description: 'Un parcours d\'énigmes vers une surprise finale.',
            icon: MapPin,
            route: '/treasure-hunt',
            color: '#FF4D6D',
            duration: '10 min',
            tag: 'Aventure',
            image: '/assets/images/treasure-hunt.png'
        },
        {
            id: 'love-wheel',
            title: '🎡 Roue de l\'Amour',
            description: 'Laissez le destin décider de votre soirée.',
            icon: RotateCcw,
            route: '/love-wheel',
            color: '#FFB3C6',
            duration: 'Rapide',
            tag: 'Fun',
            image: '/assets/images/love-wheel.png'
        }
    ];

    steps = [
        {
            title: 'Créez',
            description: 'Personnalisez votre jeu en quelques clics',
            icon: Pencil
        },
        {
            title: 'Partagez',
            description: 'Un lien unique généré instantanément',
            icon: Link
        },
        {
            title: 'Émerveillez',
            description: 'Votre partenaire découvre votre surprise',
            icon: PartyPopper
        }
    ];

    features = [
        {
            title: '100% Sécurisé',
            description: 'Vos messages sont chiffrés. Même nous ne pouvons pas les lire.',
            icon: ShieldCheck,
            badge: 'AES-256'
        },
        {
            title: 'Totalement Gratuit',
            description: 'Sans abonnement ni frais cachés. L\'amour n\'a pas de prix.',
            icon: Gift,
            badge: 'L\'amour est gratuit'
        },
        {
            title: 'Sans Inscription',
            description: 'Créez votre surprise en 2 minutes, sans compte.',
            icon: Rocket,
            badge: 'Instantané'
        },
        {
            title: 'Personnalisable',
            description: 'Chaque jeu s\'adapte à votre histoire unique.',
            icon: Palette,
            badge: 'Unique'
        }
    ];

    galleryImages = [
        { url: '/assets/images/dinner.png', title: 'Dîners aux étoiles' },
        { url: '/assets/images/stargazing.png', title: 'Moments suspendus' },
        { url: '/assets/images/secret-message.png', title: 'Secrets partagés' }
    ];
    activeGalleryIndex = 0;

    testimonials = [
        {
            name: 'Marie',
            location: 'Paris',
            text: 'Le message crypté a fait pleurer mon copain de joie. C\'était tellement personnel et magique !',
            stars: 5,
            date: 'Février 2025'
        },
        {
            name: 'Thomas',
            location: 'Lyon',
            text: 'La chasse au trésor a transformé notre salon en aventure. Recommandé à 100% !',
            stars: 5,
            date: 'Janvier 2026'
        },
        {
            name: 'Léa',
            location: 'Genève',
            text: 'Super simple à utiliser et le rendu est vraiment premium. Mon mari a adoré.',
            stars: 5,
            date: 'Saint-Valentin 2025'
        }
    ];

    faqs = [
        {
            question: 'Mes données sont-elles vraiment sécurisées ?',
            answer: 'Absolument. Nous utilisons le chiffrement AES-256 côté client. Vos messages secrets ne sont stockés qu\'en version chiffrée sur nos serveurs.',
            isOpen: false
        },
        {
            question: 'Combien de temps mon jeu reste-t-il accessible ?',
            answer: 'Vos surprises restent accessibles pendant 30 jours. Pour les messages secrets, ils sont supprimés dès qu\'ils ont été vus le nombre de fois défini.',
            isOpen: false
        },
        {
            question: 'Puis-je modifier mon jeu après création ?',
            answer: 'Pour des raisons de sécurité et de chiffrement, un jeu ne peut pas être modifié une fois le lien généré. Mais vous pouvez en créer un nouveau en 1 minute !',
            isOpen: false
        },
        {
            question: 'Le destinataire doit-il créer un compte ?',
            answer: 'Non ! Votre partenaire clique sur votre lien et accède directement à l\'expérience. Aucune application à installer, aucune inscription requise.',
            isOpen: false
        }
    ];

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.calculateCountdown();
            this.setupIntersectionObserver();
            this.animateCounter();
            this.setupCustomCursor();
            window.addEventListener('scroll', this.onScroll);
            window.addEventListener('mousemove', this.onMouseMoveParallax);
            this.startGalleryTimer();
        }
    }

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.initCanvas();
        }
    }

    ngOnDestroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('scroll', this.onScroll);
            window.removeEventListener('mousemove', this.onMouseMoveParallax);
            if (this.resizeListener) {
                window.removeEventListener('resize', this.resizeListener);
            }
            this.stopGalleryTimer();
            const cursor = document.querySelector('.magic-cursor');
            if (cursor) cursor.remove();
        }
    }

    toggleFaq(index: number): void {
        this.faqs[index].isOpen = !this.faqs[index].isOpen;
    }

    private startGalleryTimer(): void {
        this.galleryInterval = setInterval(() => {
            this.nextGallerySlide();
        }, 2000);
    }

    private stopGalleryTimer(): void {
        if (this.galleryInterval) {
            clearInterval(this.galleryInterval);
        }
    }

    private nextGallerySlide(): void {
        this.activeGalleryIndex = (this.activeGalleryIndex + 1) % this.galleryImages.length;
    }

    private calculateCountdown(): void {
        const now = new Date();
        const valentine = new Date(now.getFullYear(), 1, 14);
        if (now > valentine) valentine.setFullYear(now.getFullYear() + 1);
        const diff = valentine.getTime() - now.getTime();
        this.daysToValentine = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    private animateCounter(): void {
        const target = this.surprisesCreated + Math.floor(Math.random() * 20);
        setInterval(() => {
            if (this.surprisesCreated < target) this.surprisesCreated++;
        }, 5000);
    }

    private setupIntersectionObserver(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }

    private onScroll = () => {
        const timeline = document.querySelector('.timeline-container');
        const progress = document.querySelector('.line-progress') as HTMLElement;
        if (timeline && progress) {
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const visible = windowHeight - rect.top;
            const percent = Math.min(100, Math.max(0, (visible / (rect.height + windowHeight * 0.5)) * 100));
            progress.style.width = `${percent}%`;
        }
    }

    private onMouseMoveParallax = (e: MouseEvent) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        // Calculate normalized parallax values (-1 to 1)
        this.parallaxX = (e.clientX / window.innerWidth) * 2 - 1;
        this.parallaxY = (e.clientY / window.innerHeight) * 2 - 1;

        // Apply parallax to hero content
        const heroContent = document.querySelector('.hero-content') as HTMLElement;
        if (heroContent) {
            const moveX = this.parallaxX * 20;
            const moveY = this.parallaxY * 20;
            heroContent.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }

        // Add sparkle on move
        if (Math.random() > 0.7) {
            this.addSparkle(e.clientX, e.clientY);
        }
    }

    private setupCustomCursor(): void {
        const cursor = document.createElement('div');
        cursor.className = 'magic-cursor';
        cursor.innerHTML = '❤️';
        document.body.appendChild(cursor);

        const updateCursor = () => {
            const dx = this.mouseX - this.cursorX;
            const dy = this.mouseY - this.cursorY;
            this.cursorX += dx * 0.15;
            this.cursorY += dy * 0.15;
            cursor.style.transform = `translate3d(${this.cursorX - 12}px, ${this.cursorY - 20}px, 0)`;
            requestAnimationFrame(updateCursor);
        };
        updateCursor();
    }

    private addSparkle(x: number, y: number): void {
        this.sparkles.push({
            x,
            y,
            size: Math.random() * 3 + 1,
            opacity: 1,
            life: 1
        });
    }

    // --- Canvas Heart Particles ---
    private initCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d');
        this.resizeCanvas();
        this.resizeListener = () => this.resizeCanvas();
        window.addEventListener('resize', this.resizeListener);
        for (let i = 0; i < 40; i++) this.particles.push(this.createParticle(true));
        this.animate();
    }

    private resizeCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    private createParticle(initial = false): Particle {
        return {
            x: Math.random() * window.innerWidth,
            y: initial ? Math.random() * window.innerHeight : window.innerHeight + 100,
            size: Math.random() * 15 + 10,
            speedY: Math.random() * 0.8 + 0.4,
            opacity: Math.random() * 0.4 + 0.1,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.01
        };
    }

    private drawHeart(x: number, y: number, size: number, opacity: number, angle: number): void {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
        this.ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
        this.ctx.fillStyle = `rgba(255, 107, 157, ${opacity})`;
        this.ctx.fill();
        this.ctx.restore();
    }

    private animate(): void {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Update & Draw Heart Particles
        this.particles.forEach((p, i) => {
            p.y -= p.speedY;
            p.angle += p.spin;
            this.drawHeart(p.x, p.y, p.size, p.opacity, p.angle);
            if (p.y < -50) this.particles[i] = this.createParticle();
        });

        // Update & Draw Sparkles
        this.sparkles.forEach((s, i) => {
            s.life -= 0.02;
            s.opacity = s.life;
            if (s.life <= 0) {
                this.sparkles.splice(i, 1);
                return;
            }
            if (!this.ctx) return;
            this.ctx.fillStyle = `rgba(255, 215, 0, ${s.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    goHome(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}
