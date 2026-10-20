import {test,expect,vi,afterEach} from 'vitest'
import {parentCode} from '../src/parent.js'
afterEach(()=>vi.unstubAllGlobals())
test('un nouveau code parent utilise l’aléatoire sécurisé et reste stable',()=>{
 const values=new Map();vi.stubGlobal('localStorage',{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)})
 const random=vi.fn(bytes=>{bytes.set([1,2,3,4,5]);return bytes});vi.stubGlobal('crypto',{getRandomValues:random})
 const code=parentCode();expect(code).toMatch(/^P[A-Z2-9]{5}$/);expect(parentCode()).toBe(code);expect(random).toHaveBeenCalledTimes(1)
})
test('un stockage inaccessible ne produit pas un code parent partagé',()=>{
 vi.stubGlobal('localStorage',{getItem(){throw Error('stockage')}})
 expect(parentCode()).toBe('')
})
