uniform sampler2D uFrame;

varying vec2 vReflectionUv;

void main(){
    vec3 color = vec3(gl_PointCoord, 0.5);

    vec4 reflectionColor = texture2D(uFrame, vReflectionUv);

    color = reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}