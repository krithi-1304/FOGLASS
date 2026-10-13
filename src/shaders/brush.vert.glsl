#version 300 es
precision highp float;
layout(location=0) in vec4 segment;
layout(location=1) in vec2 style;
uniform float aspect;
out vec2 position;
flat out vec4 line;
flat out vec2 brushStyle;
void main(){
 vec2 corners[6]=vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
 vec2 a=segment.xy*vec2(aspect,1.),b=segment.zw*vec2(aspect,1.);
 float pad=style.x*1.4;
 position=mix(min(a,b)-pad,max(a,b)+pad,corners[gl_VertexID]);
 line=vec4(a,b);brushStyle=style;
 gl_Position=vec4(position/vec2(aspect,1.)*2.-1.,0,1);
}
