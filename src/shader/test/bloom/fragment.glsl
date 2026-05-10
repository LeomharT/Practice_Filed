varying vec2 vUv;

uniform sampler2D uDiffuse;

void main() {
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    vec4 diffuse = texture2D(uDiffuse, uv);

    color = diffuse.rgb;

    gl_FragColor = vec4(color, 1.0);
}
