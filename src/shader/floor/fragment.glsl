precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform vec3 uWaveColor;
uniform vec3 uWaveColor2;
uniform vec3 uLineColor;

void main(){
    vec3  color            = vec3(1.0);
    vec2  uv               = vUv;
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);
    float lineWidth        = 0.01;

    color = uWaveColor;

    if(distanceToCenter > 0.5) discard;

    float alpha  = smoothstep(0.0, 1.0, distanceToCenter);
          alpha *= 5.0;
          alpha -= uTime * 0.6;
          alpha  = fract(alpha);

    if(distanceToCenter < 0.5 && distanceToCenter > 0.48) {
        color = uWaveColor2;
    }

    float gap = 1.0 / 5.0;

    uv *= 5.0;
    uv += uTime * 0.2;
    uv  = fract(uv);
 
    for(float i = 0.0; i < 5.0; i += 1.0) {
        if(i == 0.0) {
            lineWidth = 0.03;
        }else {
            lineWidth = 0.01;
        }

        if(uv.x > gap * i && uv.x < lineWidth + gap * i) {
            color = uLineColor;
            alpha = 1.0;
        }
        if(uv.y > gap * i && uv.y < lineWidth + gap * i) {
            color = uLineColor;
            alpha = 1.0;
        }
    }

    gl_FragColor = vec4(color, alpha);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}