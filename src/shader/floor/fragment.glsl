uniform sampler2D uDiffuse;

varying vec4 vReflectionUv;

void main() {
    vec3 color = vec3(0.66, 0.21, 0.82);

    vec2 reflectUv = vReflectionUv.xy / vReflectionUv.w;

    vec4 reflectionColor = texture2DProj(uDiffuse, vReflectionUv);

    color += reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}