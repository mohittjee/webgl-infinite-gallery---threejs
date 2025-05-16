export function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}