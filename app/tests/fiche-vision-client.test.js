import {test,expect,vi,afterEach} from 'vitest'
import {analyzeWithVision} from '../src/ficheVision.js'
afterEach(()=>vi.unstubAllGlobals())
test('refuse un lot trop grand sans analyser seulement une partie ni appeler le fournisseur',async()=>{
 const fetch=vi.fn();vi.stubGlobal('fetch',fetch)
 await expect(analyzeWithVision(Array.from({length:5},()=>({type:'image/png'})))).rejects.toMatchObject({code:'too_many_images'})
 expect(fetch).not.toHaveBeenCalled()
})
