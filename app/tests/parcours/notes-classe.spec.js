import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

// « Mes notes de classe » : l'élève n'écrit que sa note ; la matière, puis le
// chapitre, se choisissent dans des menus. La page dit ce qu'il faut améliorer.
test('saisir ses notes et voir ce qu’il faut améliorer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const erreurs = await preparer(page)
  await page.goto('./#/moi')
  await attendreAccueil(page)
  await page.getByRole('link', { name: /Mes notes de classe/ }).click()
  await expect(page.getByRole('heading', { name: /Mes notes de classe/ })).toBeVisible()
  await expect(page.getByText('Ajoute ta première note')).toBeVisible()

  const note = page.getByLabel('Note sur 20', { exact: true })
  const matiere = page.getByLabel('Matière', { exact: true })
  const chapitre = page.getByLabel('Chapitre', { exact: true })
  const ajouter = page.getByRole('button', { name: 'Ajouter', exact: true })

  // Le chapitre ne se choisit qu'après la matière, parmi ses seuls chapitres.
  await expect(chapitre).toBeDisabled()
  await note.fill('21')
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Écris une note sur 20')
  await note.fill('15,50')
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Choisis la matière')
  await matiere.selectOption('maths')
  await expect(chapitre).toBeEnabled()
  const chapitres = await chapitre.locator('option').allTextContents()
  expect(chapitres).toContain('Chapitre 3 — Fonctions et dérivation')
  expect(chapitres.some((c) => c.includes('règles comptables'))).toBe(false)
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Choisis le chapitre')
  await chapitre.selectOption('math-c3')
  await page.getByLabel('Question(s) manquée(s) · facultatif').fill('Q3 : calculer une dérivée')
  await ajouter.click()
  await expect(page.getByRole('status').filter({ hasText: 'Note ajoutée' })).toBeVisible()
  await expect(note).toHaveValue('')

  // Une note sous la moyenne dans un autre chapitre de maths.
  await note.fill('8,5')
  await matiere.selectOption('maths')
  await chapitre.selectOption('math-c2')
  await ajouter.click()

  const ameliorer = page.locator('section', { has: page.getByRole('heading', { name: /Ce qu’il faut améliorer/ }) })
  await expect(ameliorer.getByRole('listitem')).toHaveCount(1)
  await expect(ameliorer).toContainText('Chapitre 2 — Suites numériques')
  await expect(ameliorer).toContainText('Sous la moyenne')
  await expect(ameliorer).toContainText('8,50/20')
  await expect(page.getByText('Moyenne 12/20')).toBeVisible()

  const notes = (await etat(page)).notesClasse
  expect(notes[1].questionsManquees).toBe('Q3 : calculer une dérivée')
  expect(notes.map((n) => [n.note, n.matiere, n.chapitre])).toEqual([[8.5, 'maths', 'math-c2'], [15.5, 'maths', 'math-c3']])

  // Les notes restent après un rechargement ; une note se supprime.
  await page.reload()
  await attendreAccueil(page)
  await expect(page.getByText('Moyenne 12/20')).toBeVisible()
  await expect(page.getByText('Questions manquées : Q3 : calculer une dérivée')).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Supprimer la note' }).first().click()
  await expect(page.getByRole('button', { name: 'Supprimer la note' })).toHaveCount(1)
  await expect(page.getByText('Moyenne 15,50/20')).toBeVisible()
  await expect(ameliorer).toContainText('Rien à retravailler en priorité')
  expect((await etat(page)).notesClasse.map((n) => n.chapitre)).toEqual(['math-c3'])
  expect(erreurs).toEqual([])
})

test('bilan personnalisé : exercices nouveaux, correction et sauvegarde avec la note', async ({ page }) => {
 const erreurs=await preparer(page)
 await page.addInitScript(()=>localStorage.setItem('stmg_session',JSON.stringify({token:'test',refresh:'r',expires_at:9999999999,user:{id:'00000000-0000-4000-8000-000000000001'}})))
 const requests=[]
 await page.route('https://*.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url())
  const reply=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)})
  if(url.pathname.endsWith('/examen-blanc')){
   const b=req.postDataJSON();requests.push(b)
   return reply({study:{status:'ready',summary:'Bilan fondé sur tes difficultés déclarées.',weaknesses:[{chapterId:b.courses[0].id,skill:'Dériver',evidence:'Question 3 non réussie',advice:'Revoir la dérivée d’une somme.'}],exercises:Array.from({length:3},(_,i)=>({chapterId:b.courses[0].id,skill:'Dérivation',question:`Exercice inédit ${i+1} : dérive f(x) = x² + ${i}x.`,correction:`f’(x) = 2x + ${i}.`}))}})
  }
  if(url.pathname.endsWith('/profiles'))return reply([{id:'00000000-0000-4000-8000-000000000001',role:'eleve',name:'Léa Test',level:'terminale-stmg',specialty:'gestion-finance',progress:{}}])
  return reply([])
 })
 await page.goto('./#/mes-notes');await attendreAccueil(page)
 if(!await page.getByLabel('Note sur 20',{exact:true}).isVisible()){
  await page.goto('./#/moi');await page.getByRole('link',{name:/Mes notes de classe/}).click()
 }
 await page.getByLabel('Note sur 20',{exact:true}).fill('12')
 await page.getByLabel('Matière',{exact:true}).selectOption('maths')
 await page.getByLabel('Chapitre',{exact:true}).selectOption('math-c3')
 await page.getByLabel('Question(s) manquée(s) · facultatif').fill('Question 3 : dériver une somme')
 await page.getByRole('button',{name:'Préparer mon bilan et mes exercices'}).click()
 await expect(page.getByText('Bilan fondé sur tes difficultés déclarées.')).toBeVisible({timeout:45000})
 await expect(page.getByText('f’(x) = 2x + 0.')).toBeHidden()
 await page.getByText('Voir la correction',{exact:true}).first().click()
 await expect(page.getByText('f’(x) = 2x + 0.')).toBeVisible()
 await page.getByRole('button',{name:'Ajouter',exact:true}).click()
 expect(requests[0].action).toBe('study')
 expect(requests[0].courses.every(c=>c.id.startsWith('math-c3'))).toBe(true)
 expect((await etat(page)).notesClasse[0].revision.exercises).toHaveLength(3)
 await page.reload();await attendreAccueil(page)
 await page.getByText('Mon bilan et mes exercices',{exact:true}).click()
 await expect(page.getByText('Bilan fondé sur tes difficultés déclarées.')).toBeVisible()
 expect(erreurs).toEqual([])
})
