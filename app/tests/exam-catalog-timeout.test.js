import {test,expect,vi,afterEach} from 'vitest'
vi.mock('../src/data/index.js',()=>({SUBJECTS:[],chargerTout:vi.fn(),themeChapters:vi.fn()}))
import {chargerTout} from '../src/data/index.js'
import {examCatalog} from '../src/data/examenPersonnalise.js'
afterEach(()=>{vi.useRealTimers();vi.clearAllMocks()})
test('catalogue : un module silencieux libère la demande en trente secondes, puis peut être relancé',async()=>{
 vi.useFakeTimers();chargerTout.mockImplementationOnce(()=>new Promise(()=>{}))
 const p=examCatalog();const e=expect(p).rejects.toThrow('Le serveur ne répond pas');await vi.advanceTimersByTimeAsync(30001);await e
 chargerTout.mockResolvedValueOnce();expect(await examCatalog()).toEqual([])
})
