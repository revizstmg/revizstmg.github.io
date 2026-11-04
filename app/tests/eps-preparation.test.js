import {describe,it,expect} from 'vitest'
import {activities,eventsFor,metricFor,parsePerformance,formatPerformance,validateSelection,validatePreparation,buildPreparation,emptySport,emptyPreparation,readPreparation,savePreparation,draftKey} from '../src/data/epsPreparation.js'
import {messages,epsPreparationText} from '../src/i18n/epsPreparation.js'
const trio=()=>({category:'g',sports:[{...emptySport('courses'),current:'3:30',target:'3:08'},{...emptySport('badminton'),current:'5',target:'9'},{...emptySport('yoga'),current:'8',target:'8'}]})
describe('préparation EPS en trois sports',()=>{
 it('respecte les trois champs et ne laisse pas une sélection arbitraire devenir un CCF',()=>{
  expect(validateSelection(trio())).toBe(null)
  expect(validateSelection(emptyPreparation())).toBe('categoryRequired')
  const d=trio();d.sports[2]=emptySport('tennis-table');expect(validateSelection(d)).toBe('differentFields')
  d.sports[2]=emptySport('badminton');expect(validateSelection(d)).toBe('differentSports')
  d.sports[2]=emptySport('fake');expect(validateSelection(d)).toBe('sportsRequired')
 })
 it('dispose d’un indicateur adapté pour les 26 activités et des 24 épreuves nationales exactes',()=>{
  expect(activities).toHaveLength(26)
  expect(['courses','sauts','lancers','natation-vitesse'].flatMap(eventsFor)).toHaveLength(24)
  for(const a of activities)expect(metricFor(emptySport(a.id)),a.id).toBeTruthy()
  expect(metricFor({...emptySport('courses'),eventId:'longueur'})).toBe(null)
  for(const id of ['courses','sauts','lancers','natation-vitesse'])for(const e of eventsFor(id))for(const category of ['g','f']){
   const d=trio();d.category=category;d.sports[0]={...emptySport(id),eventId:e.id,current:'2',target:'3'}
   expect(buildPreparation(d).sports[0].reference).toBeGreaterThan(0)
  }
 })
 it('lit les minutes, secondes, décimales françaises et chiffres arabes sans accepter des valeurs incohérentes',()=>{
  const m=metricFor(emptySport('courses'))
  for(const [input,want] of [['3:30',210],['3’30',210],['210',210],['3:30,5',210.5],['٣:٣٠',210]])expect(parsePerformance(input,m)).toBe(want)
  for(const input of ['', '3:60','-5','Infinity','1e3','3:20x','9999999','0'])expect(parsePerformance(input,m)).toBe(null)
  const count=metricFor(emptySport('badminton'));expect(parsePerformance('0',count)).toBe(0)
  for(const input of ['11','2,5','-1'])expect(parsePerformance(input,count)).toBe(null)
  expect(formatPerformance(59.96,m)).toBe('1:00')
 })
 it('adapte la fiche à l’écart réel et au barème sélectionné sans inventer une note',()=>{
  const d=trio(),r=buildPreparation(d)
  expect(r.sports[0]).toMatchObject({current:210,target:188,gap:22,reference:188,afl2:4,afl3:4,priorityId:'technique'})
  expect(r.sports[1]).toMatchObject({intermediate:6,reference:null,priorityId:'technique'})
  expect(r.sports[2].priorityId).toBe('consolidation')
  expect(r.sports[0].grade).toBeUndefined()
  d.category='f';d.sports[0]={...d.sports[0],current:'4:10',target:'3:56',split:'6-2'}
  expect(buildPreparation(d).sports[0]).toMatchObject({reference:236,gap:14,afl2:6,afl3:2,priorityId:'regularite'})
  d.sports[1]={...d.sports[1],current:'0',target:'10'};expect(buildPreparation(d).sports[1].intermediate).toBe(1)
 })
 it('refuse les valeurs manquantes, les épreuves hors sport et les répartitions incorrectes',()=>{
  const d=trio();d.sports[0].target='3:99';d.sports[1].split='8-8'
  expect(validatePreparation(d)).toMatchObject({'0.target':'invalidPerformance','1.split':'invalidSplit'})
  expect(()=>buildPreparation(d)).toThrow()
 })
 it('conserve uniquement le brouillon du compte et résiste au stockage indisponible ou altéré',()=>{
  const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}
  expect(savePreparation(storage,draftKey('A'),trio())).toBe(true)
  expect(readPreparation(storage,draftKey('A'))).toEqual(trio())
  expect(readPreparation(storage,draftKey('B'))).toEqual(emptyPreparation())
  storage.setItem(draftKey('A'),'{cassé');expect(readPreparation(storage,draftKey('A'))).toEqual(emptyPreparation())
  const d=trio();d.sports[0].eventId='longueur';storage.setItem('tamper',JSON.stringify({version:1,...d}))
  expect(readPreparation(storage,'tamper').sports[0]).toMatchObject({eventId:'d800',current:'',target:''})
  expect(savePreparation({setItem(){throw Error('quota')}},'A',trio())).toBe(false)
 })
 it('traduit les contrôles et garde les mêmes variables dans les six langues',()=>{
  const keys=Object.keys(messages.fr).sort()
  for(const book of Object.values(messages)){
   expect(Object.keys(book).sort()).toEqual(keys)
   for(const key of keys){expect(book[key]).toBeTruthy();expect(book[key].match(/\{\w+\}/g)||[]).toEqual(messages.fr[key].match(/\{\w+\}/g)||[])}
  }
  expect(epsPreparationText('de','sport',{n:3})).toBe('Sportart 3')
 })
})
