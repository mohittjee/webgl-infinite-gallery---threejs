"use client";
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Media from './Media';
import { lerp } from '../utils/math';
import NormalizeWheel from 'normalize-wheel';

interface Scroll {
  ease: number;
  current: number;
  target: number;
  last: number;
}

const App: React.FC = () => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const screenRef = useRef<{ height: number; width: number }>({ height: 0, width: 0 });
  const viewportRef = useRef<{ height: number; width: number }>({ height: 0, width: 0 });
  const mediasRef = useRef<Media[]>([]);
  const galleryRef = useRef<HTMLElement | null>(null);
  const galleryHeightRef = useRef<number>(0);
  const scrollRef = useRef<Scroll>({ ease: 0.1, current: 0, target: 0, last: 0 });
  const directionRef = useRef<'up' | 'down'>('down');
  const speedRef = useRef<number>(0.5);
  const isDownRef = useRef<boolean>(false);
  const startRef = useRef<number>(0);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    const createRenderer = () => {
      rendererRef.current = new THREE.WebGLRenderer({ alpha: true });
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current.domElement.style.position = 'fixed';
      rendererRef.current.domElement.style.top = '0';
      rendererRef.current.domElement.style.left = '0';
      rendererRef.current.domElement.style.width = '100%';
      rendererRef.current.domElement.style.height = '100%';
      document.body.appendChild(rendererRef.current.domElement);
    };

    const createCamera = () => {
      cameraRef.current = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      cameraRef.current.position.z = 5;
    };

    const createScene = () => {
      sceneRef.current = new THREE.Scene();
    };

    const createGallery = () => {
      galleryRef.current = document.querySelector('.demo-1__gallery');
    };

    const createMedias = () => {
      const mediasElements = document.querySelectorAll('.demo-1__gallery__figure');
      mediasRef.current = Array.from(mediasElements).map(
        (element) =>
          new Media({
            element: element as HTMLElement,
            scene: sceneRef.current!,
            screen: screenRef.current,
            viewport: viewportRef.current,
            height: galleryHeightRef.current,
          })
      );
    };

    const onResize = () => {
      screenRef.current = {
        height: window.innerHeight,
        width: window.innerWidth,
      };

      rendererRef.current!.setSize(screenRef.current.width, screenRef.current.height);

      cameraRef.current!.aspect = screenRef.current.width / screenRef.current.height;
      cameraRef.current!.updateProjectionMatrix();

      const fov = cameraRef.current!.fov * (Math.PI / 180);
      const height = 2 * Math.tan(fov / 2) * cameraRef.current!.position.z;
      const width = height * cameraRef.current!.aspect;

      viewportRef.current = { height, width };

      if (galleryRef.current) {
        const galleryBounds = galleryRef.current.getBoundingClientRect();
        galleryHeightRef.current = viewportRef.current.height * galleryBounds.height / screenRef.current.height;
      }

      mediasRef.current.forEach((media) =>
        media.onResize({
          height: galleryHeightRef.current,
          screen: screenRef.current,
          viewport: viewportRef.current,
        })
      );
    };

    const onWheel = (event: WheelEvent) => {
      const normalized = NormalizeWheel(event);
      const speed = normalized.pixelY;
      scrollRef.current.target += speed * 1;
    };

    const onTouchDown = (event: MouseEvent | TouchEvent) => {
      isDownRef.current = true;
      scrollPositionRef.current = scrollRef.current.current;
      startRef.current = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    };

    const onTouchMove = (event: MouseEvent | TouchEvent) => {
      if (!isDownRef.current) return;
      const y = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
      const distance = (startRef.current - y) * 0.1;
      scrollRef.current.target = scrollPositionRef.current + distance;
    };

    const onTouchUp = () => {
      isDownRef.current = false;
    };

    const update = () => {
      scrollRef.current.target += speedRef.current;
      scrollRef.current.current = lerp(scrollRef.current.current, scrollRef.current.target, scrollRef.current.ease);

      if (scrollRef.current.current > scrollRef.current.last) {
        directionRef.current = 'down';
        speedRef.current = 1.5;
      } else if (scrollRef.current.current < scrollRef.current.last) {
        directionRef.current = 'up';
        speedRef.current = -1.5;
      }

      mediasRef.current.forEach((media) => media.update(scrollRef.current, directionRef.current));

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);

      scrollRef.current.last = scrollRef.current.current;

      requestAnimationFrame(update);
    };

    const addEventListeners = () => {
      window.addEventListener('resize', onResize);
      window.addEventListener('wheel', onWheel);
      window.addEventListener('mousedown', onTouchDown);
      window.addEventListener('mousemove', onTouchMove);
      window.addEventListener('mouseup', onTouchUp);
      window.addEventListener('touchstart', onTouchDown);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchUp);
    };

    createRenderer();
    createCamera();
    createScene();
    createGallery();
    createMedias();
    onResize();
    update();
    addEventListeners();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousedown', onTouchDown);
      window.removeEventListener('mousemove', onTouchMove);
      window.removeEventListener('mouseup', onTouchUp);
      window.removeEventListener('touchstart', onTouchDown);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchUp);
    };
  }, []);

  return null;
};

export default App;