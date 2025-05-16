varying vec2 vUv;

uniform float uStrength;
uniform vec2 uViewportSizes;

void main() {
  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
  newPosition.z += sin(newPosition.y / uViewportSizes.y * 3.14159 + 3.14159 / 2.0) * -uStrength;
  vUv = uv;
  gl_Position = projectionMatrix * newPosition;
}