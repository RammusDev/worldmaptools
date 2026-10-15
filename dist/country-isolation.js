// Country ownership is defined by this application's separate CHN/TWN roots.
// Dataset membership alone must never attach a Taiwan feature to China.
const countryProtectionCache=new WeakMap();
function isolateCountryFeature(feature,iso,protectedFeatures){
  if(iso!=='CHN')return feature;
  if(!protectedFeatures?.length)throw new Error('台灣保護邊界尚未載入');
  const p=feature.properties||{};
  if(/taiwan|臺灣|台灣/i.test(p.shapeName||p.name||'')||/^(TW|TWN|CN-TW)$/i.test(p.shapeISO||''))return null;
  if(!countryProtectionCache.has(protectedFeatures))countryProtectionCache.set(protectedFeatures,turf.union(turf.featureCollection(protectedFeatures)));
  let result=feature;
  for(const protectedFeature of [countryProtectionCache.get(protectedFeatures)]){
    if(!result)break;
    const a=turf.bbox(result),b=turf.bbox(protectedFeature);
    if(a[2]<b[0]||b[2]<a[0]||a[3]<b[1]||b[3]<a[1])continue;
    result=turf.difference(turf.featureCollection([result,protectedFeature]));
  }
  return result?{...feature,geometry:result.geometry}:null;
}
if(typeof module!=='undefined')module.exports={isolateCountryFeature};
