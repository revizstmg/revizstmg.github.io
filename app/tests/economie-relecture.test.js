import {beforeAll,describe,expect,it} from 'vitest'
import {readFileSync} from 'node:fs'
import {ALL_CHAPTERS,chargerMatiere,themeChapters,flashcardsForSection} from '../src/data/index.js'
import {avecGraine} from './outils.js'
const content=(name)=>JSON.parse(readFileSync(new URL(`../content/${name}.json`,import.meta.url),'utf8'))
const flat=value=>JSON.stringify(value).replace(/\*+/g,'').toLowerCase()
const premiere=content('p1-economie/matiere'),terminale=content('economie/matiere')
const docs=content('p1-economie/etudes-documents')
beforeAll(async()=>{await chargerMatiere('p1-economie');await chargerMatiere('economie')})

describe('relecture économique : cours, corrigés et ressources assemblés',()=>{
 it('PIB : productions marchande et non marchande incluses, croissance corrigée des prix',()=>{
  for(const id of ['p1-eco-t2','eco-t9']){
   const course=flat(ALL_CHAPTERS[id].cours)
   expect(course).toContain('non marchande')
   expect(course).toContain('impôts sur les produits')
   expect(course).toContain('subventions sur les produits')
   expect(course).toContain('en volume')
   expect(course).not.toMatch(/ignore.{0,20}(?:travail non marchand|production gratuite)/)
   const sections=themeChapters(ALL_CHAPTERS[id]);expect(sections.length).toBeGreaterThan(0)
   expect(flat(sections)).toContain('en volume')
  }
  const piege=flat(content('p1-economie/pieges')['p1-eco-t2'])
  expect(piege).toContain('flux de production');expect(piege).not.toContain('richesse totale (niveau du pib)')
 })
 it('revenu disponible : aucune identité exacte proposée comme mauvaise réponse',()=>{
  const q=docs['p1-eco-t3'].questions.find(q=>q.q==='La formule du revenu disponible est…')
  expect(q.choices[q.answer]).toBe('revenus primaires − prélèvements obligatoires + revenus de transfert')
  const rejected=q.choices.filter((_,i)=>i!==q.answer)
  expect(rejected).not.toContain('consommation + épargne')
  expect(rejected).toContain('consommation − épargne')
  expect(q.explain).toContain('leur somme')
 })
 it('financement : épargne et investissement sont comparés, un dividende reste éventuel',()=>{
  const theme=premiere.chapters.find(c=>c.id==='p1-eco-t4')
  const q=theme.games.find(g=>g.id==='p1-eco-t4-qcm').questions[0]
  expect(q.q).toContain('1 000');expect(q.q).toContain('600')
  expect(q.choices[q.answer]).toBe('capacité de financement');expect(q.explain).toContain('400')
  const texte=flat(ALL_CHAPTERS['p1-eco-t4'].cours)
  expect(texte).toContain('épargner ne suffit');expect(texte).toContain('pas garanti')
  expect(flat(docs['p1-eco-t4'])).toContain('besoin de financement de 600')
 })
 it('dette publique : tous les sous-secteurs et seulement les dettes restant dues',()=>{
  const card=terminale.chapters.find(c=>c.id==='eco-t6').games.find(g=>g.type==='flashcard').cards.find(c=>c.front==='Dette publique')
  expect(flat(card.back)).toContain('administrations publiques')
  expect(flat(card.back)).toContain('locales');expect(flat(card.back)).toContain('sécurité sociale')
  expect(flat(card.back)).toContain('rembourser')
  const cours=flat(ALL_CHAPTERS['eco-t6'].cours)
  expect(cours).toContain('emprunt finance ce déficit')
  expect(cours).not.toContain('ce dernier alimente le déficit')
  expect(cours).not.toContain('dette publique = accumulation des déficits')
 })
 it('chômage : statut étudiant ou retraité insuffisant, critères BIT et halo distincts',()=>{
  const cours=flat(ALL_CHAPTERS['eco-t7'].cours)
  expect(cours).toContain('deux semaines');expect(cours).toContain('quatre dernières semaines')
  expect(cours).toContain('trois mois');expect(cours).toContain('pas seulement son statut')
  expect(cours).not.toContain('un étudiant ou un retraité n’entre pas dans le calcul')
  expect(cours).not.toContain('les autres (étudiants, retraités, personnes au foyer) sont inactifs')
 })
 it('épargne, patrimoine et production non marchande : les contre-exemples restent expliqués',()=>{
  const doc=docs['p1-eco-t3'].documents.find(d=>d.id===3).text
  expect(doc).toContain('patrimoine net');expect(doc).toContain('dettes');expect(doc).toContain('héritages')
  const q=docs['p1-eco-t3'].questions.find(q=>q.q.startsWith('Le taux d’épargne'))
  expect(q.choices[q.answer]).toContain('× 100')
  const prod=docs['p1-eco-t2'].documents[0].text
  expect(prod).toContain('économiquement significatif');expect(prod).toContain('dons')
 })
 it('zone euro : attribution au gouvernement et à l’Eurosystème distinguée, cible à moyen terme',()=>{
  const doc=content('economie/etudes-documents')['eco-t6'].documents.find(d=>d.id===3).text
  expect(doc).toContain('Eurosystème');expect(doc).toContain('indépendant des gouvernements')
  const cours=flat(ALL_CHAPTERS['eco-t6'].cours)
  expect(cours).toContain('2 % à moyen terme');expect(cours).toContain('symétrique')
 })
 it('session 2027 : thème 9 inclus dans la préparation écrite et cartes cohérentes',()=>{
  const theme=ALL_CHAPTERS['eco-t9']
  expect(flat(theme)).not.toMatch(/pas évalué à l.écrit/)
  expect(flat(theme)).toContain('session 2027')
  const q=terminale.chapters.find(c=>c.id==='eco-t9').games.find(g=>g.type==='vraifaux').questions[2]
  expect(q.answer).toBe(true);expect(q.statement).toContain('écrit')
  const cards=avecGraine('eco-audit',()=>theme.cours.flatMap((s,i)=>flashcardsForSection(s,theme,i)))
  expect(flat(cards)).not.toMatch(/pas évalué à l.écrit/)
 })
})
