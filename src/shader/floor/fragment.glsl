uniform sampler2D uDiffuse;

varying vec4 vReflectionUv;

void main() {
    vec3 color = vec3(0.24);

    vec2 reflectUv = vReflectionUv.xy / vReflectionUv.w;

    vec4 reflectionColor = texture2D(uDiffuse, reflectUv);

    color += reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}