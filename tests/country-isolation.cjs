const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
global.turf=require('../dist/turf.min.js');
const {isolateCountryFeature}=require('../dist/country-isolation.js');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,p),'utf8'));
const world=read('../dist/world.geojson'),taiwanData=read('../dist/taiwan.geojson'),china=read('china-adm1.geojson');
const protectedFeatures=[world.features.find(f=>f.properties['ISO3166-1-Alpha-3']==='TWN'),...taiwanData.features];
assert(china.features.some(f=>f.properties.shapeName==='Taiwan Province'),'fixture reproduces original overlap');
const cleaned=china.features.map(f=>isolateCountryFeature(f,'CHN',protectedFeatures)).filter(Boolean);
assert(!cleaned.some(f=>/taiwan/i.test(f.properties.shapeName)));
for(const f of cleaned)for(const t of protectedFeatures){const intersection=turf.intersect(turf.featureCollection([f,t]));assert(!intersection||turf.area(intersection)<0.01,'China geometry must not cover Taiwan or its offshore counties');}
assert.throws(()=>isolateCountryFeature(china.features[0],'CHN',[]));
assert.equal(isolateCountryFeature(taiwanData.features[0],'TWN',protectedFeatures),taiwanData.features[0]);
const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
const ctx={turf,isolateCountryFeature,world,taiwanData,taiwanProtection:protectedFeatures,nodes:{},state:{marks:{},labels:{},splits:[]},history:[],busy:false,mode:'color',color:'#ff0000',icon:'★',selected:null,terminalTypes:/county|district|municipalit/i,$:()=>({disabled:false}),status:()=>{},checkpoint:()=>{},save:()=>{},confirm:()=>true,labelFor:async()=>true,map:{fitBounds:()=>{}},render:()=>{for(const n of Object.values(ctx.nodes))n.layer={getBounds:()=>[]}},select:()=>{},getLevel:async(iso,level)=>({data:iso==='TWN'?taiwanData:china,meta:{boundaryCanonical:iso==='TWN'?'縣／市':'Provinces'}})};
vm.createContext(ctx);
for(const name of ['key','rootNodes','mark','leaves','apply','descendants','split','merge','restore'])vm.runInContext(app.match(new RegExp('^(?:async )?function '+name+'\\(.*$','m'))[0],ctx);
(async()=>{
 ctx.rootNodes();ctx.render();const chn=Object.values(ctx.nodes).find(n=>n.iso==='CHN'),twn=Object.values(ctx.nodes).find(n=>n.iso==='TWN');
 ctx.state.marks[twn.id]={color:'#123456',icon:'♥'};const baseline=JSON.stringify(ctx.state.marks[twn.id]);
 await ctx.apply(chn);await ctx.split(chn);assert(chn.children.length===cleaned.length);assert.equal(JSON.stringify(ctx.state.marks[twn.id]),baseline);
 ctx.mode='icon';await ctx.apply(ctx.nodes[chn.children[0]]);ctx.mode='erase';await ctx.apply(chn);assert.equal(JSON.stringify(ctx.state.marks[twn.id]),baseline);
 ctx.selected=chn;ctx.merge();assert.equal(JSON.stringify(ctx.state.marks[twn.id]),baseline);assert(ctx.nodes[twn.id]);
 await ctx.split(twn);const county=ctx.nodes[twn.children.find(id=>ctx.nodes[id].name==='Kinmen')];ctx.state.marks[county.id]={color:'#654321',icon:'◆'};const countyBaseline=JSON.stringify(ctx.state.marks[county.id]);
 await ctx.split(chn);ctx.mode='color';await ctx.apply(ctx.nodes[chn.children[0]]);ctx.mode='erase';await ctx.apply(chn);ctx.selected=chn;ctx.merge();assert.equal(JSON.stringify(ctx.state.marks[county.id]),countyBaseline);
 // A malformed cross-country link cannot inherit China marks or be cleared by China.
 twn.parent=chn.id;chn.children.push(twn.id);delete ctx.state.marks[twn.id];ctx.state.marks[chn.id]={color:'#ffffff'};assert.equal(Object.keys(ctx.mark(twn)).length,0);assert(!ctx.descendants(chn).includes(twn));twn.parent=null;chn.children=[];
 ctx.state.marks[twn.id]=JSON.parse(baseline);const oldTaiwan=china.features.find(f=>/taiwan/i.test(f.properties.shapeName));const staleId='CHN:1:'+oldTaiwan.properties.shapeID;
 await ctx.restore({marks:{[twn.id]:JSON.parse(baseline),[staleId]:{color:'#ff0000'}},labels:{},splits:[chn.id,staleId]});assert(!ctx.nodes[staleId]);assert.equal(JSON.stringify(ctx.state.marks[twn.id]),baseline);assert(!ctx.state.splits.includes(staleId));
 console.log('PASS: real China ADM1 has no Taiwan overlap; China split/paint/icon/erase/merge preserve Taiwan and Kinmen; old saves migrate; cross-country inheritance is blocked.');
})().catch(e=>{console.error(e);process.exitCode=1});
