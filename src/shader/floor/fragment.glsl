precision mediump float;

varying vec2 vUv;
varying vec4 vTextureUv;

uniform sampler2D uReflector;
#include <fog_pars_fragment>

void main(){
    vec2  uv        = vUv;
    vec3  color     = vec3(0.0);
    vec3  lineColor = vec3(0.3, 0.3, 0.3);
    float lineWidth = 0.005;
    float gap       = 1.0 / 5.0;
    float alpha     = 1.0;

    vec4 reflectUv = vTextureUv;
 
    uv *= 5.0;
    uv = fract(uv);

    for(float i = 0.0; i < 5.0; i++) {
        float space = i * gap;

        if(uv.x > space && uv.x < space + lineWidth) {
            color = lineColor;
            alpha = 1.0;
        }
        if(uv.y > space && uv.y < space + lineWidth) {
            color = lineColor;
            alpha = 1.0;
        }
    }

    vec4 reflectorColor = texture2DProj(uReflector, reflectUv);
    color += reflectorColor.rgb;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
}