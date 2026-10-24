import {beforeAll,test,expect} from 'vitest'
import {readFileSync,existsSync} from 'node:fs'
import {chargerContenu,construirePages,arborescence,sitemap,bloc,riche,SITE,relatedLessons} from '../scripts/pages-cours/generer.mjs'
import {PUBLIC_ROOTS} from '../scripts/pages-cours/sources.mjs'
let pages,paths,tree
beforeAll(async()=>{await chargerContenu();pages=construirePages();paths=new Set(pages.map(p=>p.chemin));tree=arborescence()},60000)
test('chaque cours courant a une page complète et les anciens cours de langues restent écartés',()=>{
 expect(pages.length).toBeGreaterThan(700);expect(paths.size).toBe(pages.length)
 const chapters=tree.flatMap(m=>m.themes.flatMap(t=>t.chapitres))
 for(const c of chapters){const page=pages.find(p=>p.chemin===c.chemin);expect(page).toBeTruthy();for(const b of c.ch.section.blocks||[])if(['p','formula','list','table','frise','example','tip','warning','figure'].includes(b.t))expect(page.html).toContain(bloc(b))}
 expect([...paths].some(p=>/^\/cours\/(premiere|terminale)\/langues\//.test(p))).toBe(false)
 for(const id of ['en','es','it','ar','de']){expect(paths.has('/cours/langues/'+id+'/')).toBe(true);expect(existsSync(new URL('../resources/langues/guide-'+id+'.pdf',import.meta.url))).toBe(true)}
 for(const path of PUBLIC_ROOTS)expect(paths.has(path)).toBe(true)
})
test('métadonnées, provenance et données structurées valides sur toutes les pages',()=>{
 const titres=[]
 for(const p of pages){const html=p.html;const title=html.match(/<title>(.*?)<\/title>/)[1];titres.push(title);expect(title.replace(/&(amp|quot|lt|gt);/g,(_,entity)=>({amp:'&',quot:'\"',lt:'<',gt:'>'}[entity])).length).toBeLessThanOrEqual(100);expect(html.match(/<h1[ >]/g),p.chemin).toHaveLength(1);expect(html).not.toMatch(/(?:src|href)="(?:undefined|null)/);expect(html).toContain('href="'+SITE+p.chemin+'"');expect(html).not.toContain('noindex');expect(html.match(/<meta name="description" content="([^"]+)"/)[1].length).toBeGreaterThan(40);expect(html).not.toMatch(/<(?:script)[^>]*src=/)
  const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));expect(schema[0]['@type']).toBe('BreadcrumbList');if(html.includes('<article class="cours">')){const resource=schema.find(s=>s['@type']==='LearningResource');expect(resource.url).toBe(SITE+p.chemin);expect(resource.citation).toContain('https://eduscol.education.gouv.fr/5862/programmes-et-ressources-en-serie-stmg');expect(html).toContain('Matys DONAT');expect(html).toContain('Gabriel MERLIN')}
 }
 expect(new Set(titres).size).toBe(titres.length)
 const about=pages.find(p=>p.chemin==='/a-propos/').html;expect(about).toContain('Ils sont élèves');expect(about).toContain('ne signifie pas que chaque fiche a été validée par un professeur')
})
test('tous les liens internes des pages HTML mènent à une page, un asset prévu ou une vraie route de l’app',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8'),routes=[...app.matchAll(/<Route path="([^"]+)"/g)].filter(m=>m[1]!=='*').map(m=>new RegExp('^'+m[1].replace(/:[A-Za-z]+/g,'[^/]+')+'$'))
 const assets=['/cours/cours.css','/favicon.png',...['en','es','it','ar','de'].map(l=>'/cours/langues/guide-'+l+'.pdf')]
 for(const p of pages)for(const [,href] of p.html.matchAll(/href="([^"]+)"/g)){
  if(!href.startsWith('/')||href.startsWith('//'))continue
  if(href.startsWith('/#/')){expect(routes.some(r=>r.test(href.slice(2))),p.chemin+' '+href).toBe(true);continue}
  const target=href.split('#')[0]||p.chemin
  expect(target==='/'||paths.has(target)||assets.includes(target),p.chemin+' '+href).toBe(true)
 }
})
test('les liens croisés sont des passerelles de lecture pertinentes, au même niveau, sans copier d’exercices',()=>{
 const all=tree.flatMap(m=>m.themes.flatMap(t=>t.chapitres.map(ch=>({...ch,subject:m.s,niveau:m.niveau}))))
 let count=0;for(const current of all){const related=relatedLessons(current,all);for(const r of related){count++;expect(r.niveau).toBe(current.niveau);expect(r.subject.id).not.toBe(current.subject.id);expect(paths.has(r.chemin)).toBe(true)}}expect(count).toBeGreaterThan(0)
})
test('sitemap sans fragments ni doublons et contenu protégé contre les balises injectées',()=>{
 const xml=sitemap(pages),urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);expect(urls).toHaveLength(pages.length+1);expect(new Set(urls).size).toBe(urls.length);expect(urls.every(u=>u.startsWith(SITE+'/')&&!u.includes('#'))).toBe(true)
 expect(riche('<script>alert(1)</script>')).not.toContain('<script>');expect(riche('**contrat**')).toBe('<strong>contrat</strong>')
 expect(bloc({t:'figure',name:'tva'})).toContain('<svg')
})
