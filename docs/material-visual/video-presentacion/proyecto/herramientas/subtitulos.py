import json,sys
R=json.load(open('ritmo.json'));K=R['K']
ini=[R['escenas'][n]['inicio']+R['escenas'][n]['o'] for n in ['hola','nombre','miedo','leccion','ayuda','repasos','logro','docente','celular','cierre']]
bloques=[]
for i,s in enumerate(ini,1):
  a=json.load(open(f'assets/voz/will_{i:02d}.json',encoding='utf-8'))['alignment']
  ch=a['characters'];st=[x/K for x in a['character_start_times_seconds']];en=[x/K for x in a['character_end_times_seconds']]
  palabras=[];cur='';t0=t1=None;tag=False
  for c,b,e in zip(ch,st,en):
    if c=='[': tag=True
    if tag:
      if c==']': tag=False
      continue
    if c.isspace():
      if cur: palabras.append((cur,t0,t1)); cur=''
    else:
      if not cur: t0=b
      cur+=c; t1=e
  if cur: palabras.append((cur,t0,t1))
  grupo=[]
  def txt(g): return ' '.join(w for w,_,_ in g)
  def cerrar():
    if grupo: bloques.append([s+grupo[0][1], s+grupo[-1][2], txt(grupo)]); grupo.clear()
  for w in palabras:
    if grupo and len(txt(grupo+[w]))>80: cerrar()
    grupo.append(w); n=len(txt(grupo)); f=w[0][-1]
    if (f in '.?!' and n>=14) or (f in ':…' and n>=30) or (f==',' and n>=38): cerrar()
  cerrar()
def dos_lineas(t):
  if len(t)<=42: return t
  pal=t.split(' '); mejor=None
  for k in range(1,len(pal)):
    a,b=' '.join(pal[:k]),' '.join(pal[k:])
    if len(a)<=42 and len(b)<=42:
      pen=abs(len(a)-len(b)) - (12 if a[-1] in ',:;….!?' else 0)
      if mejor is None or pen<mejor[0]: mejor=(pen,a+'\n'+b)
  return mejor[1] if mejor else t
for k,b in enumerate(bloques):
  b[1]=max(b[1]+0.3,b[0]+1.2)
  if k+1<len(bloques): b[1]=min(b[1],bloques[k+1][0]-0.05)
  b[2]=dos_lineas(b[2])
def ts(t,sep):
  h=int(t//3600);m=int(t%3600//60);s=t%60;ms=int(round((s-int(s))*1000))
  if ms==1000: ms=999
  return f"{h:02d}:{m:02d}:{int(s):02d}{sep}{ms:03d}"
srt='\n'.join(f"{k}\n{ts(a,',')} --> {ts(b,',')}\n{t}\n" for k,(a,b,t) in enumerate(bloques,1))
vtt='WEBVTT\n\n'+'\n'.join(f"{ts(a,'.')} --> {ts(b,'.')}\n{t}\n" for a,b,t in bloques)
open('subtitulos/stire-presentacion.es.srt','w',encoding='utf-8').write(srt)
open('subtitulos/stire-presentacion.es.vtt','w',encoding='utf-8').write(vtt)
print(len(bloques)); print(srt)
