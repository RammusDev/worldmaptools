// Stable layers: repainting never rebuilds unchanged geography or marker positions.
const liveLayers=new Map();
render=function(){
  const visible=leaves(),ids=new Set(visible.map(n=>n.id));
  for(const [id,entry] of liveLayers)if(!ids.has(id)){shapes.removeLayer(entry.layer);if(entry.marker)markers.removeLayer(entry.marker);liveLayers.delete(id)}
  for(const n of visible){
    const m=mark(n);let entry=liveLayers.get(n.id);
    if(entry&&entry.geometry!==n.feature.geometry){shapes.removeLayer(entry.layer);if(entry.marker)markers.removeLayer(entry.marker);liveLayers.delete(n.id);entry=null}
    if(!entry){
      entry={geometry:n.feature.geometry,node:n};
      entry.layer=L.geoJSON(n.feature,{style:{color:'#f6f8f3',weight:n.level?1:0.8,fillOpacity:1},onEachFeature:(f,l)=>{
        l.bindTooltip(regionName(n),{sticky:true});
        l.on('mouseover',()=>l.setStyle({weight:2,color:'#5d7c69'}));l.on('mouseout',()=>l.setStyle({weight:n.level?1:0.8,color:'#f6f8f3'}));
        l.on('click',()=>{select(entry.node);clearTimeout(timer);timer=setTimeout(()=>apply(entry.node),260)});
        l.on('dblclick',()=>{clearTimeout(timer);select(entry.node);split(entry.node)});
      }}).addTo(shapes);liveLayers.set(n.id,entry);
      entry.layer.eachLayer(l=>{const el=l.getElement();if(el){el.setAttribute('role','button');el.setAttribute('tabindex','0');el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();select(entry.node);e.shiftKey?split(entry.node):apply(entry.node)}}}});
    }
    entry.node=n;n.layer=entry.layer;
    const fill=m.color||'#cbd7c9';if(entry.fill!==fill){entry.layer.setStyle({fillColor:fill});entry.fill=fill}
    const name=regionName(n);if(entry.name!==name){entry.layer.eachLayer(l=>{l.setTooltipContent(name);l.getElement()?.setAttribute('aria-label',name)});entry.name=name}
    if(entry.icon!==m.icon){if(entry.marker)markers.removeLayer(entry.marker);entry.marker=null;entry.icon=m.icon;if(m.icon){const p=turf.pointOnFeature(n.feature).geometry.coordinates;entry.marker=L.marker([p[1],p[0]],{icon:L.divIcon({className:'map-icon',html:m.icon,iconSize:[32,32]}),interactive:false}).addTo(markers)}}
  }
  renderLegend();$('#count').textContent=tr(`世界 · ${visible.length} 個可編輯區域`);$('#undo').disabled=!history.length;
  renderRegionStatistics(visible);
  if(initialView){initialView=false;homeView()}
};

