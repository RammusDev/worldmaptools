function hasMark(n){const m=mark(n);return !!(m.color||m.icon)}
function displayNodes(n){
  if(!n.children.length)return [n];
  const retained=state.merged?.[n.id];
  if(!retained)return n.children.filter(id=>nodes[id]?.iso===n.iso).flatMap(id=>displayNodes(nodes[id]));
  const kept=retained.filter(id=>nodes[id]?.iso===n.iso).flatMap(id=>displayNodes(nodes[id])).filter(hasMark);
  let residual=n.feature;
  if(kept.length){const exclusion=kept.length===1?kept[0].feature:turf.union(turf.featureCollection(kept.map(c=>c.feature)));residual=turf.difference(turf.featureCollection([n.feature,exclusion]));}
  let remainder;
  if(residual){remainder=n.residualNode||(n.residualNode={...n,residual:true});remainder.feature={...n.feature,geometry:residual.geometry};}
  return [...(remainder?[remainder]:[]),...kept];
}
leaves=function(){return Object.values(nodes).filter(n=>!n.parent).flatMap(displayNodes)};
const selectBeforeMerge=select;
select=function(n){selectBeforeMerge(n);$('#split').hidden=!!n.children.length&&!state.merged?.[n.id];$('#merge').textContent='合併未標記區域';if(n.residual)$('#region').querySelector('small').textContent='上一層剩餘範圍 · 已標記區域維持獨立'};
const splitBeforeMerge=split;
split=async function(n,restoring=false){
  if(!restoring&&state.merged?.[n.id]){if(busy)return;checkpoint();delete state.merged[n.id];save();render();select(nodes[n.id]);if(typeof L!=='undefined')map.fitBounds(L.geoJSON(nodes[n.id].feature).getBounds(),{padding:[70,70],maxZoom:9});status('未標記範圍已重新拆開，原有標記保留。');return}
  return splitBeforeMerge(n,restoring);
};
merge=function(){
  if(busy||!selected)return;
  let n=nodes[selected.id];if(!n)return;
  if(!n.children.length)n=nodes[n.parent];
  if(!n||n.iso!==selected.iso)return;
  // A retained region may be visible inside an already merged ancestor.
  for(let p=nodes[n.parent];p&&p.iso===n.iso;p=nodes[p.parent])if(state.merged?.[p.id])n=p;
  if(state.merged?.[n.id]){const parent=nodes[n.parent];if(!parent||parent.iso!==n.iso){status('此範圍已合併到國家層級，現有標記維持不變。');return}n=parent;}
  const visible=n.children.filter(id=>nodes[id]?.iso===n.iso).flatMap(id=>displayNodes(nodes[id]));
  const kept=visible.filter(hasMark);
  if(!visible.some(c=>!hasMark(c))&&!state.merged?.[n.id]){status('此區下層都有標記，沒有未標記範圍可合併。');return}
  checkpoint();
  // Freeze current inherited markings before changing the parent remainder.
  for(const c of descendants(n))state.marks[c.id]={...mark(c)};
  const ids=new Set(kept.map(c=>c.id));
  const topIds=[...ids].filter(id=>{for(let p=nodes[nodes[id].parent];p&&p.id!==n.id;p=nodes[p.parent])if(ids.has(p.id))return false;return true});
  (state.merged||={})[n.id]=topIds;
  state.marks[n.id]={};save();render();select(leaves().find(c=>c.id===n.id)||n);status(`未標記範圍已合併，保留 ${kept.length} 個已標記區域。`);
};
const applyBeforeMerge=apply;
apply=async function(n){
  if(mode==='erase'&&state.merged?.[n.id]){if(busy)return;checkpoint();state.marks[n.id]={};save();render();return}
  return applyBeforeMerge(n);
};
function chooseLegend(k){if(busy)return;if(k.startsWith('color:')){color=k.slice(6);$('#customColor').value=color;drawPalette();$('[data-mode=color]').click()}else{icon=k.slice(5);$('#icons').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.textContent===icon));$('[data-mode=icon]').click()}status('已選用此標記，可繼續點擊地圖套用。')}
function deleteLegend(k){
  if(busy)return;checkpoint();const field=k.startsWith('color:')?'color':'icon',value=k.slice(field.length+1);
  for(const id of Object.keys(state.marks)){const m=state.marks[id];if(m[field]===value){state.marks[id]={...m};delete state.marks[id][field]}}
  delete state.labels[k];save();render();status(field==='color'?'已清除地圖上此顏色；其他色彩與圖示保留。':'已清除地圖上此圖示；色彩保留。');
}
renderLegend=function(){
  const box=$('#legend-items');box.replaceChildren();const used=new Set();leaves().forEach(n=>{const m=mark(n);if(m.color)used.add('color:'+m.color);if(m.icon)used.add('icon:'+m.icon)});
  if(!used.size){const p=document.createElement('p');p.textContent='點擊圖例選用標記；✎ 修改說明，× 刪除並清除地圖上的同款標記。';box.append(p)}
  used.forEach(k=>{const row=document.createElement('div');row.className='legend-row';const choose=document.createElement('button');choose.className='legend-choose';choose.title='選用此標記';const dot=document.createElement('span');if(k.startsWith('color:')){dot.className='dot';dot.style.background=k.slice(6)}else dot.textContent=k.slice(5);const text=document.createElement('span');text.textContent=state.labels[k]||(k.startsWith('color:')?'色彩 '+k.slice(6):'未命名');choose.append(dot,text);choose.onclick=()=>chooseLegend(k);const edit=document.createElement('button');edit.className='legend-action';edit.textContent='✎';edit.title='修改說明';edit.setAttribute('aria-label','修改 '+text.textContent+' 的說明');edit.onclick=()=>{if(busy)return;const value=prompt('修改圖例說明',state.labels[k]||'');if(value?.trim()){checkpoint();state.labels[k]=value.trim().slice(0,80);save();renderLegend()}};const del=document.createElement('button');del.className='legend-action';del.textContent='×';del.title='刪除此圖例並清除同款標記';del.setAttribute('aria-label','刪除 '+text.textContent+' 並清除地圖標記');del.onclick=()=>deleteLegend(k);row.append(choose,edit,del);box.append(row)});
};
// The original handlers captured the earlier function objects.
$('#merge').onclick=()=>merge();$('#split').onclick=()=>selected&&split(selected);
init();

