varying vec2 vUv;
varying vec3 vNDC;


vec3 billboard(vec3 v, mat4 view) {
    vec3 up    = vec3(view[0][1], view[1][1], view[2][1]);
    vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 pos   = right * v.x + up * v.y;
    return pos;
}
void main(){
    #include <begin_vertex>

    vec3 billboardPosition = billboard(transformed, modelViewMatrix);
    transformed = billboardPosition;

    #include <project_vertex>

    // Varying
    vUv = uv;

    // Fisheye
    vec3 ndc = (gl_Position.xyz / gl_Position.w);
    vNDC = ndc * 0.5 + 0.5;
}