import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface Marker {
    id: string;
    position: THREE.Vector3;
    type: 'clue' | 'treasure';
    number?: number;
}

@Component({
    selector: 'app-three-scene',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #container class="three-container">
      <div class="overlay" *ngIf="loading">
        <div class="loader"></div>
        <p>Loading 3D World...</p>
      </div>
    </div>
  `,
    styles: [`
    .three-container {
      width: 100%;
      height: 400px;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #000;
    }
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      z-index: 10;
    }
    .loader {
      border: 4px solid rgba(255,255,255,0.1);
      border-left-color: #FF0055;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ThreeSceneComponent implements OnInit, OnDestroy {
    @ViewChild('container', { static: true }) containerRef!: ElementRef;

    @Input() mode: 'create' | 'play' = 'create';
    @Input() mapId: string = 'midnight-city';
    @Input() markers: Marker[] = [];

    @Output() markerAdded = new EventEmitter<THREE.Vector3>();
    @Output() markerSelected = new EventEmitter<string>();

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private clock = new THREE.Clock();
    private animationId!: number;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();

    loading = true;
    private isBrowser: boolean;
    private markerMeshes: THREE.Mesh[] = [];
    private mapObject!: THREE.Group;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        if (!this.isBrowser) return;
        this.initScene();
        this.loadMap();
        this.animate();
    }

    ngOnDestroy(): void {
        if (!this.isBrowser) return;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a050a);
        this.scene.fog = new THREE.FogExp2(0x0a050a, 0.05);

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.containerRef.nativeElement.clientWidth / this.containerRef.nativeElement.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(
            this.containerRef.nativeElement.clientWidth,
            this.containerRef.nativeElement.clientHeight
        );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.containerRef.nativeElement.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFF0055, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        this.addStarField();
        this.addParticles();

        if (this.mode === 'create') {
            this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
        }
    }

    private loadMap(): void {
        // Fictional 3D Map creation
        this.mapObject = new THREE.Group();

        // Base platform
        const geometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x1a0a1a,
            emissive: 0x0a050a
        });
        const platform = new THREE.Mesh(geometry, material);
        this.mapObject.add(platform);

        // Neon grid
        const grid = new THREE.GridHelper(10, 10, 0xFF0055, 0x444444);
        grid.position.y = 0.26;
        this.mapObject.add(grid);

        // Some decorative "Neon" pillars
        for (let i = 0; i < 5; i++) {
            const pillarGeom = new THREE.BoxGeometry(0.5, Math.random() * 3 + 1, 0.5);
            const pillarMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc });
            const pillar = new THREE.Mesh(pillarGeom, pillarMat);
            const angle = (i / 5) * Math.PI * 2;
            pillar.position.set(Math.cos(angle) * 3, pillarGeom.parameters.height / 2, Math.sin(angle) * 3);
            this.mapObject.add(pillar);
        }

        this.scene.add(this.mapObject);
        this.loading = false;
    }

    private onMouseClick(event: MouseEvent): void {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Intersect with the platform/map but NOT the markers themselves to prevent stacking on markers
        const intersects = this.raycaster.intersectObjects(this.mapObject.children);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.markerAdded.emit(point);
            // We NO LONGER call addMarkerMesh here directly. 
            // The parent will call setMarkers which will update everything correctly.
        }
    }

    private createLabelCanvas(text: string, color: string): THREE.CanvasTexture | null {
        if (!this.isBrowser) return null;
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color;
            ctx.font = 'bold 40px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    private addMarkerMesh(position: THREE.Vector3, type: 'clue' | 'treasure', labelNumber?: number): void {
        const group = new THREE.Group();
        group.position.copy(position);
        group.position.y += 0.2; // Platform height offset

        // Sphere
        const geom = new THREE.SphereGeometry(0.2, 16, 16);
        const color = type === 'clue' ? 0x00ffcc : 0xffd700;
        const mat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geom, mat);
        group.add(mesh);

        // Label (Sprite)
        const labelText = type === 'treasure' ? '★' : (labelNumber ? labelNumber.toString() : '');
        if (labelText && this.isBrowser) {
            const texture = this.createLabelCanvas(labelText, type === 'clue' ? '#00ffcc' : '#ffd700');
            if (texture) {
                const labelMat = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true
                });
                const sprite = new THREE.Sprite(labelMat);
                sprite.scale.set(0.6, 0.6, 0.6);
                sprite.position.y = 0.5;
                group.add(sprite);
            }
        }

        // Light
        const light = new THREE.PointLight(color, 0.6, 3);
        light.position.y = 0.2;
        group.add(light);

        this.scene.add(group);
        this.markerMeshes.push(group as any); // Storing as Mesh for compatibility with current clearMarkers
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        // Rotate starfield
        const stars = this.scene.getObjectByName('starField');
        if (stars) stars.rotation.y += 0.0001;

        // Animate particles
        const particles = this.scene.getObjectByName('stardust');
        if (particles) {
            const positions = (particles as THREE.Points).geometry.attributes['position'].array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
            }
            (particles as THREE.Points).geometry.attributes['position'].needsUpdate = true;
        }

        // Animate markers
        const time = this.clock.getElapsedTime();
        this.markerMeshes.forEach((mesh, i) => {
            mesh.position.y += Math.sin(time * 2 + i) * 0.002;
        });

        this.renderer.render(this.scene, this.camera);
    }

    private addStarField(): void {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'starField';
        this.scene.add(stars);
    }

    private addParticles(): void {
        const pGeometry = new THREE.BufferGeometry();
        const pMaterial = new THREE.PointsMaterial({
            color: 0x00ffcc,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const pVertices = [];
        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = Math.random() * 10;
            const z = (Math.random() - 0.5) * 20;
            pVertices.push(x, y, z);
        }

        pGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pVertices, 3));
        const particles = new THREE.Points(pGeometry, pMaterial);
        particles.name = 'stardust';
        this.scene.add(particles);
    }

    public clearMarkers(): void {
        if (!this.isBrowser) return;
        this.markerMeshes.forEach(m => this.scene.remove(m));
        this.markerMeshes = [];
    }

    public setMarkers(markers: Marker[]): void {
        if (!this.isBrowser) return;
        this.clearMarkers();
        markers.forEach(m => this.addMarkerMesh(m.position, m.type, m.number));
    }

    public focusOn(position: THREE.Vector3): void {
        if (!this.isBrowser) return;
        const target = position.clone();
        target.y += 2;
        this.camera.position.lerp(target.add(new THREE.Vector3(2, 2, 2)), 0.1);
        this.controls.target.lerp(position, 0.1);
    }
}
