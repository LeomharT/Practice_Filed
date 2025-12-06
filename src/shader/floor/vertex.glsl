#define GRAVITY 1.6

varying vec2 vUv;

void main(){
    float distanceToCenter       = distance(vec2(0.5), uv);
    vec3  displacementPosition   = position;
          displacementPosition.z = pow(distanceToCenter, GRAVITY);

    float edge = 0.45;

    if(distanceToCenter > edge) {
        displacementPosition.z = pow(edge, GRAVITY);
    }

    vec4 modelPosition      = modelMatrix * vec4(displacementPosition, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}