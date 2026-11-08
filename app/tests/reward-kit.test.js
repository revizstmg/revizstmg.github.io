import {test,expect} from 'vitest'
import {collectReward,SHOP_REWARDS,SHOP_ITEMS,rewardProgress,equipItem,purchaseItem} from '../src/data/shop.js'
import {buildRewardKit} from '../src/data/rewardKit.js'
import {mergeProgress} from '../src/progression.js'
const state=()=>({track:{level:'terminale-stmg',specialty:'gestion-finance'},profile:{firstName:'Léa'},xp:6500,coins:42,freezes:0,owned:[],chapters:Object.fromEntries(Array.from({length:10},(_,i)=>['t'+i,{quiz:90}])),shopRewards:{},reussites:[],erreurs:[]})
test('les anciens kits deviennent des collections équipables sans suivi offert',()=>{
 const before=state()
 for(const id of ['kit-semaine','kit-maitrise','kit-bac']){
  const reward=SHOP_REWARDS.find(r=>r.id===id)
  expect(reward.kit).toBeUndefined();expect(reward.itemIds.length).toBeGreaterThanOrEqual(2)
  expect(reward.gift).not.toMatch(/planning|bilan|personnalisé|questions|programme/i)
  const next=collectReward(before,id)
  for(const itemId of reward.itemIds){expect(next.owned).toContain(itemId);expect(SHOP_ITEMS.find(i=>i.id===itemId).rewardOnly).toBe(true);expect(purchaseItem({...before,xp:90000,coins:90000},itemId).owned).not.toContain(itemId)}
  expect(next.coins).toBe(42);expect(collectReward(next,id)).toBe(next)
  expect(()=>buildRewardKit(next,id)).toThrow('reward_locked')
 }
 expect(rewardProgress({...before,chapters:{one:{quiz:100}}},SHOP_REWARDS.find(r=>r.id==='kit-bac')).eligible).toBe(false)
 const prestige=collectReward(before,'kit-bac')
 expect(prestige.freezes).toBe(5);expect(equipItem(prestige,'av-griffon').customTheme.avatar).toBe('🦅')
 expect(equipItem(prestige,'pal-prestige').customTheme.accent).toBe('#8a651d');expect(equipItem(prestige,'title-conquete').customTheme.title).toBe('Esprit de conquête')
 expect(before.freezes).toBe(0);expect(before.owned).toEqual([])
})
test('ancien lot réclamé : nouveaux objets une seule fois, sans recréditer gels ou pièces',()=>{
 const receipt={claimedAt:'2026-10-25T00:00:00Z',status:'collected'}
 const legacy={...state(),xp:0,chapters:{},freezes:2,coins:7,shopWalletUpdatedAt:100,shopRewards:{'kit-bac':receipt}}
 const reward=SHOP_REWARDS.find(r=>r.id==='kit-bac')
 expect(rewardProgress(legacy,reward).eligible).toBe(false);expect(rewardProgress(legacy,reward).missingItems).toEqual(reward.itemIds)
 const next=collectReward(legacy,'kit-bac')
 expect(next.owned).toEqual(expect.arrayContaining(reward.itemIds));expect(next.freezes).toBe(2);expect(next.coins).toBe(7)
 expect(next.shopWalletUpdatedAt).toBe(100);expect(next.shopRewards['kit-bac']).toBe(receipt)
 expect(legacy.owned).toEqual([]);expect(collectReward(next,'kit-bac')).toBe(next)
 for(const merged of [mergeProgress(legacy,next),mergeProgress(next,legacy)]){expect(merged.owned).toEqual(expect.arrayContaining(reward.itemIds));expect(collectReward(merged,'kit-bac')).toBe(merged);expect(merged.freezes).toBe(2)}
})
test('la collection offerte est permanente et son ancien reçu permet de récupérer les nouveaux objets',()=>{
 const before={...state(),xp:12200,chapters:Object.fromEntries(Array.from({length:15},(_,i)=>['t'+i,{quiz:90}]))},next=collectReward(before,'collection-complete')
 expect(next.owned).toContain('av-fox');expect(next.owned).toContain('pal-nebuleuse');expect(next.owned).toContain('pal-prestige');expect(next.coins).toBe(before.coins);expect(collectReward(next,'collection-complete')).toBe(next);expect(next.subscription).toBeUndefined()
 const legacy={...next,xp:0,owned:next.owned.filter(id=>!['av-colibri','pal-prestige'].includes(id)),freezes:1},exchanged=collectReward(legacy,'collection-complete')
 expect(exchanged.owned).toContain('av-colibri');expect(exchanged.owned).toContain('pal-prestige');expect(exchanged.freezes).toBe(1);expect(collectReward(exchanged,'collection-complete')).toBe(exchanged)
})
test('les objets gagnés restent après fusion et ne donnent aucun abonnement',()=>{
 const next=collectReward(state(),'kit-maitrise')
 expect(next.freezes).toBe(3);expect(next.subscription).toBeUndefined();expect(next.account).toBeUndefined()
 for(const merged of [mergeProgress(state(),next),mergeProgress(next,state())]){expect(merged.owned).toContain('banner-astral');expect(collectReward(merged,'kit-maitrise')).toBe(merged)}
})
test('la bibliothèque PDF conserve Unicode sans accès aux kits personnalisés des récompenses',async()=>{
 const {readFileSync}=await import('node:fs'),{buildRewardKitPdf}=await import('../src/data/rewardKit.js')
 const doc=await buildRewardKitPdf({kind:'semaine',title:'Document de test',name:'محمد',xp:0,plan:[],themes:[],errors:[],cards:[]},readFileSync(new URL('../resources/fonts/DejaVuSans.ttf',import.meta.url)).toString('base64'))
 const pdf=Buffer.from(doc.output('arraybuffer')).toString('latin1')
 expect(doc.getFont().fontName).toBe('DejaVu');expect(pdf).toContain('/FontFile2');expect(pdf).toContain('/ToUnicode')
})
