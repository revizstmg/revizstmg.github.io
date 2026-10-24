import {describe,test,expect,vi,beforeEach} from 'vitest'
vi.mock('../src/reseau.js',()=>({rest:p=>p,enc:encodeURIComponent,getJSON:vi.fn(),send:vi.fn(),rpc:vi.fn()}))
import {cleanClassName} from '../src/data/classIdentity.js'
import {renameTeacherClass,createTeacherClass,fetchStudentClasses,createGroup,fetchClassOverviewQuizzes} from '../src/classroom.js'
import {send,getJSON,rpc} from '../src/reseau.js'
import {classMessages} from '../src/i18n/classes.js'
beforeEach(()=>vi.resetAllMocks())
describe('noms de classe partagés',()=>{
 test('conserve les noms libres et nettoie les espaces sans tronquer',()=>{
  expect(cleanClassName('  Droit  Mme Martin\n1STMG04 ')).toBe('Droit Mme Martin 1STMG04')
  expect(cleanClassName('اللغة والإدارة — 1STMG')).toBe('اللغة والإدارة — 1STMG')
  for(const value of ['', '   ','a'.repeat(61)])expect(()=>cleanClassName(value)).toThrow('CLASS_NAME_INVALID')
  expect(cleanClassName('a'.repeat(60))).toHaveLength(60)
 })
 test('renomme une seule classe de son propriétaire et vérifie la réponse du serveur',async()=>{
  send.mockResolvedValue({json:async()=>[{code:'stmg-abc23',label:'Droit Mme Martin 1STMG04'}]})
  await expect(renameTeacherClass({classCode:'stmg-abc23',ownerId:'owner-1',label:' Droit Mme Martin 1STMG04 '})).resolves.toMatchObject({label:'Droit Mme Martin 1STMG04'})
  const [method,url,payload,prefer]=send.mock.calls[0]
  expect(method).toBe('PATCH');expect(url).toContain('code=eq.stmg-abc23');expect(url).toContain('owner_id=eq.owner-1')
  expect(payload).toEqual({label:'Droit Mme Martin 1STMG04'});expect(prefer).toContain('representation')
  send.mockResolvedValue({json:async()=>[]})
  await expect(renameTeacherClass({classCode:'stmg-abc23',ownerId:'other',label:'Nouvelle classe'})).rejects.toThrow('CLASS_UPDATE_DENIED')
 })
 test('un nom invalide ou une identité absente ne déclenche aucune requête',async()=>{
  await expect(renameTeacherClass({classCode:'stmg-abc23',ownerId:'owner',label:' '})).rejects.toThrow()
  await expect(renameTeacherClass({classCode:'stmg-abc23',label:'Droit'})).rejects.toThrow('CLASS_OWNER_REQUIRED')
  expect(send).not.toHaveBeenCalled()
 })
 test('la création conserve le nom choisi et ne réessaie que les collisions de code',async()=>{
  send.mockRejectedValueOnce(Object.assign(new Error('collision'),{status:409})).mockImplementation(async(method,url,rows)=>({json:async()=>rows}))
  const result=await createTeacherClass({ownerId:'owner',ownerName:'Mme Martin',label:' Droit 1STMG04 ',subject:''})
  expect(result.label).toBe('Droit 1STMG04');expect(result.owner_id).toBe('owner');expect(send).toHaveBeenCalledTimes(2)
 })
 test('les élèves retrouvent les intitulés par leur code, sans lister les classes des autres',async()=>{
  getJSON.mockResolvedValue([{class_code:'stmg-abc23'},{class_code:'stmg-def45'}])
  rpc.mockImplementation(async(name,args)=>{if(args.p_code==='stmg-def45')throw new Error('offline');return [{code:'stmg-abc23',label:'Droit Mme Martin 1STMG04'}]})
  expect(await fetchStudentClasses('student')).toEqual([{code:'stmg-abc23',label:'Droit Mme Martin 1STMG04'},{code:'stmg-def45',label:'stmg-def45'}])
  expect(getJSON).toHaveBeenCalledTimes(1);expect(getJSON.mock.calls[0][0]).toContain('class_member?')
 })
 test('un groupe exige une ligne réellement créée avant de vider le formulaire',async()=>{
  send.mockResolvedValue({json:async()=>[]})
  await expect(createGroup({classCode:'stmg-abc23',name:'Groupe A'})).rejects.toThrow('CLASS_GROUP_CREATE_FAILED')
  send.mockResolvedValue({json:async()=>[{id:'group-1',name:'Groupe A'}]})
  await expect(createGroup({classCode:'stmg-abc23',name:'Groupe A'})).resolves.toMatchObject({id:'group-1'})
 })
 test('la vue d’ensemble ne télécharge pas les banques de questions des quiz',async()=>{
  getJSON.mockResolvedValue([])
  await fetchClassOverviewQuizzes('stmg-abc23')
  const url=getJSON.mock.calls[0][0]
  expect(url).toContain('class_code=eq.stmg-abc23')
  expect(url).not.toContain('questions')
 })
 test('les six langues disposent de tous les nouveaux libellés',()=>{
  const keys=Object.keys(classMessages.fr).sort()
  for(const messages of Object.values(classMessages)){
   expect(Object.keys(messages).sort()).toEqual(keys)
   for(const key of keys)expect(messages[key],key).toBeTruthy()
  }
 })
})
