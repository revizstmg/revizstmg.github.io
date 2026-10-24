import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve, AUJOURDHUI } from './eleve.js'

const ID = '00000000-0000-4000-8000-000000000001'
async function ouvrir(page, role,extra={}) {
  const errors = await preparer(page, etatEleve({ account: { id: ID, role }, classCode: role === 'prof' ? '' : 'stmg-abc23',...extra }))
  await page.addInitScript((id) => localStorage.setItem('stmg_session', JSON.stringify({ token: 'test', refresh: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id, email: 'test@test.fr' } })), ID)
  const profile = { id: ID, role, name: 'Léa Test', level: 'terminale-stmg', specialty: 'gestion-finance', class_code: role === 'prof' ? null : 'stmg-abc23', progress: {} }
  const classes = [], members = new Set(role === 'prof' ? [] : ['stmg-abc23'])
  const server = { failCreate: false, failLeave: false, failRename:false, failOverview:false, memberRows:[], groups:[], failGroup:false, meta:null, failMeta:false, quizzes:[], failQuiz:false }
  await page.route('https://*.supabase.co/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method()
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/profiles')) {
      if (method === 'POST') Object.assign(profile, req.postDataJSON()[0])
      if (method === 'PATCH') Object.assign(profile, req.postDataJSON())
      return json([profile])
    }
    if (path.endsWith('/teacher_class')) {
      if (method === 'POST') {
        if (server.failCreate) return json({ message: 'indisponible' }, 503)
        classes.push(req.postDataJSON()[0]); return json([classes.at(-1)])
      }
      if(method==='PATCH'){
        if(server.failRename)return json({message:'indisponible'},503)
        const code=url.searchParams.get('code')?.slice(3),owner=url.searchParams.get('owner_id')?.slice(3)
        const row=classes.find(c=>c.code===code&&c.owner_id===owner)
        if(!row)return json([])
        Object.assign(row,req.postDataJSON());return json([row])
      }
      return json(classes)
    }
    if (path.endsWith('/rpc/revizstmg_classe')) {
      const code = req.postDataJSON().p_code
      return json(classes.find(c=>c.code===code)?[classes.find(c=>c.code===code)]:['stmg-abc23','stmg-def45'].includes(code)?[{code,label:code==='stmg-abc23'?'Droit Mme Martin · 1STMG04':'Management · 1STMG04'}]:[])
    }
    if(path.endsWith('/class_group')){
      if(method==='POST'){
        if(server.failGroup)return json({message:'indisponible'},503)
        const row={id:'group-'+(server.groups.length+1),...req.postDataJSON()[0]};server.groups.push(row);return json([row])
      }
      return json(server.groups)
    }
    if(path.endsWith('/class_meta')){
      if(method==='POST'){
        if(server.failMeta)return json({message:'indisponible'},503)
        server.meta={...server.meta,...req.postDataJSON()[0]};return json([])
      }
      return json(server.meta?[server.meta]:[])
    }
    if(path.endsWith('/class_quiz')){
      if(method==='POST'){
        if(server.failQuiz)return json({message:'indisponible'},503)
        const row={id:'quiz-'+(server.quizzes.length+1),...req.postDataJSON()[0]};server.quizzes.push(row);return json([row])
      }
      if(method==='PATCH'){
        const row=server.quizzes.find(q=>q.id===url.searchParams.get('id')?.slice(3));if(row)Object.assign(row,req.postDataJSON());return json([])
      }
      return json(server.quizzes)
    }
    if(server.failOverview&&path.endsWith('/class_wall'))return json({message:'indisponible'},503)
    if (path.endsWith('/class_member')) {
      if (method === 'POST') { members.add(req.postDataJSON()[0].class_code); return json([]) }
      if (method === 'DELETE') {
        if (server.failLeave) return json({ message: 'indisponible' }, 503)
        members.delete(url.searchParams.get('class_code').slice(3)); return json([])
      }
      if (url.searchParams.get('select') === 'class_code') return json([...members].map((class_code) => ({ class_code })))
      return json(server.memberRows)
    }
    return json([])
  })
  await page.goto('./#/classe')
  await attendreAccueil(page)
  return { errors, classes, members, server }
}

