varying vec2 vUv;

uniform float uTime;
uniform vec3 uWaveColor;

void main(){
    vec3 color  = vec3(1.0);
    vec2 center = vec2(0.5);
    vec2 uv     = vUv;

    float distanceToCenter = distance(center, uv);

    if(distanceToCenter > 0.5) discard;

    distanceToCenter = smoothstep(0.0, 0.95, distanceToCenter);
    distanceToCenter *= 8.0;
    distanceToCenter -= uTime * 0.5;
    distanceToCenter  = fract(distanceToCenter);

    color = mix(
        vec3(1.0),
        uWaveColor,
        distanceToCenter
    );

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}