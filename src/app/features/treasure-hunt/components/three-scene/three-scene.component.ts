import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    private markerMeshes: THREE.Mesh[] = [];
    private mapObject!: THREE.Group;

    ngOnInit(): void {
        this.initScene();
        this.loadMap();
        this.animate();
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animationId);
        this.renderer.dispose();
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
        const intersects = this.raycaster.intersectObjects(this.mapObject.children);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.markerAdded.emit(point);
            this.addMarkerMesh(point, 'clue');
        }
    }

    private addMarkerMesh(position: THREE.Vector3, type: 'clue' | 'treasure'): void {
        const geom = new THREE.SphereGeometry(0.2, 16, 16);
        const mat = new THREE.MeshPhongMaterial({
            color: type === 'clue' ? 0x00ffcc : 0xffd700,
            emissive: type === 'clue' ? 0x00ffcc : 0xffd700,
            emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(position);
        mesh.position.y += 0.2;
        this.scene.add(mesh);
        this.markerMeshes.push(mesh);

        // Add a small light to the marker
        const light = new THREE.PointLight(mat.color, 0.5, 2);
        light.position.copy(mesh.position);
        this.scene.add(light);
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        // Animate markers
        const time = this.clock.getElapsedTime();
        this.markerMeshes.forEach((mesh, i) => {
            mesh.position.y += Math.sin(time * 2 + i) * 0.002;
        });

        this.renderer.render(this.scene, this.camera);
    }

    public clearMarkers(): void {
        this.markerMeshes.forEach(m => this.scene.remove(m));
        this.markerMeshes = [];
    }

    public setMarkers(markers: Marker[]): void {
        this.clearMarkers();
        markers.forEach(m => this.addMarkerMesh(m.position, m.type));
    }

    public focusOn(position: THREE.Vector3): void {
        const target = position.clone();
        target.y += 2;
        this.camera.position.lerp(target.add(new THREE.Vector3(2, 2, 2)), 0.1);
        this.controls.target.lerp(position, 0.1);
    }
}
