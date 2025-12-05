#define GRAVITY 1.45

varying vec2 vUv;

void main(){
    float distanceToCenter     = distance(vec2(0.5), uv);
    vec3  displacementPosition = position;

    displacementPosition.z = pow(distanceToCenter, GRAVITY);

    if(distanceToCenter > 0.45) {
        displacementPosition.z = pow(0.45, GRAVITY);
    }

    vec4 modelPosition      = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}