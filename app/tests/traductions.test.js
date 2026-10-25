import { afterEach, beforeEach, test, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { transformSync, transformFileSync } from '@babel/core'
import { parse } from '@babel/parser'
import publicTranslations from '../scripts/plugin-traductions.mjs'
import { SHOP_ITEMS, SHOP_REWARDS } from '../src/data/shop.js'
const root = new URL('../src/', import.meta.url)
const books = Object.fromEntries(['en', 'es', 'it', 'ar', 'de'].map((l) => [l, JSON.parse(readFileSync(new URL(`localisation/public.${l}.json`, root), 'utf8'))]))
const variables = (s) => (s.match(/\{\w+\}/g) || []).sort()
const properties = (node) => new Map(node.properties.map((p) => [p.key.name || p.key.value, p.value.value]))
const readAst = (path) => parse(readFileSync(new URL(path, root), 'utf8'), { sourceType: 'module' })

test('toutes les clés d’interface existent dans chacune des cinq langues', () => {
  const fr = readAst('i18n/fr.js').program.body.find((n) => n.type === 'ExportDefaultDeclaration').declaration
  for (const lang of Object.keys(books)) {
    const locale = readAst(`i18n/${lang}.js`).program.body.find((n) => n.type === 'ExportDefaultDeclaration').declaration
    const dict = properties(locale)
    for (const [key, value] of properties(fr)) {
      expect(dict.has(key), `${lang}:${key}`).toBe(true)
      expect(variables(dict.get(key)), `${lang}:${key}`).toEqual(variables(value))
    }
  }
})

test('noms, descriptions, cadeaux et variables de la boutique sont traduits hors ligne', () => {
  const output = transformFileSync(new URL('pages/Shop.jsx', root).pathname, { configFile: false, babelrc: false, plugins: [publicTranslations], parserOpts: { plugins: ['jsx'] }, ast: true })
  const texts = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXAttribute' && node.name.name === 'text' && node.value?.type === 'JSXExpressionContainer' && node.value.expression.type === 'StringLiteral') texts.push(node.value.expression.value.replace(/\s+/g, ' ').trim())
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === 'object') walk(value)
  }
  walk(output.ast)
  for (const book of Object.values(books)) {
    for (const text of texts) expect(book[text], text).toBeTruthy()
    for (const item of SHOP_ITEMS) {
      expect(book[item.name], item.name).toBeTruthy()
      if (item.desc) expect(book[item.desc], item.desc).toBeTruthy()
    }
    for (const reward of SHOP_REWARDS) { expect(book[reward.name]).toBeTruthy(); expect(book[reward.gift]).toBeTruthy() }
    for (const [text, translation] of Object.entries(book)) expect(variables(translation), text).toEqual(variables(text))
  }
})

test('la compilation isole les variables privées et conserve champs, refs, code et exclusions', () => {
  const source = 'const page = <div>Bonjour {profile.name}<strong>Équiper une récompense</strong><input ref={ref} placeholder="Ton prénom" value={privateText} /><textarea placeholder="Écris ici" value={privateText}/><code>SELECT secret FROM table</code><span translate="no">Nom protégé</span><p>{`Bienvenue ${profile.name}`}</p></div>'
  const { code } = transformSync(source, { filename: new URL('pages/Test.jsx', root).pathname, configFile: false, babelrc: false, parserOpts: { plugins: ['jsx'] }, plugins: [publicTranslations] })
  expect(code).toContain('text={"Bonjour "}')
  expect(code).toContain('text={"Bienvenue {v0}"}')
  const reparsed = parse(code, { sourceType: 'module', plugins: ['jsx'] })
  const found = []
  const visit = (n) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'JSXAttribute' && n.name.name === 'text') found.push(n.value.expression.value)
    for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(visit); else if (v && typeof v === 'object') visit(v)
  }
  visit(reparsed)
  expect(found).toContain('Équiper une récompense')
  expect(code).toContain('values={[profile.name]}')
  expect(code).toContain('value={privateText}')
  expect(code).toContain('ref={ref}')
  expect(code).toContain('<code>SELECT secret FROM table</code>')
  expect(code).toContain('translate="no">Nom protégé</span>')
  expect(code).toContain('as="textarea"')
  expect(code).not.toContain('text={profile.name}')
})

let api
beforeEach(async () => {
  vi.resetModules()
  const cache = new Map()
  vi.stubGlobal('localStorage', { getItem: (k) => cache.get(k) ?? null, setItem: (k, v) => cache.set(k, v) })
  api = await import('../src/translate.js')
})
afterEach(() => vi.unstubAllGlobals())
const response = (text, status = 200) => new Response(JSON.stringify({ responseStatus: status, responseData: { translatedText: text } }))

