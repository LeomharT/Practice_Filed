varying vec2 vScreenSpace;

// https://stackoverflow.com/questions/55582846/how-do-i-implement-an-instanced-billboard-in-three-js
vec3 billboard(vec3 v,mat4 view){
    vec3 up=vec3(view[0][1],view[1][1],view[2][1]);
    vec3 right=vec3(view[0][0],view[1][0],view[2][0]);
    vec3 pos=right*v.x+up*v.y;
    return pos;
}

 

void main() {
    #include <begin_vertex>
    
    vec3 billboardPos = billboard(transformed, modelViewMatrix);

    transformed = billboardPos;
     
    #include <project_vertex>

    // Normalize deive coord [-1, 1]
    vec3 ndc = gl_Position.xyz / gl_Position.w;

    // UV [0, 1]
    vScreenSpace  = ndc.xy * 0.5 + 0.5;
}