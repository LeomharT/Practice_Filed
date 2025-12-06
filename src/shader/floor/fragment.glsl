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

    color = uWaveColor;

    if(distanceToCenter > 0.5) discard;

    float alpha  = smoothstep(0.0, 1.0, distanceToCenter);
          alpha *= 5.0;
          alpha -= uTime * 0.6;
          alpha  = fract(alpha);

    if(distanceToCenter < 0.5 && distanceToCenter > 0.48) {
        color = uWaveColor2;
    }

    gl_FragColor = vec4(color, alpha);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}