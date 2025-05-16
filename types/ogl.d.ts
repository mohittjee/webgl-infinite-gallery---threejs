import { Renderer } from 'ogl-typescript';

export type OGLRenderingContext = WebGLRenderingContext & {
  renderer: Renderer;
  canvas: HTMLCanvasElement;
};