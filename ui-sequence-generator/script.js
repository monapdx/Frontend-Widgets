const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const toast = document.getElementById('toast');
const iconButtons = [...document.querySelectorAll('.icon-btn')];

const ICONS = {
  'tap': {src:'assets/tap.png', dataSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA8gAAAPIBlLUtiQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALySURBVFiFzddbiJVVFMDx3x6mpprsXjrovCRkVFIWNPnU/X4hKJHowXwJgh7s8lQJFREh9SBkEFQPvQTNU9H0UISWDxFa6IgRWlFgJtrNbk6G7R6+dWR7mnO+7xxHpgWbw7e+9e3132uvtfY+KedsNmVgVr3/HwAG2xUppYRFuAi7sT3nvP+YEeScRR4ch6exH7kYf+IlnNOyncnRcj4fW3AonN0RUbgP4/gNX+P8xhNzYkM7Ce9hL5Z2MBqLSHyBoZoJx/AO/o7fK+oAVkao7yyUF2I1lhS6u/EPVrRNcAoexRNYqsqbrViFzfgDY90AxrGpUDwVQK1cmMBJ8e5yjGBuRG4EP+IA9hV5c33Yz8Gn+KHT9sFXeLm1b/gJz6tKdDn+wgYM41y8HZH4HpPhfBRDeCUAHi8czMWX+BbzpwP4FWvjYTQS8d7C4PaA+Ajr8R1W4MVwtq+VFxGVZ/FAm5OF2INtOL0dYDN2FoqJiMqCQndbQGSsKfSrQvcaBmqSbUksdqOiQuDJmGRRkYB7sbMN4lZM4XOcPA3E2gYld00s5C2kFsBZqoSbxGgoF3eAuCUgPsRwoV9Z7nsNxPIAvr9sRDeq6nY3LqmBuDkgNojq6HXgDfyMeaXyOnyD8ULXCeKmgHi3T4ARVX94pv3F8DRZ2gniKjzcD0B8vxETTY2nhTiaoSrjXY3uAznnbbgWp2J9SmlBk+9q5ACGDpdCE0kpLcYHqqq5Oue8q1/vKaX3kXu6Ec1UJFJKJ+BSfNbv/h1VTqjOmoO4uInx8arueBcew+v4BL+rGsq6Hp1fqTpvVuecdTMcxIOOPGanVB3zTdWxfY+2sq1xPoZf8DEG6wDWRJjWqQ6jhWoOnIbOt+CMw/ouq9+D52ag3gfwkKrzTeLM8v1/ruUhc3Aazk4pzeshwVsygPNwGZbF6l/FI7n9it+F/AVHXs/7GQexCTd08tO1EaWULlDdA3uVQ9iBrTnnqW6GPXXCYyGz/t9w1gH+BdcF67iWbO4rAAAAAElFTkSuQmCC', alt:'Tap'},
  'right-arrow': {src:'assets/right-arrow.png', dataSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAB/wAAAf8BOjAhmQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE4SURBVFiF7Ze9SgNBFIW/swQJIhZqIYJg5U+ljUUsbW0MCmmtJT6HlZ1ga7rFwryBvoJYxUpSiKDgTyHYHZsI67q7NlmmcC5cBu45zP24MMOMbBMykqDdI0AEiAB1AkhakDQTBEDSOTAEniT1KkFsjzWBFuBcPgLtIn8dE1gvqM0Dl5JSSXNZQbaR1AIOgc3MZFYBJPWBtYJNd20PJJ0AO5n6JLBYAfgMdG1ffBfa/B6ZMyO9KdKBjZGeluh/ZQpMNIBuBW2d0QFeE2A7EADAXuiL6CUBrgICHCfAaYDGH8CB7V7Ddl/SFrljmIl7oFlQ/xytD8BdTlupaH4LdGwPgFpuwmXKj94Z0PzhrwFgGnjPNX4D9gv94wYYQRxlIK6BpTKv6nqWS5oCZm0PK33xXxABIsC/B/gCMn6dmPwY9JUAAAAASUVORK5CYII=', alt:'Arrow'},
  'resize': {src:'assets/resize.png', dataSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAADsAAAA7AF5KHG9AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAATtJREFUWIXtl8FqAjEQhr+2UA8VlB7tWxQU78WDPS74HO0b9KWkFcWjB7e0b9Gj4m73VCj2EMUYxhjoZBfEH/awm2z+b2eSSRbOqlgXSuPUgAfgxtPnF5gDX0qee3oD1gHXCmjFAMgCAdZAYr94qQTwAhSBfa+UPL1qYPItRWBgd9SKgGs+BjohnbUBmsDEMX9X9jgoKewfwC2eFJRhThkAI8ckxaRjq+gAuccczBLdtvdjADxhitGrYA7wvGkfAtcxAE5HNczGkmHC5qqJmXA5JuzqemQ3Wb4F89RqzzQM3Upo7+d1x3wMtK1nMw0AVwP21ywcLzJRAUo1lwBS4V5a59EAon956Hb8CfSAZVUA98CCXTQK5DrxbyUcToF0wlXX3WbgEIChhqH0Y9ICuvhPrwUwBX40IM6qVH8mJZJg9WPMagAAAABJRU5ErkJggg==', alt:'Resize'},
  'drag': {src:'assets/drag.png', dataSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAG9SURBVFiF7de9bhNBFAXgz3EEAuUp0oKQKEA0gYYOIZDwC0BNSUmxEqJBFAQoIKLOA6SCNFBi8SuUmgLoIfwTBUzhu3iy8W68ixNHiCNdacZzfM7xzHpmlv9ojg7eRXV22vwifqIX9QuXdsK4hSwxLtZ8cLYN8xXmed3YLvMWvidGn0ra39SYhXbNEHtxBHfxCMfj82t4hQO4joc1dRshM/jVWVORqTGFaYxdG6CD+zg9Bo8zeKDGZnUW6/pr+76ClxntGVgNznpob0BxBuawaPDveD5C4K2Qa7RDey4dnE7aB7GEfdH/ins4WSI8W2iX8RZwFPtDeylCrBSJz2y9y42rng5LutpQrEl9yE3TJbiJy0n/Mx4PSxqYNViG11FlOIaZgtcmTOk/JOkRe75CNEu4WQXvQmjl3EUV+88eLBsyVQ0DtPAx4S2Hxx8Uk6zhHLrRr1qCUdBLtLqhvZYSpovf0D9aT+AQXv5lADiFw3hRNC8LAD/wZAzmwrRbNrhrD6MyXNWfnVs2XmbauB1jV8YTbTNGvZJ9qSNaZwZ6uJP0Z0raC3UC1MXEr+U5JvZikqKDt3hjAq9m/w5+A17LvhiskNf3AAAAAElFTkSuQmCC', alt:'Drag'},
  'cursor': {src:'assets/cursor.png', dataSrc:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA3QAAAN0BcFOiBwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIuSURBVFiFxddBSFRRFMbx3zWzIKEiyU0irXITtMiNuDGhoDaFBkFBEFjboJWbIIg2UeImWtY2WoVQIRgUQURQBIlQEEREFISlYEl6W8yRJhsdbabnhcPMnPOd+/7vvHPv3CfnbLHhIpoqxeptKS74x0gpTeA9Duecp/8S1HE0LBPrxVhKqWWtAKATj1JKbWsFcB8deJxS6vgvBEs04QQymnEjvn9GZ72bsBrARiRcid9T6C0UoMw3GL4f6C8cIPwDmAs7XThAxPrwPeKDhQNEvDf6IeMqpQ2tMIDQ7I2VkXETjYUChG4X3oX2TjV93QFCuwPjoX+IzYUChH4bnkbOc7QWChA5zRiNvDfYWShA5DXhVuR+wO5CASK3Adcj/wu6ltM3qmGklPZgC7bG54LN4lv4R1NK/TnnuxUnqaUCGAtdNZvFsZorkFLqxpGc87lwDaFHqdRDmKxgXzGZc56qqQJK2+80ZtBS9rxfh7Zqw1WyaieihTs/hBFsUjojnAn4eQyH7OxK5lp1BdCv9AzncAnzSktsfdn6n1T6h9y+6lVTBWAAP8NORGwkYsfL9JfDd77eAPNx932LeiHjWZmvPSA/WuULTTWAGRysEH8Z8e4y38IOeLJeANPYt0T8VFzsdpmvK3wv6gHwxDJbKDbgU5S9HetwNCqW0VMrQFvVRC7ExR7grd+73ivsrwlgRYm0Kh3RF5r1Hg5Y5fmw4tvxSkdK6VqUfzjnPP4vc/wCLew4JEvK5xwAAAAASUVORK5CYII=', alt:'Cursor'}
};

let savedRange = null;

function saveCaret(){
  const sel = window.getSelection();
  if(sel && sel.rangeCount && editor.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange();
}

['keyup','mouseup','input','focus'].forEach(evt=>editor.addEventListener(evt,()=>{saveCaret(); render();}));

function restoreCaret(){
  editor.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  if(savedRange){
    try{sel.addRange(savedRange);return;}catch(e){}
  }
  const r=document.createRange();r.selectNodeContents(editor);r.collapse(false);sel.addRange(r);savedRange=r.cloneRange();
}

function insertIcon(name){
  restoreCaret();
  const meta = ICONS[name];
  const img = document.createElement('img');
  img.src = meta.src;
  img.alt = meta.alt;
  img.className = 'inline-token';
  img.dataset.icon = name;
  img.contentEditable = 'false';

  const sel = window.getSelection();
  if(!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(img);
  const spacer = document.createTextNode(' ');
  img.after(spacer);
  range.setStartAfter(spacer);range.collapse(true);
  sel.removeAllRanges();sel.addRange(range);savedRange=range.cloneRange();
  render();
}

iconButtons.forEach(btn=>btn.addEventListener('mousedown',e=>e.preventDefault()));
iconButtons.forEach(btn=>btn.addEventListener('click',()=>insertIcon(btn.dataset.icon)));

function serializeEditor(){
  const out=[];
  function walk(node){
    if(node.nodeType===Node.TEXT_NODE){out.push({type:'text',value:node.nodeValue});return;}
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(node.tagName==='IMG' && node.dataset.icon){out.push({type:'icon',name:node.dataset.icon});return;}
    if(node.tagName==='BR'){out.push({type:'text',value:'\n'});return;}
    for(const child of node.childNodes) walk(child);
    if(['DIV','P'].includes(node.tagName)) out.push({type:'text',value:'\n'});
  }
  for(const child of editor.childNodes) walk(child);
  return out;
}

function tokenizedSequence(){
  const serial=serializeEditor();
  const tokens=[];
  let buffer='';
  const flush=()=>{if(buffer){tokens.push({type:'text',value:buffer});buffer='';}};
  for(const part of serial){
    if(part.type==='icon'){flush();tokens.push(part);continue;}
    for(const ch of part.value){
      if(ch==='>'){flush();tokens.push({type:'sep'});}
      else buffer+=ch;
    }
  }
  flush();
  return tokens.filter(t=>t.type!=='text' || t.value.trim().length);
}

function render(){
  preview.innerHTML='';
  const tokens=tokenizedSequence();
  let textIndex=0;
  for(const token of tokens){
    if(token.type==='sep'){
      const s=document.createElement('span');s.className='separator';s.textContent='›';preview.appendChild(s);continue;
    }
    if(token.type==='icon'){
      const wrap=document.createElement('span');wrap.className='action-token';
      const img=document.createElement('img');img.src=ICONS[token.name].src;img.alt=ICONS[token.name].alt;wrap.appendChild(img);preview.appendChild(wrap);continue;
    }
    const clean=token.value.replace(/\s+/g,' ').trim();
    if(!clean)continue;
    const n=document.createElement('span');n.className='node'+(textIndex===0?' app-node':'');n.textContent=clean;preview.appendChild(n);textIndex++;
  }
}

function flash(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(flash.t);flash.t=setTimeout(()=>toast.classList.remove('show'),1500)}

function plainText(){
  return tokenizedSequence().map(t=>{
    if(t.type==='sep') return ' → ';
    if(t.type==='icon') return `[${ICONS[t.name].alt}] `;
    return t.value.replace(/\s+/g,' ').trim();
  }).join('').replace(/\s+/g,' ').trim();
}


function markdownText(){
  const tokens = tokenizedSequence();
  const pieces = [];
  let textIndex = 0;

  for(const token of tokens){
    if(token.type === 'sep'){
      pieces.push(' → ');
      continue;
    }
    if(token.type === 'icon'){
      pieces.push(` **[${ICONS[token.name].alt}]** `);
      continue;
    }
    const clean = token.value.replace(/\s+/g,' ').trim();
    if(!clean) continue;
    pieces.push(textIndex === 0 ? `**${clean}**` : `\`${clean}\``);
    textIndex++;
  }

  return pieces.join('').replace(/\s*→\s*/g, ' → ').replace(/\s{2,}/g, ' ').trim();
}

function generatedMarkup(){
  const pieces=[];
  let textIndex=0;
  for(const token of tokenizedSequence()){
    if(token.type==='sep'){
      pieces.push('<span style="display:inline-flex;align-items:center;justify-content:center;font-size:1.55rem;font-weight:900;color:#111118;line-height:1;margin:0 -1px">›</span>');
      continue;
    }
    if(token.type==='icon'){
      const meta=ICONS[token.name];
      pieces.push(
        `<span style="display:inline-grid;place-items:center;width:30px;height:30px;border:3px solid #000;border-radius:8px;background:#b8ff24;box-shadow:3px 3px 0 #000;flex:0 0 auto">` +
        `<img src="${meta.dataSrc}" alt="${meta.alt}" width="17" height="17" style="display:block;width:17px;height:17px;object-fit:contain">` +
        `</span>`
      );
      continue;
    }
    const clean=token.value.replace(/\s+/g,' ').trim();
    if(!clean)continue;
    const isApp=textIndex===0;
    pieces.push(
      `<span style="display:inline-flex;align-items:center;padding:7px 11px;border:3px solid #000;border-radius:9px;` +
      `background:${isApp?'#ff45bd':'#f7f5ef'};color:#050508;font-family:Inter,Arial,sans-serif;font-weight:900;` +
      `box-shadow:3px 3px 0 #000;line-height:1.1;white-space:nowrap">${escapeHtml(clean)}</span>`
    );
    textIndex++;
  }
  return `<div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-family:Inter,Arial,sans-serif">${pieces.join('')}</div>`;
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

async function copy(value,msg){
  try{await navigator.clipboard.writeText(value)}catch(e){const ta=document.createElement('textarea');ta.value=value;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}
  flash(msg);
}

document.getElementById('copyText').addEventListener('click',()=>copy(plainText(),'Text copied'));
document.getElementById('copyMarkdown').addEventListener('click',()=>copy(markdownText(),'Markdown copied'));
document.getElementById('copyHtml').addEventListener('click',()=>copy(generatedMarkup(),'HTML copied'));

document.getElementById('downloadHtml').addEventListener('click',()=>{
  const markup=generatedMarkup();
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UI Sequence</title></head><body style="margin:0;padding:32px;background:#fff">${markup}</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ui-sequence.html';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  flash('HTML downloaded');
});

document.querySelector('.close-pill').addEventListener('click',()=>{editor.innerHTML='';preview.innerHTML='';editor.focus();savedRange=null});

editor.textContent='Windows Explorer > View > Group by > Type';
render();
