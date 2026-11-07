import {beforeAll,expect,it} from 'vitest'
import {readFileSync} from 'node:fs'
import {ALL_CHAPTERS,chargerMatiere,themeChapters,jeuxDuChapitre,chapitreDuJeu} from '../src/data/index.js'
import {avecGraine} from './outils.js'
const content=name=>JSON.parse(readFileSync(new URL(`../content/${name}.json`,import.meta.url),'utf8'))
const flat=v=>JSON.stringify(v).replace(/\*+/g,'').toLowerCase()
beforeAll(async()=>{await chargerMatiere('p1-economie');await chargerMatiere('economie')})

it('le tri direct/indirect n’est servi que dans le chapitre couvrant actions, obligations et banque',()=>{
 const theme=ALL_CHAPTERS['p1-eco-t4'],chapters=themeChapters(theme)
 const attached=chapters.flatMap((ch,i)=>jeuxDuChapitre(ch,theme).some(g=>g.id==='p1-eco-t4-tri')?[i]:[])
 expect(attached).toEqual([7]);expect(chapitreDuJeu(theme.id,'p1-eco-t4-tri')).toBe(7)
 const section=flat(chapters[attached[0]].section)
 for(const term of ['actions','obligations','banque'])expect(section).toContain(term)
 expect(flat(chapters[4].section)).not.toContain('obligations')
})
it('les trous générés sur le BIT interrogent des critères, jamais le marqueur « cet exemple »',()=>{
 const theme=ALL_CHAPTERS['eco-t7'],chapter=themeChapters(theme)[0]
 let questions=0
 for(let seed=0;seed<20;seed++){
  const games=avecGraine('bit-seconde-'+seed,()=>jeuxDuChapitre(chapter,theme))
  for(const g of games.filter(g=>g.type==='trou'))for(const q of g.questions||[]){
   questions++;expect(flat(q.answer)).not.toMatch(/cet exemple|la situation décrite/)
   expect(q.text).not.toMatch(/Dans ____, seule la troisième/)
  }
 }
 expect(questions).toBeGreaterThan(0)
})
it('les définitions BIT et le QCM documentaire conservent l’alternative emploi déjà trouvé',()=>{
 const full=content('economie/cours-complets'),extra=content('economie/approfondi-1'),doc=content('economie/etudes-documents')['eco-t7']
 const definitions=[content('economie/definitions')['eco-t7'][0][1],full['eco-t7'].cours[1].blocks[0].c,full['eco-t7'].cours[1].blocks[1].rows[1][1],full['eco-t7'].cours[2].blocks[5].rows[1][1],extra['eco-t7'][0].blocks[2].c,content('economie/pieges')['eco-t7'][0],content('economie/enrichissements')['eco-t7'].sections[0].blocks[1].c[1],doc.documents[0].text]
 for(const d of definitions){expect(flat(d)).toContain('trois mois');expect(flat(d)).toMatch(/ou|ou en/);expect(flat(d)).toMatch(/deux semaines/)}
 const q=doc.questions[0];expect(q.choices[q.answer]).toContain('ou en avoir trouvé un')
 expect(doc.questions[7].answer).toContain('ne dispense pas du critère de disponibilité')
})
it('les exercices d’obligations ne recyclent plus intérêt systématiquement fixe et sûreté absolue comme bonnes réponses',()=>{
 const theme=ALL_CHAPTERS['p1-eco-t4'],chapter=themeChapters(theme)[3]
 const text=flat(chapter.section);expect(text).toContain('fixe ou variable');expect(text).toContain('perte en capital')
 let checked=0
 for(let seed=0;seed<10;seed++){
  const games=avecGraine('obligation-seconde-'+seed,()=>jeuxDuChapitre(chapter,theme))
  for(const game of games){
   for(const q of game.questions||[]){
    const answer=typeof q.answer==='number'?q.choices?.[q.answer]:q.answer===true?q.statement:typeof q.answer==='string'?q.answer:null
    if(answer){checked++;expect(flat(answer)).not.toMatch(/intérêt fixé d’avance|plus sûr/)}
   }
   for(const c of game.cards||[])expect(flat(c.back)).not.toMatch(/intérêt fixé d’avance|plus sûr/)
  }
 }
 expect(checked).toBeGreaterThan(0)
})
it('production : activité dissimulée estimée, travail non salarié, capital incorporel et remplacement inclus',()=>{
 const ch=themeChapters(ALL_CHAPTERS['p1-eco-t2'])
 const limits=flat(ch.find(c=>/limites du PIB/i.test(c.title)).section);expect(limits).toContain('activité dissimulée');expect(limits).toContain('estiment et l’intègrent');expect(limits).not.toMatch(/ignore.{0,90}économie souterraine/)
 const factors=flat(ch.find(c=>/facteurs de production/i.test(c.title)).section);expect(factors).toContain('salariée ou non salariée');expect(factors).toContain('corporels ou incorporels');expect(factors).toContain('remplacement');expect(factors).toContain('n’augmente pas')
})
it('les taux directeurs incluent le dépôt et les taux d’emploi et d’activité gardent le même dénominateur',()=>{
 const money=flat(themeChapters(ALL_CHAPTERS['p1-eco-t4'])[6].section)
 for(const term of ['facilité de dépôt','refinancement','prêt marginal'])expect(money).toContain(term)
 const labour=flat(themeChapters(ALL_CHAPTERS['eco-t7'])[9].section)
 expect(labour).not.toContain('trois taux ont des dénominateurs différents')
 expect(labour).toContain('utilisent tous deux');expect(labour).toContain('population active')
})
it('les nuances IDH, dette et pouvoir d’achat restent explicites dans les cours et corrigés',()=>{
 const idh=flat(ALL_CHAPTERS['eco-t9'].cours);expect(idh).not.toMatch(/santé \+ éducation \+ revenu|revenu \+ santé \+ éducation/)
 expect(idh).toContain('trois dimensions');expect(idh).toContain('ne s’obtient pas en additionnant')
 const debt=flat(content('economie/cours-reels')['eco-t6'][2].blocks[0].c)
 expect(debt).toContain('autres opérations financières');expect(debt).not.toContain('déficits accumulés forment')
 const q=content('economie/matiere').chapters.find(t=>t.id==='eco-actu').games.find(g=>g.id==='eco-actu-qcm').questions[0]
 expect(q.explain).toContain('À revenu nominal inchangé');expect(q.explain).toContain('revenus et des prix')
})
