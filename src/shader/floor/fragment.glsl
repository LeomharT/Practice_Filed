varying vec2 vUv;


void main() {
    vec2  uv               = vUv;
    vec3  color            = vec3(1.0, 0.25, 0.752);
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);
    float edgeWidth        = 0.01;

    if(distanceToCenter > 0.5) {
        discard;
    }

    if(distanceToCenter < 0.5 && distanceToCenter > 0.5 - edgeWidth) {
        color = vec3(1.0);
    }

    gl_FragColor = vec4(color, 1.0);
}