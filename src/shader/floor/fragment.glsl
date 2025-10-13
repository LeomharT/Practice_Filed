uniform sampler2D uDiffuse;

varying vec4 vReflectionUv;

void main() {
    vec3 color = vec3(0.12, 0.66, 0.8);

    vec2 reflectionUv = vReflectionUv.xy / vReflectionUv.w;

    vec4 reflectionColor = texture2D(uDiffuse, reflectionUv);

    color += reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}