const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const name of fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.cjs')&&n!=='performance.cjs')){
 const result=spawnSync(process.execPath,[path.join(root,'tests',name)],{cwd:root,stdio:'inherit'});
 if(result.error){console.error(result.error.message);process.exit(1)}if(result.status!==0)process.exit(result.status||1);
}
