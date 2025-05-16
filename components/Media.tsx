import * as THREE from 'three';
import vertexShader from '../shaders/vertex.glsl';
import fragmentShader from '../shaders/fragment.glsl';

interface MediaProps {
  element: HTMLElement;
  scene: THREE.Scene;
  screen: { height: number; width: number };
  viewport: { height: number; width: number };
  height: number;
}

interface Sizes {
  height?: number;
  screen?: { height: number; width: number };
  viewport?: { height: number; width: number };
}

interface Scroll {
  ease: number;
  current: number;
  target: number;
  last: number;
}

export default class Media {
  element: HTMLElement;
  image: HTMLImageElement;
  scene: THREE.Scene;
  screen: { height: number; width: number };
  viewport: { height: number; width: number };
  height: number;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null;
  bounds: DOMRect | null;
  extra: number;
  isBefore: boolean;
  isAfter: boolean;

  constructor({ element, scene, screen, viewport, height }: MediaProps) {
    this.element = element;
    this.image = element.querySelector('img')!;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.height = height;
    this.extra = 0;
    this.isBefore = false;
    this.isAfter = false;
    this.mesh = null;
    this.bounds = null;

    this.createMesh();
    this.createBounds();
  }

  createMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.image.src);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uImageSizes: { value: new THREE.Vector2(0, 0) },
        uViewportSizes: { value: new THREE.Vector2(this.viewport.width, this.viewport.height) },
        uStrength: { value: 0 },
      },
      transparent: true,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // Set image sizes after texture loads
    const img = new Image();
    img.src = this.image.src;
    img.onload = () => {
      if (this.mesh) {
        this.mesh.material.uniforms.uImageSizes.value.set(img.naturalWidth, img.naturalHeight);
      }
    };
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();
    this.updateScale();
    this.updateX();
    this.updateY();
    if (this.mesh && this.bounds) {
      this.mesh.material.uniforms.uPlaneSizes.value.set(this.mesh.scale.x, this.mesh.scale.y);
    }
  }

  updateScale() {
    if (this.mesh && this.bounds) {
      this.mesh.scale.x = (this.viewport.width * this.bounds.width) / this.screen.width;
      this.mesh.scale.y = (this.viewport.height * this.bounds.height) / this.screen.height;
    }
  }

  updateX(x: number = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.x =
        -(this.viewport.width / 2) +
        this.mesh.scale.x / 2 +
        ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
    }
  }

  updateY(y: number = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.y =
        this.viewport.height / 2 -
        this.mesh.scale.y / 2 -
        ((this.bounds.top - y) / this.screen.height) * this.viewport.height -
        this.extra;
    }
  }

  update(scroll: Scroll, direction: 'up' | 'down') {
    this.updateY(scroll.current);
    if (this.mesh) {
      this.mesh.material.uniforms.uStrength.value = ((scroll.current - scroll.last) / this.screen.width) * 15;
    }

    if (this.mesh) {
      const planeOffset = this.mesh.scale.y / 2;
      const viewportOffset = this.viewport.height / 2;

      this.isBefore = this.mesh.position.y + planeOffset < -viewportOffset;
      this.isAfter = this.mesh.position.y - planeOffset > viewportOffset;

      if (direction === 'up' && this.isBefore) {
        this.extra -= this.height;
        this.isBefore = false;
        this.isAfter = false;
      }

      if (direction === 'down' && this.isAfter) {
        this.extra += this.height;
        this.isBefore = false;
        this.isAfter = false;
      }
    }
  }

  onResize(sizes: Sizes) {
    if (sizes) {
      if (sizes.height) this.height = sizes.height;
      if (sizes.screen) this.screen = sizes.screen;
      if (sizes.viewport) {
        this.viewport = sizes.viewport;
        if (this.mesh) {
          this.mesh.material.uniforms.uViewportSizes.value.set(this.viewport.width, this.viewport.height);
        }
      }
    }
    this.extra = 0;
    this.createBounds();
  }
}