import {test,expect,vi,afterEach} from 'vitest'
import {parentCode,normParentCode,LONGUEUR_CODE_PARENT} from '../src/parent.js'
afterEach(()=>vi.unstubAllGlobals())
test('un nouveau code parent utilise l’aléatoire sécurisé, fait 10 caractères et reste stable',()=>{
 const values=new Map();vi.stubGlobal('localStorage',{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)})
 const random=vi.fn(bytes=>{bytes.set([1,2,3,4,5,6,7,8,9].slice(0,bytes.length));return bytes});vi.stubGlobal('crypto',{getRandomValues:random})
 const code=parentCode();expect(LONGUEUR_CODE_PARENT).toBe(10);expect(code).toMatch(/^P[A-Z2-9]{9}$/);expect(parentCode()).toBe(code);expect(random).toHaveBeenCalledTimes(1)
})
test('un stockage inaccessible ne produit pas un code parent partagé',()=>{
 vi.stubGlobal('localStorage',{getItem(){throw Error('stockage')}})
 expect(parentCode()).toBe('')
})
test('le parent peut saisir un ancien code de 6 caractères comme un nouveau de 10',()=>{
 expect(normParentCode('pabc23')).toBe('PABC23')
 expect(normParentCode('p-abc 234 xyz')).toBe('PABC234XYZ')
 expect(normParentCode('PABCDEFGHJKLMNP')).toHaveLength(12)
})
