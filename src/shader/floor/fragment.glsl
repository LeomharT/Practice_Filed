varying vec2 vUv;


void main(){
    vec2 uv     = vUv;
    vec3 color  = vec3(1.0);
    vec2 center = vec2(0.5);
    float distanceToCenter = distance(uv, center);

    if(distanceToCenter > 0.5) discard;

    float linear = smoothstep(0.05, 0.35, distanceToCenter);

    color = mix(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        linear
    );

    gl_FragColor = vec4(color, 1.0);
}