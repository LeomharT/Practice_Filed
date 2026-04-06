varying float vH;
varying vec2 vUv;

void main(){
    float h      = vH;
    float aspect = 3.0 / 4.0;
    vec3  color  = vec3(1.0);

    vec2 uv    = vUv;
         uv.y /= aspect;

    vec2 center    = vec2(0.5);
         center.y /= aspect;

    vec2 halfSize = uv - center;

    gl_FragColor = vec4(color, 1.0);
}