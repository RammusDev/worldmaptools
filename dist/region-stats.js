function regionStatistics(visible){const unpainted=visible.filter(n=>!mark(n).color);return {total:visible.length,painted:visible.length-unpainted.length,unpainted};}
function navigateToRegion(n){
  select(n);
  const bounds=n.layer?.getBounds()||L.geoJSON(n.feature).getBounds();
  map.fitBounds(bounds,{padding:[70,70],maxZoom:10});
  n.layer?.eachLayer(l=>l.openTooltip());
}
function renderRegionStatistics(visible){
  const stats=regionStatistics(visible),en=language==='en';
  $('#painted-count').textContent=`${en?'Painted':'已著色'} ${stats.painted}`;
  $('#unpainted-count').textContent=`${en?'Unpainted':'未著色'} ${stats.unpainted.length}`;
  const list=$('#unpainted-list');list.replaceChildren();
  if(stats.unpainted.length>=10)return;
  const heading=document.createElement('div');heading.className='unpainted-heading';heading.textContent=en?'Unpainted regions':'未著色區域';list.append(heading);
  if(!stats.unpainted.length){const done=document.createElement('div');done.className='unpainted-done';done.textContent=en?'All editable regions are painted.':'所有可編輯區域都已著色。';list.append(done);return}
  for(const n of stats.unpainted){const button=document.createElement('button');button.className='unpainted-region';button.textContent='⌖ '+regionName(n);button.title=en?'Navigate to this region':'定位到此區域';button.onclick=()=>navigateToRegion(n);list.append(button)}
}
