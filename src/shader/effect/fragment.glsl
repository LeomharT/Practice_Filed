varying vec2 vUv;

uniform sampler2D uDiffuse;

void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    float r = texture2D(uDiffuse, uv - 0.001).r;
    float g = texture2D(uDiffuse, uv).g;
    float b = texture2D(uDiffuse, uv + 0.001).b;

    color = vec3(r, g, b);

    gl_FragColor = vec4(color, 1.0);
}