
uniform sampler2D uFrame;

varying vec2 vNdc;

void main() {
    vec3 color = vec3(0.25, 1.0, 0.225);

    vec2 ndc = vNdc;

    vec4 diffuseColor = texture2D(uFrame, ndc);

    color = diffuseColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}