void main(){
    vec3 pos = position;

    vec4 modelPosition    = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 viewPosition     = viewMatrix * modelPosition;
         viewPosition.xy += pos.xy;

    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
}