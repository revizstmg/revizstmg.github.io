import {test,expect} from 'vitest'
import {collectReward,SHOP_REWARDS,rewardProgress} from '../src/data/shop.js'
import {buildRewardKit} from '../src/data/rewardKit.js'
const state=()=>({track:{level:'terminale-stmg',specialty:'gestion-finance'},profile:{firstName:'Léa'},xp:6500,coins:42,freezes:0,owned:[],chapters:Object.fromEntries(Array.from({length:10},(_,i)=>['t'+i,{quiz:90}])),shopRewards:{},reussites:[{themeId:'droit-t5',type:'qcm',q:{q:'Question de cours',choices:['Erreur','Réponse juste'],answer:1}}],erreurs:[]})
test('les kits exigent les résultats distincts et une collecte ; ils ne modifient pas le compte',()=>{
 const before=state();expect(()=>buildRewardKit(before,'kit-bac')).toThrow('reward_locked')
 const claimed=collectReward(before,'kit-bac','2026-10-25T00:00:00Z');expect(claimed.freezes).toBe(5);expect(collectReward(claimed,'kit-bac')).toBe(claimed)
 const kit=buildRewardKit(claimed,'kit-bac');expect(kit.plan).toHaveLength(14);expect(kit.cards[0].answer).toBe('Réponse juste');expect(kit.errors).toEqual([]);expect(claimed.coins).toBe(42);expect(before.freezes).toBe(0)
 const insufficient={...before,chapters:{one:{quiz:100}}};expect(rewardProgress(insufficient,SHOP_REWARDS.find(r=>r.id==='kit-bac')).eligible).toBe(false)
})
test('la collection offerte est unique, permanente et sans crédit payant',()=>{
 const before={...state(),xp:12200,chapters:Object.fromEntries(Array.from({length:15},(_,i)=>['t'+i,{quiz:90}]))},next=collectReward(before,'collection-complete')
 expect(next.owned).toContain('av-fox');expect(next.owned).toContain('pal-nebuleuse');expect(next.coins).toBe(before.coins);expect(collectReward(next,'collection-complete')).toBe(next);expect(next.subscription).toBeUndefined()
})
