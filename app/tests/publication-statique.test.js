import {test,expect} from 'vitest'
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
test('publier remplace les dossiers générés sans effacer les sources ni les assets de la version précédente',()=>{
 const root=mkdtempSync(join(tmpdir(),'revizstmg-public-')),dist=join(root,'dist'),site=join(root,'site')
 const file=(base,path,value)=>{const full=join(base,path);mkdirSync(full.slice(0,full.lastIndexOf('/')),{recursive:true});writeFileSync(full,value)}
 try{
  file(dist,'assets/nouveau.js','nouveau');file(dist,'index.html','index neuf');file(dist,'sw.js','const PRECACHE = ["./assets/nouveau.js"]');file(dist,'cours/droit/index.html','Cours neuf');file(dist,'a-propos/index.html','Auteurs réels');file(dist,'partager/index.html','Partager');file(dist,'sitemap.xml','plan neuf')
  file(site,'assets/ancien.js','ancien');file(site,'assets/trop-vieux.js','à supprimer');file(site,'sw.js','const PRECACHE = ["./assets/ancien.js"]');file(site,'cours/retire/index.html','cours retiré');file(site,'app/source.txt','source conservée');file(site,'docs/notes.md','documentation conservée')
  execFileSync(process.execPath,[new URL('../scripts/publier.mjs',import.meta.url).pathname,dist,site])
  expect(readFileSync(join(site,'cours/droit/index.html'),'utf8')).toBe('Cours neuf');expect(existsSync(join(site,'cours/retire/index.html'))).toBe(false)
  expect(readFileSync(join(site,'app/source.txt'),'utf8')).toBe('source conservée');expect(existsSync(join(site,'docs/notes.md'))).toBe(true);expect(existsSync(join(site,'assets/ancien.js'))).toBe(true);expect(existsSync(join(site,'assets/trop-vieux.js'))).toBe(false)
 }finally{rmSync(root,{recursive:true,force:true})}
})
