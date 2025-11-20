varying vec4 vReflectorUv;
varying vec2 vUv;

uniform sampler2D uReflectorColor;

void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    // 
    // vec2 reflectUv = vReflectorUv.xy / vReflectorUv.w;
    // vec4 reflectorColor = texture2D(uReflectorColor, reflectUv);
    vec4 reflectorColor = texture2DProj(uReflectorColor, vReflectorUv);

    color = reflectorColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}