precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform vec3 uWaveColor;
uniform vec3 uWaveColor2;

void main(){
    vec3  color            = vec3(1.0);
    vec2  uv               = vUv;
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);

    if(distanceToCenter > 0.5) discard;

    float colorMix  = smoothstep(0.0, 1.0, distanceToCenter);
          colorMix *= 5.0;
          colorMix -= uTime;
          colorMix  = fract(colorMix);

    color = mix(
        uWaveColor,
        uWaveColor2,
        colorMix
    );

    if(distanceToCenter < 0.5 && distanceToCenter > 0.48) {
        color = vec3(1.0);
    }

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}