test('professeur : créer deux classes, basculer et retrouver les deux après rechargement', async ({ page }) => {
  const { errors, classes, server } = await ouvrir(page, 'prof')
  await page.getByRole('button', { name: /Générer.*code/ }).click()
  await expect.poll(() => classes.length).toBe(1)
  await page.getByRole('button', { name: /Créer une nouvelle classe/ }).click()
  await page.getByRole('button',{name:/Générer.*code/}).click()
  await expect(page.getByLabel('Classe active',{exact:true})).toHaveValue(classes[1].code)
  await page.getByLabel('Classe active',{exact:true}).selectOption(classes[0].code)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Classe 1')
  await page.reload(); await attendreAccueil(page)
  await expect(page.getByLabel('Classe active',{exact:true}).locator('option')).toHaveText(['Classe 1','Classe 2'])
  server.failCreate = true
  await page.getByRole('button', { name: /Créer une nouvelle classe/ }).click()
  await page.getByRole('button',{name:/Générer.*code/}).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de mettre à jour')
  expect(classes).toHaveLength(2)
  expect(errors).toEqual([])
})

test('élève : rejoindre deux classes, changer, retrouver et quitter seulement la classe choisie', async ({ page }) => {
  const { errors, members, server } = await ouvrir(page, 'eleve')
  await page.locator('.class-membership summary').click()
  await page.getByRole('button', { name: 'Rejoindre une autre classe', exact: true }).click()
  await page.getByLabel('Code de classe', { exact: true }).fill('stmg-def45')
  await page.getByRole('button', { name: 'Rejoindre', exact: true }).click()
  await expect.poll(() => members.size).toBe(2)
  if(await page.locator('.class-membership').getAttribute('open')===null)await page.locator('.class-membership summary').click()
  await expect(page.getByLabel('Classe active',{exact:true}).locator('option[value="stmg-abc23"]')).toHaveText('Droit Mme Martin · 1STMG04')
  await page.getByLabel('Classe active',{exact:true}).selectOption('stmg-abc23')
  await expect.poll(async () => (await etat(page)).classCode).toBe('stmg-abc23')
  await page.reload(); await attendreAccueil(page)
  if(await page.locator('.class-membership').getAttribute('open')===null)await page.locator('.class-membership summary').click()
  await expect(page.getByLabel('Classe active',{exact:true}).locator('option[value="stmg-def45"]')).toHaveText('Management · 1STMG04')
  server.failLeave = true
  await page.getByRole('button', { name: 'Quitter cette classe', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de mettre à jour')
  expect(members.size).toBe(2)
  server.failLeave = false
  const removed = (await etat(page)).classCode
  await page.getByRole('button', { name: 'Quitter cette classe', exact: true }).click()
  await expect.poll(() => members.size).toBe(1)
  await expect.poll(async () => (await etat(page)).classCode).not.toBe(removed)
  await page.reload(); await attendreAccueil(page)
  await expect(page.getByLabel('Classe active',{exact:true}).locator('option[value="'+removed+'"]')).toHaveCount(0)
  expect(errors).toEqual([])
})


test('professeur : nom libre, erreur de renommage conservée, sauvegarde et rechargement',async({page})=>{
 const {errors,classes,server}=await ouvrir(page,'prof')
 await page.getByLabel('Nom de la classe',{exact:true}).fill('Droit Mme Martin · 1STMG04')
 await page.getByRole('button',{name:/Générer.*code/}).click()
 await expect(page.getByRole('heading',{level:1})).toContainText('Droit Mme Martin · 1STMG04')
 expect(classes[0].label).toBe('Droit Mme Martin · 1STMG04')
 await page.getByRole('button',{name:'Modifier le nom',exact:true}).click()
 await page.getByLabel('Nom de la classe',{exact:true}).fill('Droit Mme Dupont · 1STMG04')
 server.failRename=true
 await page.getByRole('button',{name:'Enregistrer',exact:true}).click()
 await expect(page.getByRole('alert')).toContainText('Impossible d’enregistrer')
 await expect(page.getByLabel('Nom de la classe',{exact:true})).toHaveValue('Droit Mme Dupont · 1STMG04')
 expect(classes[0].label).toBe('Droit Mme Martin · 1STMG04')
 server.failRename=false
 await page.getByRole('button',{name:'Enregistrer',exact:true}).click()
 await expect(page.getByRole('heading',{level:1})).toContainText('Droit Mme Dupont · 1STMG04')
 await page.reload();await attendreAccueil(page)
 await expect(page.getByRole('heading',{level:1})).toContainText('Droit Mme Dupont · 1STMG04')
 classes[0].label='Droit Mme Dupont · 1STMG04 bis'
 await page.getByRole('button',{name:'Actualiser',exact:true}).click()
 await expect(page.getByRole('heading',{level:1})).toContainText('1STMG04 bis')
 await expect(page.getByLabel('Classe active',{exact:true}).locator('option')).toHaveText(['Droit Mme Dupont · 1STMG04 bis'])
 expect(errors).toEqual([])
})
for(const [role,theme] of [['prof','light'],['eleve','dark']])test('espace classe lisible : '+role+' '+theme,async({page},info)=>{
 const {errors,server}=await ouvrir(page,role)
 await page.setViewportSize({width:320,height:850})
 if(role==='prof'){
  await page.getByLabel('Nom de la classe',{exact:true}).fill('Droit Mme Martin · 1STMG04')
  await page.getByRole('button',{name:/Générer.*code/}).click()
 }
 await page.evaluate(theme=>{const s=JSON.parse(localStorage.getItem('stmg_progress_v2'));s.theme=theme;localStorage.setItem('stmg_progress_v2',JSON.stringify(s))},theme)
 await page.reload();await attendreAccueil(page)
 const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click()
 await expect(page.locator('.class-stat-grid')).toBeVisible()
 await expect(page.locator('.class-navigation>div>button')).toHaveCount(4)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
 await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getComputedTiming().iterations===Infinity))
 expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 await page.screenshot({path:info.outputPath(role+'-classe.png'),fullPage:true})
 if(role==='prof'){
  await page.setViewportSize({width:1280,height:900})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
  expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
  await page.screenshot({path:info.outputPath('prof-desktop.png'),fullPage:true})
  await page.getByRole('button',{name:'Créer un quiz',exact:true}).click()
  await expect(page.getByRole('button',{name:/Publier le QCM/})).toBeVisible()
  expect((await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
 }else{
  await expect(page.getByRole('button',{name:'Modifier le nom',exact:true})).toHaveCount(0)
  server.failOverview=true;await page.reload();await attendreAccueil(page)
  await expect(page.locator('.class-overview')).toContainText('Certaines informations')
 }
 expect(errors).toEqual([])
})

for(const theme of ['light','dark'])test('professeur : suivi, groupes et réglages accessibles '+theme,async({page})=>{
 const {errors,server}=await ouvrir(page,'prof',{theme})
 await page.setViewportSize({width:390,height:850})
 await page.getByLabel('Nom de la classe',{exact:true}).fill('Droit Mme Martin · 1STMG04')
 await page.getByRole('button',{name:/Générer.*code/}).click()
 const subjects=Object.fromEntries(['gestion-finance','management','droit','economie','maths','philosophie','histoire-geo','langues'].map(key=>[key,100]))
 server.memberRows=[{device_id:'student-a',name:'Inès Test',role:'eleve',xp:10,streak:1,courses_week:0,active_day:AUJOURDHUI,subjects:{}},{device_id:'student-b',name:'Tom Test',role:'eleve',xp:200,streak:5,courses_week:3,active_day:AUJOURDHUI,subjects}]
 const cookie=page.getByRole('button',{name:'OK',exact:true});if(await cookie.isVisible())await cookie.click()
 await page.locator('.class-navigation').getByRole('button',{name:/Suivi et gestion/}).click()
 for(const name of ['Tableau','Groupes','Réglages']){
  await page.locator('.class-prof-navigation').getByRole('button',{name,exact:true}).click()
  await expect(page.locator('.class-prof-navigation')).toBeVisible()
  await page.waitForTimeout(300)
  await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'||a.effect?.getComputedTiming().iterations===Infinity))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
  const violations=(await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations
  expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([])
 }
 expect(errors).toEqual([])
})
for(const [role,lang,label] of [['prof','de','Übersicht'],['eleve','ar','نظرة عامة']])test('classe traduite hors ligne : '+lang,async({page})=>{
 const {errors}=await ouvrir(page,role,{lang})
 if(role==='prof'){
  await page.locator('#class-new-name').fill('Droit Mme Martin · 1STMG04')
  await page.locator('.class-name-form button[type=submit]').click()
 }
 await expect(page.locator('.class-navigation>div>button').first()).toContainText(label)
 await expect(page.locator('.class-hero h1')).toContainText('Droit Mme Martin · 1STMG04')
 if(lang==='ar')await expect(page.locator('html')).toHaveAttribute('dir','rtl')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
 expect(errors).toEqual([])
})

test('professeur : groupe et annonce conservent la saisie après erreur, puis sont publiés',async({page})=>{
 const {errors,server}=await ouvrir(page,'prof')
 await page.getByRole('button',{name:/Générer.*code/}).click()
 await page.locator('.class-navigation').getByRole('button',{name:/Suivi et gestion/}).click()
 await page.locator('.class-prof-navigation').getByRole('button',{name:'Groupes',exact:true}).click()
 await page.getByLabel(/^Nom du groupe/).fill('Équipe contrat')
 server.failGroup=true
 await page.getByRole('button',{name:/Créer un groupe/}).click()
 await expect(page.getByRole('alert')).toBeVisible()
 await expect(page.getByLabel(/^Nom du groupe/)).toHaveValue('Équipe contrat')
 expect(server.groups).toHaveLength(0)
 server.failGroup=false
 await page.getByRole('button',{name:/Créer un groupe/}).click()
 await expect(page.locator('.class-group-title')).toContainText('Équipe contrat')
 await page.locator('.class-prof-navigation').getByRole('button',{name:'Réglages',exact:true}).click()
 await page.getByLabel('Annonce à la classe',{exact:true}).fill('Contrôle de droit vendredi : revoir le chapitre sur le contrat.')
 server.failMeta=true
 await page.getByRole('button',{name:'Publier l’annonce',exact:true}).click()
 await expect(page.getByRole('alert')).toBeVisible()
 await expect(page.getByLabel('Annonce à la classe',{exact:true})).toHaveValue(/Contrôle de droit/)
 expect(server.meta).toBeNull()
 server.failMeta=false
 await page.getByRole('button',{name:'Publier l’annonce',exact:true}).click()
 await expect.poll(()=>server.meta?.announcement).toContain('Contrôle de droit')
 await expect(page.locator('.class-studio')).toContainText('Contrôle de droit vendredi')
 expect(errors).toEqual([])
})
test('professeur : créer un quiz depuis la vue d’ensemble et conserver le brouillon après erreur',async({page})=>{
 const {errors,server}=await ouvrir(page,'prof')
 await page.getByRole('button',{name:/Générer.*code/}).click()
 await page.getByRole('button',{name:'Créer un quiz',exact:true}).click()
 await page.getByLabel('Titre du QCM',{exact:true}).fill('Droit — le contrat')
 await page.getByLabel('Question 1',{exact:true}).fill('À quoi sert un contrat ?')
 for(const [i,value] of ['Créer des obligations','Supprimer les lois','Interdire le travail','Remplacer la justice'].entries()){
  if(i>=2)await page.getByRole('button',{name:/Ajouter une réponse/}).click()
  await page.getByLabel('Réponse '+String.fromCharCode(65+i)+' · Question 1',{exact:true}).fill(value)
 }
 server.failQuiz=true
 await page.getByRole('button',{name:'Publier le QCM',exact:true}).click()
 await expect(page.getByRole('alert')).toBeVisible()
 await expect(page.getByLabel('Titre du QCM',{exact:true})).toHaveValue('Droit — le contrat')
 expect(server.quizzes).toHaveLength(0)
 server.failQuiz=false
 await page.getByRole('button',{name:'Publier le QCM',exact:true}).click()
 await expect.poll(()=>server.quizzes.length).toBe(1)
 await expect(page.locator('main')).toContainText('Droit — le contrat')
 expect(server.quizzes[0].questions).toHaveLength(1)
 expect(errors).toEqual([])
})