for (const lang of ['it', 'ar', 'de']) test(`le dictionnaire accepte ${lang} comme langue source`, async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response('test traduit')))
  expect((await api.translate('una frase' + lang, lang, 'fr')).text).toBe('test traduit')
})
test('la boutique ne dépend pas du réseau, les requêtes identiques sont regroupées et mises en cache', async () => {
  const fetch = vi.fn().mockResolvedValue(response('Translated test'))
  vi.stubGlobal('fetch', fetch)
  expect((await api.translate('Tes efforts ont du style.', 'fr', 'en')).text).toBe('Your effort. Your style.')
  expect((await api.translate('Dictionnaire', 'fr', 'en')).text).toBe('Dictionary')
  expect(fetch).not.toHaveBeenCalled()
  await Promise.all(Array.from({ length: 8 }, () => api.translate('Texte public de test sans équivalent', 'fr', 'en')))
  expect(fetch).toHaveBeenCalledTimes(1)
  await api.translate('Texte public de test sans équivalent', 'fr', 'en')
  expect(fetch).toHaveBeenCalledTimes(1)
})
test('les textes longs sont découpés en dessous de la limite UTF-8', async () => {
  const text = 'Économie et société. '.repeat(80)
  const chunks = api.translationChunks(text)
  expect(chunks.length).toBeGreaterThan(1)
  expect(chunks.every((s) => new TextEncoder().encode(s).length <= 450)).toBe(true)
  const fetch = vi.fn().mockImplementation(async (url) => response(new URL(url).searchParams.get('q')))
  vi.stubGlobal('fetch', fetch)
  expect((await api.translate(text, 'fr', 'en')).text).toBe(text.trim())
  expect(fetch).toHaveBeenCalledTimes(chunks.length)
})
test('les quotas et variables modifiées ne sont pas mémorisés comme une traduction', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response('DAILY FREE TRANSLATIONS LIMIT', 429)).mockResolvedValueOnce(response('Valeur perdue')).mockResolvedValueOnce(response('Hello {v0}'))
  vi.stubGlobal('fetch', fetch)
  await expect(api.translate('Salut {v0}', 'fr', 'en')).rejects.toThrow(/indisponible/)
  await expect(api.translate('Salut {v0}', 'fr', 'en')).rejects.toThrow(/variables/)
  expect((await api.translate('Salut {v0}', 'fr', 'en')).text).toBe('Hello {v0}')
  expect(fetch).toHaveBeenCalledTimes(3)
})

// Écrans récents (séance du jour, accueil professeur, sauvegarde, carnet,
// « Pourquoi ? », notes de classe…) : leurs textes sont traduits hors ligne
// dans les cinq langues, sans passer par le service de traduction.
test('les écrans récents sont traduits hors ligne dans les cinq langues', () => {
  const ecrans = ['pages/Excellence.jsx', 'pages/Home.jsx', 'pages/Languages.jsx', 'components/ChapterControl.jsx', 'components/CourseTutor.jsx', 'components/NoteRevision.jsx', 'components/OutilsAccueil.jsx', 'components/EtatSauvegarde.jsx', 'components/AccueilProf.jsx', 'components/CompteRequis.jsx',
    'components/LegalContents.jsx', 'components/OfflineStatus.jsx', 'components/LevelToolNotice.jsx', 'components/QuizOutboxStatus.jsx',
    'pages/Seance.jsx', 'pages/Cours.jsx', 'pages/BacBlanc.jsx', 'pages/FormulaWorkshop.jsx', 'pages/MesNotes.jsx', 'pages/Theme.jsx', 'pages/Profile.jsx', 'games/SujetMaths.jsx', 'games/GameHost.jsx', 'games/common.jsx', 'games/ThemeTest.jsx']
  const textes = new Set()
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXAttribute' && node.name.name === 'text' && node.value?.expression?.type === 'StringLiteral') textes.add(node.value.expression.value.replace(/\s+/g, ' ').trim())
    if (node.type === 'ObjectProperty' && (node.key.name || node.key.value) === 'text' && node.value.type === 'StringLiteral') textes.add(node.value.value.replace(/\s+/g, ' ').trim())
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === 'object') walk(value)
  }
  for (const f of ecrans) walk(transformFileSync(new URL(f, root).pathname, { configFile: false, babelrc: false, plugins: [publicTranslations], parserOpts: { plugins: ['jsx'] }, ast: true }).ast)
  // Titres des étapes de la séance, traduits par usePublicText.
  for (const t of ['Étape {k}/{n} · {titre}', 'Tes erreurs à revoir', 'Révision du jour', 'Point faible à consolider', 'Avancer dans le cours', 'Étape suivante →', 'Terminer la séance']) textes.add(t)
  expect(textes.size).toBeGreaterThan(80)
  // Comme src/localisation/catalogue.js : les libellés d'interface (i18n/<langue>.js)
  // traduisent aussi le même texte français.
  const fr = properties(readAst('i18n/fr.js').program.body.find((n) => n.type === 'ExportDefaultDeclaration').declaration)
  for (const [lang, book] of Object.entries(books)) {
    const coeur = properties(readAst(`i18n/${lang}.js`).program.body.find((n) => n.type === 'ExportDefaultDeclaration').declaration)
    const base = Object.fromEntries([...fr].filter(([k]) => coeur.get(k)).map(([k, v]) => [String(v).replace(/\s+/g, ' ').trim(), coeur.get(k)]))
    for (const texte of textes) expect(book[texte] || base[texte], `${lang} : « ${texte} »`).toBeTruthy()
  }
})

test('allemand : révision, examen et correction disposent de toutes leurs traductions', async () => {
 const {copyMessages} = await import('../src/i18n/copies.js')
 const {examMessages} = await import('../src/i18n/examens.js')
 const {revisionMessages} = await import('../src/i18n/revision.js')
 for(const messages of [copyMessages,examMessages,revisionMessages]) {
  expect(Object.keys(messages.de).sort()).toEqual(Object.keys(messages.fr).sort())
  for(const [key,value] of Object.entries(messages.fr)) {
   expect(messages.de[key],key).toBeTruthy()
   expect(variables(messages.de[key]),key).toEqual(variables(value))
  }
 }
 const fetch=vi.fn()
 vi.stubGlobal('fetch',fetch)
 expect((await api.translate('Tes efforts ont du style.','fr','de')).text).toBe('Dein Einsatz. Dein Stil.')
 expect((await api.translate('Ose prendre la parole.','fr','de')).text).toBe('Trau dich zu sprechen.')
 expect(fetch).not.toHaveBeenCalled()
})
