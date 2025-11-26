varying vec2 vUv;

void main(){
    float distanceToCenter = distance(vec2(0.5), uv);

    vec4 modelPosition    = modelMatrix * vec4(position, 1.0);
         modelPosition.y += pow(distanceToCenter, 1.5);
    
    if(distanceToCenter >= 0.48) {
        modelPosition.y = pow(0.48, 1.5);
    }

    vec4  viewPosition       = viewMatrix * modelPosition;
    vec4  projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}