varying vec3 vNormal;

uniform vec3 uColor;

void main(){
  vec3 color     = vec3(1.0);
  vec3 normal    = normalize(vNormal);
  vec3 direction = normalize(vec3(0.0, 1.0, 3.0));

  float light = dot(normal, direction);
        light = max(0.175, light);

  color = light * uColor;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}