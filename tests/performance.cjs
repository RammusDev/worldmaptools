const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),turf=require('../dist/turf.min.js'),path=require('path'),{performance}=require('perf_hooks');
if(!process.argv[2]||!process.argv[3]){console.log('Usage: node tests/performance.cjs MAP_JSON RUSSIA_ADM1_GEOJSON');process.exit(0)} const state=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const world=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/world.geojson'),'utf8'));
const data=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const root={id:'RUS:0:Russia',iso:'RUS',feature:world.features.find(f=>f.properties.name==='Russia'),parent:null,children:[]},nodes={[root.id]:root};
for(const f of data.features){const id='RUS:1:'+f.properties.shapeID;nodes[id]={id,iso:'RUS',feature:f,parent:root.id,children:[],name:f.properties.shapeName};root.children.push(id)}
function load(source){const ctx={turf,state:structuredClone(state),nodes:structuredClone(nodes),hasMark(n){return !!(ctx.state.marks[n.id]?.color||ctx.state.marks[n.id]?.icon)}};vm.createContext(ctx);vm.runInContext(source.match(/function displayNodes\(n\)\{[\s\S]*?\n\}/)[0],ctx);return ctx}
const before=load(fs.readFileSync(path.join(__dirname,'editor-before.fixture.js'),'utf8')),after=load(fs.readFileSync(path.join(__dirname,'../dist/editor-actions.js'),'utf8'));
let t=performance.now();for(let i=0;i<3;i++)before.displayNodes(before.nodes[root.id]);const oldMs=performance.now()-t;
after.displayNodes(after.nodes[root.id]);t=performance.now();let geom;for(let i=0;i<100;i++){after.state.marks[root.id]={color:i%2?'#ff0000':'#0000ff'};const out=after.displayNodes(after.nodes[root.id]);if(geom)assert.equal(out[0].feature.geometry,geom);geom=out[0].feature.geometry}const newMs=performance.now()-t;
const keptId=state.merged[root.id][0];delete after.state.marks[keptId].color;assert.notEqual(after.displayNodes(after.nodes[root.id])[0].feature.geometry,geom,'removing a retained mark invalidates geometry');
assert(newMs/100<50,'cached color edits should not perform heavy clipping');
console.log(JSON.stringify({oldThreeGeometryPassesMs:Math.round(oldMs),cached100ColorEditsMs:+newMs.toFixed(2),cachedPerColorEditMs:+(newMs/100).toFixed(3)}));

