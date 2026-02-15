void main(){
    vec3 pos = position;

    vec4 modelViewPosition = modelViewMatrix * vec4(vec3(0.0), 1.0);
    modelViewPosition.xyz += pos.xyz;

    vec4 projectionPosition = projectionMatrix * modelViewPosition;

    gl_Position = projectionPosition;
}