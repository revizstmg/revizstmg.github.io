import {test,expect} from '@playwright/test'
import {preparer,etatEleve,attendreAccueil,etat} from './eleve.js'
import {todayKey,addDays} from '../../src/data/srs.js'

// Série de jours : l'horloge qui recule ne la casse pas, et chaque gel couvre un jour manqué (tout ou rien).
const ouvrir=async(page,streak,freezes)=>{
 const errors=await preparer(page,etatEleve({streak,freezes}))
 await page.goto('./#/accueil');await attendreAccueil(page)
 await page.waitForTimeout(800)
 return {errors,s:await etat(page)}
}

test('date de l’appareil reculée : la série est conservée et la récompense n’est pas redonnée',async({page})=>{
 const demain=addDays(todayKey(),1)
 const {errors,s}=await ouvrir(page,{count:5,last:demain},0)
 expect(s.streak).toEqual({count:5,last:demain})
 expect(s.xp||0).toBe(0)
 expect(errors).toEqual([])
})

test('deux jours manqués, deux gels : la série continue et les deux gels sont consommés',async({page})=>{
 const {errors,s}=await ouvrir(page,{count:5,last:addDays(todayKey(),-3)},2)
 expect(s.streak.count).toBe(6)
 expect(s.freezes).toBe(0)
 expect(errors).toEqual([])
})

test('deux jours manqués, un seul gel : la série repart de 1 et le gel est gardé',async({page})=>{
 const {errors,s}=await ouvrir(page,{count:5,last:addDays(todayKey(),-3)},1)
 expect(s.streak.count).toBe(1)
 expect(s.freezes).toBe(1)
 expect(errors).toEqual([])
})
