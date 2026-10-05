// Liens internes : chaque lien de l'app (Link to, navigate, href « #/ ») mène à
// une route déclarée dans src/App.jsx, et la page 404 de GitHub Pages connaît
// les mêmes routes. Les liens vers d'autres sites sont vérifiés en ligne par
// scripts/verifier-liens.mjs (workflow « Vérifier les liens »).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SUBJECTS, ALL_CHAPTERS } from '../src/data/index.js'
import { ECRANS, nomEcran } from '../src/mesure.js'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(APP, 'src')

const fichiers = (dossier) => readdirSync(dossier).flatMap((f) => {
  const p = join(dossier, f)
  return statSync(p).isDirectory() ? fichiers(p) : /\.(jsx?|mjs)$/.test(f) ? [p] : []
})

const app = readFileSync(join(SRC, 'App.jsx'), 'utf8')
const ROUTES = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*')
const MOTIFS = ROUTES.map((r) => new RegExp('^' + r.replace(/:[A-Za-z]+/g, '[^/]+') + '$'))

// Cibles écrites en dur : to="/…", to: '/…', navigate('/…'), href="./#/…".
// Les morceaux calculés (${…}) deviennent un segment quelconque.
const CIBLE = /(?:\bto=\{?|\bto:\s*|navigate\(|href=\{?)\s*(["'`])((?:\.\/)?#?\/[^"'`]*)\1/g
function cibles() {
  const liste = []
  for (const f of fichiers(SRC)) {
    const texte = readFileSync(f, 'utf8')
    for (const m of texte.matchAll(CIBLE)) {
      const brut = m[2]
      const chemin = brut.replace(/^\.?\/?#/, '').replace(/\$\{[^}]*\}/g, 'x').split(/[?#]/)[0] || '/'
      liste.push({ fichier: relative(APP, f), brut, chemin })
    }
  }
  return liste
}

describe('liens internes', () => {
  it('chaque lien de l’app mène à une route existante', () => {
    const tous = cibles()
    expect(tous.length).toBeGreaterThan(50)
    // Le fil d'Ariane fabrique `/${parts[0]}` pour les pages de PAGES_SIMPLES :
    // ce sont ses clés qui sont vérifiées.
    const aVerifier = tous.filter((c) => !(c.fichier.endsWith('Layout.jsx') && c.brut === '/${parts[0]}'))
    const casses = aVerifier.filter((c) => !MOTIFS.some((m) => m.test(c.chemin))).map((c) => `${c.fichier} : ${c.brut}`)
    expect(casses).toEqual([])
  })

  it('les pages simples du fil d’Ariane sont des routes', () => {
    const layout = readFileSync(join(SRC, 'components/Layout.jsx'), 'utf8')
    const bloc = layout.match(/const PAGES_SIMPLES = \{([^}]*)\}/)[1]
    const cles = [...bloc.matchAll(/'?([a-z-]+)'?\s*:/g)].map((m) => m[1])
    expect(cles.length).toBeGreaterThan(5)
    expect(cles.filter((k) => !ROUTES.includes(`/${k}`))).toEqual([])
  })

  it('la page 404 de GitHub Pages redirige vers les routes de l’app', () => {
    const page = readFileSync(join(APP, 'pwa/404.html'), 'utf8')
    const liste = page.match(/var ROUTES = \[([^\]]*)\]/)[1]
    const dans404 = [...liste.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()
    const premiers = [...new Set(ROUTES.map((r) => r.split('/')[1]).filter(Boolean))].sort()
    expect(dans404).toEqual(premiers)
  })

  it('chaque matière et chaque thème de l’index a une adresse valide', () => {
    for (const s of SUBJECTS) {
      expect(MOTIFS.some((m) => m.test(`/subject/${s.id}`))).toBe(true)
      for (const t of s.chapters || []) {
        expect(ALL_CHAPTERS[t.id], `${s.id} → ${t.id}`).toBeTruthy()
        expect(encodeURIComponent(t.id), t.id).toBe(t.id)
      }
    }
  })

  it('mesure d’audience : chaque route a un nom d’écran accepté par la base', () => {
    const exemple = (r) => r.replace(/:[A-Za-z]+/g, '1')
    for (const r of ROUTES) {
      const nom = nomEcran(exemple(r))
      if (r === '/subject/:sid/chapter/:cid') { expect(nom).toBe(null); continue }
      expect(ECRANS, r).toContain(nom)
      expect(nom, r).not.toBe('introuvable')
    }
    expect(nomEcran('/existe-pas')).toBe('introuvable')
    expect(nomEcran('/subject/droit/theme/droit-t5/chapter/3')).toBe('chapitre')
    const sql = readFileSync(join(APP, '../supabase/a-valider/revizstmg_statistiques.sql'), 'utf8')
    const liste = sql.match(/p_page !~ '\^\(([^)]*)\)\$'/)[1].split('|')
    expect(liste.sort()).toEqual([...ECRANS].sort())
  })
})
