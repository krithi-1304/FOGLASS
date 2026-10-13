#version 300 es
precision highp float;
in vec2 position;
flat in vec4 line;
flat in vec2 brushStyle;
uniform float aspect;
out vec4 result;
void main(){
 vec2 a=line.xy,b=line.zw,ab=b-a,p=position,uv=p/vec2(aspect,1.);
 float radius=brushStyle.x,palm=brushStyle.y;
 float d=length(p-a-ab*clamp(dot(p-a,ab)/max(dot(ab,ab),.000001),0.,1.));
 float streak=.93+.07*sin(dot(p,normalize(vec2(-ab.y,ab.x)+vec2(.00001)))*280.);
 float brush=radius*(1.+.06*palm*sin(uv.y*90.+uv.x*25.));
 float wipe=(1.-smoothstep(brush*.65,brush*1.25,d))*(1.-.08*palm)*mix(1.,streak,palm);
 result=vec4(wipe,0,0,1);
}
