(function(){const o=[];const nom=e=>(e.getAttribute('aria-label')||e.getAttribute('title')||e.textContent||'').trim()||(e.querySelector('img[alt]')?.alt||'');
document.querySelectorAll('img:not([alt])').forEach(()=>o.push('imagen sin alt'));
document.querySelectorAll('a,button,[role=button]').forEach(e=>{if(!nom(e))o.push('enlace/botón sin nombre: '+(e.getAttribute('href')||e.tagName))});
document.querySelectorAll('input,select,textarea').forEach(e=>{if(e.type==='hidden')return;if(!(e.closest('label')||e.getAttribute('aria-label')||(e.id&&document.querySelector('label[for="'+e.id+'"]'))))o.push('campo sin etiqueta: '+(e.type||e.tagName))});
if(!document.querySelector('h1'))o.push('sin h1');
const lv=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);for(let i=1;i<lv.length;i++)if(lv[i]-lv[i-1]>1){o.push('salto de encabezado h'+lv[i-1]+'→h'+lv[i]);break;}
const c={};o.forEach(x=>c[x]=(c[x]||0)+1);const pre=document.createElement('pre');pre.id='ESTRUCTURA';pre.textContent=Object.entries(c).map(([k,v])=>v+'× '+k).join('\n')||'OK';document.body.appendChild(pre);})();
