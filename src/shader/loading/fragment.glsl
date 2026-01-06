varying vec2 vUv;

uniform float uTime;

void main(){
    vec2 uv = vUv;

    float r     = uv.x + uTime * 0.5;
          r     = fract(r);
          r     = smoothstep(-1.5, 1.0, r);
    vec3  color = vec3(r);

    gl_FragColor = vec4(color, 1.0);
}