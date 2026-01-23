
varying vec2 vUv;

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
    displacementPosition.xy = -rotate2D(displacementPosition.xy, uTime * 0.1);

    vec4 modelPosition      = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}