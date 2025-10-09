varying vec2 vUv;

uniform vec3 uColor;
uniform vec3 uEdgeColor;

void main() {
    vec2  uv               = vUv;
    float alpha            = 0.0;
    vec3  color            = vec3(0.0);
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);
    float edgeWidth        = 0.01;

    if(distanceToCenter > 0.5) {
        discard;
    }

    if(distanceToCenter < 0.5 && distanceToCenter > 0.5 - edgeWidth) {
        color = uEdgeColor;
        alpha = 1.0;
    }

    // Gird
    float girdWidth = 0.05;

    vec2 girdUv = vUv;
    girdUv *= 20.0;
    girdUv = fract(girdUv);

    if(girdUv.x < girdWidth) {
        color = uColor;
        alpha = 1.0;
    }
    if(girdUv.y < girdWidth) {
        color = uColor;
        alpha = 1.0;
    }

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}