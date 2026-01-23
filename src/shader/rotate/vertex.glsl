
varying vec2 vUv;
varying vec3 vNDC;

uniform float uTime;

vec2 rotate2D(vec2 v, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return m * v;
}


void main(){
    vec3 displacementPosition = position;
    // displacementPosition.xy = -rotate2D(displacementPosition.xy, uTime * 0.1);

    vec4 modelPosition    = modelMatrix * vec4(vec3(0.0), 1.0);
    vec4 viewPosition     = viewMatrix * modelPosition;
         viewPosition.xy += displacementPosition.xy;

    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vec3 ndc = gl_Position.xyz / gl_Position.w;

    vUv  = uv;
    vNDC = ndc * 0.5 + 0.5;
}