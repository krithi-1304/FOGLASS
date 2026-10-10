"""Original synthetic anatomical fixtures; never presented as physical-camera data."""
import json, math
from pathlib import Path
root=Path('tests/fixtures/gestures')
def hand(kind,x=.5,y=.55,confidence=.98,side='Right'):
    p=[{'x':x,'y':y+.18,'z':0.0} for _ in range(21)]
    # Wrist and palm joints; extended tips point upward, curled tips return to palm.
    for j,dx in enumerate([-.075,-.025,.03,.08]):
        base=5+j*4
        extended=kind in ('palm','two') or (j==0 and kind in ('point','pinch','victory')) or (j==1 and kind=='victory')
        for k,dy in enumerate([.03,-.055,-.12,-.18] if extended else [.03,-.015,.025,.07]):
            p[base+k]={'x':round(x+dx,5),'y':round(y+dy,5),'z':0.0}
    for i,(dx,dy) in enumerate([(-.06,.12),(-.12,.08),(-.16,.025),(-.19,-.005)],1):
        p[i]={'x':x+dx,'y':y+dy,'z':0.0}
    if kind=='pinch':p[4]={'x':p[8]['x']+.007,'y':p[8]['y']+.007,'z':0.0}
    return {'landmarks':p,'confidence':confidence,'handedness':side}
specs=[
('open-palm-left','palm'),('open-palm-right','palm'),('open-palm-slow','palm'),
('index-draw-line','point'),('index-draw-heart','point'),('pinch','pinch'),
('fist','fist'),('two-palm-clear','two'),('gesture-jitter','point'),
('low-confidence','point'),('hand-disappears','point'),('two-finger-palette','victory'),
('open-palm-hold','palm')]
for name,kind in specs:
    frames=[]
    n=121 if name=='open-palm-hold' else 41
    for i in range(n):
        t=i*40; u=i/(n-1);x=.5;y=.55
        if name=='open-palm-left':x=.8-.6*u
        if name in ('open-palm-right','index-draw-line'):x=.2+.6*u
        if name=='open-palm-slow':x=.35+.2*u
        if name=='index-draw-heart':
            a=u*math.tau;x=.5+.015*(16*math.sin(a)**3);y=.6-.012*(13*math.cos(a)-5*math.cos(2*a)-2*math.cos(3*a)-math.cos(4*a))
        if name=='gesture-jitter':x+=.0015*math.sin(i*2.1)
        hands=[hand(kind,x,y,.35 if name=='low-confidence' else .98)]
        if name=='two-palm-clear':hands=[hand('palm',.3,y),hand('palm',.7,y,side='Left')]
        if name=='hand-disappears' and 10<i<25:hands=[]
        frames.append({'timestamp':t,'hands':hands})
    (root/(name+'.json')).write_text(json.dumps({'version':1,'name':name,'frames':frames},separators=(',',':'))+'\n')
