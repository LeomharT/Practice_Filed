varying vec2 vUv;
varying vec3 vNormal;

uniform vec3 uColor;
uniform vec3 uLightDirection;

void main() {
  vec3 color  = uColor;
  vec3 normal = normalize(vNormal);

  vec3 direction = uLightDirection;
 
  float light = dot(normal, direction);
  light = smoothstep(-0.55, 1.0, light);

  color *= light;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
