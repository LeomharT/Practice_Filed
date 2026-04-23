#define GOLDEN_RATIO 1.61803398875

varying vec2 vUv;

void main() {
  vec3 color       = vec3(1.0);
  vec3 borderColor = vec3(0.0);

  float border = 0.02;
  float ratio  = 1.0 / GOLDEN_RATIO;

  float radius = 0.1;
        radius = min(radius, 0.5);

  vec2 uv    = vUv;
       uv.y /= ratio;

  vec2 center    = vec2(0.5);
       center.y /= ratio;

  vec2 halfSize = abs(uv - center);

  vec2 p = halfSize - (center - (radius + border));

  float dist = length(p);

  if(p.x > 0.0 && p.y > 0.0) {
    float s = step(dist, (radius + border));
    if(!bool(s)) discard;
  }

  if(uv.x < border || uv.x > 1.0 - border) color = borderColor;
  if(uv.y < border || uv.y > 1.0 / ratio - border) color = borderColor;

  p = halfSize - (center - radius - border);

  dist = length(p);

  if(p.x > 0.0 && p.y > 0.0) {
    if(dist > radius) color = borderColor;
  }

  gl_FragColor = vec4(color, 1.0);
}
