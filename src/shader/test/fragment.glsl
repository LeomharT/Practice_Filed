varying vec2 vUv;

uniform float uRatio;
uniform float uRadius;

void main() {
  vec3  color  = vec3(1.0);
  float border = 0.02;
  float ratio  = uRatio;
  float radius = uRadius;

  vec2 uv    = vUv;
       uv.y /= ratio;

  vec2 center    = vec2(0.5);
       center.y /= ratio;

  vec2 halfSize = abs(uv - center);

  vec2 p = halfSize - (center - (radius + border));

  float dist = length(p);

  if(p.x > 0.0 && p.y > 0.0){
    if(dist > (radius + border)) discard;
  }

  if(uv.y < border || uv.y > 1.0 / ratio - border) color = vec3(0.0);
  if(uv.x < border || uv.x > 1.0 - border) color = vec3(0.0);

  p = halfSize - center + radius + border;

  dist = length(p);
  
  if(p.x > 0.0 && p.y > 0.0) {
    if(dist > radius) color = vec3(0.0);
  }

  gl_FragColor = vec4(color, 1.0);
}
