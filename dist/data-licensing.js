const boundarySources=new Map();
const dataLicenseDefinitions={
  'PDDL-1.0':{name:'Public Domain Dedication and License 1.0',url:'https://opendatacommons.org/licenses/pddl/1-0/'},
  'Public-Domain':{name:'Public Domain',url:'https://www.geoboundaries.org/api.html'},
  'ODbL-1.0':{name:'Open Database License 1.0',url:'https://opendatacommons.org/licenses/odbl/1-0/'},
  'CC-BY-4.0':{name:'Creative Commons Attribution 4.0',url:'https://creativecommons.org/licenses/by/4.0/'},
  'CC0-1.0':{name:'CC0 1.0',url:'https://creativecommons.org/publicdomain/zero/1.0/'},
  'dl-de-by-2.0':{name:'Data licence Germany – attribution 2.0',url:'https://www.govdata.de/dl-de/by-2-0'},
  'Etalab-2.0':{name:'Etalab Open Licence 2.0',url:'https://github.com/etalab/licence-ouverte/blob/master/open-licence.txt'}
};
function classifyDataLicense(label){
  const s=String(label||'').toLowerCase().replace(/[^a-z0-9.]/g,'');
  const names={publicdomain:'Public-Domain','odcpddl1.0':'PDDL-1.0','pddl1.0':'PDDL-1.0','opendatacommonsopendatabaselicense1.0':'ODbL-1.0','odbl1.0':'ODbL-1.0','opendatabaselicenseodbl1.0':'ODbL-1.0','creativecommonsattribution4.0international':'CC-BY-4.0','creativecommonsattribution4.0':'CC-BY-4.0','creativecommonsattribution4.0internationalccby4.0':'CC-BY-4.0','creativecommonsattribution4.0ccby4.0':'CC-BY-4.0','ccby4.0':'CC-BY-4.0','cc01.0':'CC0-1.0','cc01.0universal':'CC0-1.0','creativecommonscc01.0universal':'CC0-1.0','datalicensegermanyattributionversion2.0':'dl-de-by-2.0','datalicencegermanyattributionversion2.0':'dl-de-by-2.0','dldeby20':'dl-de-by-2.0','etalabopenlicense2.0':'Etalab-2.0','etalabopenlicence2.0':'Etalab-2.0'};
  return names[s]||null;
}
function safeSourceUrl(value){try{const raw=String(value||'').trim(),url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw);return url.protocol==='https:'||url.protocol==='http:'?url.href:null}catch{return null}}
function boundaryDownloadUrl(meta){const url=safeSourceUrl(meta.simplifiedGeometryGeoJSON);if(!url||!url.startsWith('https://'))throw Error('Invalid boundary download URL');return url.replace('https://github.com/','https://media.githubusercontent.com/media/').replace('/raw/','/')}
function registerBoundarySource(meta,iso,level){
  if(meta.boundaryISO!==iso||meta.boundaryType!==`ADM${level}`)throw Error('Boundary metadata does not match the requested region');
  const license=classifyDataLicense(meta.boundaryLicense),id=meta.boundaryID||`${iso}-ADM${level}`;
  const record={id,iso,level,provider:meta.boundarySource||'',license_id:license,declared_license:meta.boundaryLicense||'',license_url:license?dataLicenseDefinitions[license].url:safeSourceUrl(meta.licenseSource),source_url:safeSourceUrl(meta.boundarySourceURL),metadata_url:`https://www.geoboundaries.org/api/current/gbOpen/${iso}/ADM${level}/`,download_url:boundaryDownloadUrl(meta),represented_year:meta.boundaryYearRepresented||'',source_updated:meta.sourceDataUpdateDate||'',build_date:meta.buildDate||'',metadata:meta,status:license?'accepted':'review-required',processing:['geoBoundaries simplified geometry','Parent membership may use a representative point','CHN geometry excludes Taiwan country and county/city boundaries','Partial merge can derive parent remainders by polygon union/difference']};
  boundarySources.set(id,record);
  if(!license)throw Error((typeof language!=='undefined'&&language==='zh-Hant'?'此圖層授權尚待確認，暫不載入：':'Layer license requires review; loading blocked: ')+iso+` ADM${level} (${meta.boundaryLicense||'missing'})`);
  return record;
}
async function initializeDataLicensing(){
  const r=await fetch('data-sources.json');if(!r.ok)throw Error('Data source manifest could not be loaded');const manifest=await r.json();
  boundarySources.set(manifest.world.id,manifest.world);
  const taiwan=registerBoundarySource(manifest.taiwan,'TWN',1);taiwan.local_download='taiwan.geojson';taiwan.sha256=manifest.taiwan_sha256;
  document.querySelector('#sources-button').onclick=()=>{renderDataSources();document.querySelector('#sources-dialog').showModal()};
  document.querySelector('#sources-close').onclick=()=>document.querySelector('#sources-dialog').close();
  document.querySelector('#download-provenance').onclick=()=>downloadDataObject('atlas-data-sources.json',{application_version:'1.0.1',sources:[...boundarySources.values()]});
  document.querySelector('#download-boundaries').onclick=()=>downloadDataObject('atlas-boundaries.geojson',boundaryDataExport());
}
function sourceIdsFor(n){return [...boundarySources.values()].filter(s=>s.status==='accepted'&&(s.iso==='WORLD'||s.iso===n.iso||(n.iso==='CHN'&&s.iso==='TWN'))).map(s=>s.id)}
function boundaryDataExport(){
  return {type:'FeatureCollection',application_version:'1.0.1',license:{id:'ODbL-1.0',url:dataLicenseDefinitions['ODbL-1.0'].url,scope:'Derivative database rights held by this project and based on ODbL inputs. Each original source retains its own license.'},notice:'Geographic data only: no colors, symbols or authored legend descriptions. Source licenses remain applicable. ODbL applies to derived database rights based on ODbL sources; permissive source rights are preserved.',modification_method:'data-modifications.json',sources:[...boundarySources.values()].filter(s=>s.status==='accepted'),features:leaves().map(n=>({type:'Feature',geometry:n.feature.geometry,properties:{atlas_id:n.id,name:n.name,country_code:n.iso,administrative_level:n.level,source_ids:sourceIdsFor(n),modified_by_application:n.iso==='CHN'||!!n.residual,processing:n.residual?'parent minus union of retained independently editable regions':n.iso==='CHN'?'subtract Taiwan protection geometry; exclude Taiwan administrative entries':'source geometry'}}))};
}
function downloadDataObject(filename,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function renderDataSources(){
  const box=document.querySelector('#loaded-sources');box.replaceChildren();const en=typeof language!=='undefined'&&language==='en';
  for(const source of boundarySources.values()){
    const row=document.createElement('article');row.className='source-record';row.dataset.userText='true';
    const title=document.createElement('h3');title.textContent=`${source.iso} ${source.level===0?'ADM0':`ADM${source.level}`} · ${source.provider}`;row.append(title);
    const details=document.createElement('p');details.textContent=`${source.declared_license} · ${source.represented_year||'—'} · ${source.id}\n${en?'Source update':'來源更新'}: ${source.source_updated||'—'}\n${en?'geoBoundaries build':'資料建置'}: ${source.build_date||'—'}${source.status==='review-required'?(en?' · BLOCKED: review required':' · 尚待審查：未載入'):''}`;row.append(details);
    for(const [label,url] of [[en?'License':'授權',source.license_url],[en?'Provider':'提供者',source.source_url],[en?'Metadata':'中繼資料',source.metadata_url],[en?'Original data':'原始資料',source.download_url]]){if(!url)continue;const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';row.append(a)}
    if(source.local_download){const a=document.createElement('a');a.textContent=en?'Bundled original':'內附原始資料';a.href=source.local_download;a.download='';row.append(a)}
    box.append(row);
  }
}
const licensingTranslations={'資料來源與授權':'Data sources & licenses','關閉':'Close','下載目前邊界（不含標記）':'Download current boundaries (no markings)','下載來源與版本清單':'Download source/version manifest','修改方法與資料授權':'Modification methods & data licenses','第三方授權與隱私資訊':'Third-party licenses & privacy','原始資料保留各自授權；衍生地理資料按適用的 ODbL 條件提供。':'Original data retains its licenses; derived geographic data is offered under applicable ODbL conditions.'};
