varying vec3 vPosition;
varying vec2 vUv;

uniform vec3 uColor;

#include <simplex3DNoise>

void main() {
  vec2  uv            = vUv;
  vec3  color         = uColor;
  vec3  worldPosition = vPosition;

  vec3  lineColor = vec3(1.0, 1.0, 1.0);
  float lineWidth = 0.02;
  float lineGap   = 1.0 / 10.0;

  float gx = fract(uv.x / lineGap);
  float gy = fract(uv.y / lineGap);

  float aaX = fwidth(gx);
  float aaY = fwidth(gy);
  
  float lineX = smoothstep(lineWidth + aaX, lineWidth - aaX, gx);
  float lineY = smoothstep(lineWidth + aaY, lineWidth - aaY, gy);

  float grid = max(lineX, lineY);

  color = mix(color, lineColor, grid);

  gl_FragColor = vec4(color, 0.4);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
