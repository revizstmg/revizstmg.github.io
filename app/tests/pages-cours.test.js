import { describe, it, expect, beforeAll } from 'vitest'
import { chargerContenu, construirePages, sitemap, slug, riche, SITE } from '../scripts/pages-cours/generer.mjs'
import { ALL_CHAPTERS, themeChapters } from '../src/data/index.js'

// Pages de cours statiques (/cours/) : ce que Google indexe. Chaque page a un
// titre, une description, une adresse canonique, un seul h1, et ses liens mènent
// à des pages qui existent ou à un chapitre réel de l'app.
let pages
beforeAll(async () => { await chargerContenu(); pages = construirePages() })

describe('pages de cours statiques', () => {
  it('une page par matière, par thème et par chapitre, plus l’index des cours', () => {
    const themes = Object.values(ALL_CHAPTERS)
    const chapitres = themes.reduce((n, t) => n + themeChapters(t).length, 0)
    expect(pages.length).toBe(1 + 19 + themes.length + chapitres)
    const chemins = pages.map((p) => p.chemin)
    expect(new Set(chemins).size).toBe(chemins.length)
    for (const c of chemins) expect(c).toMatch(/^\/cours\/([a-z0-9-]+\/)*$/)
  })

  it('chaque page est complète et propre pour un moteur de recherche', () => {
    for (const { chemin, html } of pages) {
      const titre = html.match(/<title>([^<]*)<\/title>/)[1]
      const description = html.match(/<meta name="description" content="([^"]*)">/)[1]
      expect(titre, chemin).toMatch(/STMG/)
      expect(titre, chemin).not.toMatch(/\p{Extended_Pictographic}/u)
      expect(description.length, chemin).toBeGreaterThan(50)
      expect(description.length, chemin).toBeLessThanOrEqual(160)
      expect(html).toContain(`<link rel="canonical" href="${SITE}${chemin}">`)
      expect(html.match(/<h1>/g), chemin).toHaveLength(1)
      expect(html, chemin).not.toMatch(/undefined|\[object |NaN|\*\*/)
      for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) expect(() => JSON.parse(m[1])).not.toThrow()
    }
  })

  it('les liens mènent à des pages de cours existantes ou à un vrai chapitre de l’app', () => {
    const existe = new Set(pages.map((p) => p.chemin))
    for (const { chemin, html } of pages) {
      for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
        if (href.startsWith('/cours/') && !href.endsWith('.css')) expect(existe.has(href), `${chemin} → ${href}`).toBe(true)
        const app = href.match(/^\/#\/subject\/([^/]+)\/theme\/([^/]+)\/chapter\/(\d+)$/)
        if (app) {
          expect(ALL_CHAPTERS[app[2]]?.subjectId, href).toBe(app[1])
          expect(Number(app[3])).toBeLessThan(themeChapters(ALL_CHAPTERS[app[2]]).length)
        }
      }
    }
  })

  it('le plan du site déclare l’accueil et toutes les pages de cours', () => {
    const xml = sitemap(pages)
    expect(xml).toContain(`<loc>${SITE}/</loc>`)
    for (const p of pages) expect(xml).toContain(`<loc>${SITE}${p.chemin}</loc>`)
  })

  it('adresses lisibles et texte échappé', () => {
    expect(slug('Thème 5 — Quel est le rôle du contrat ?')).toBe('quel-est-le-role-du-contrat')
    expect(slug('Œuvres & cœur : l’été')).toBe('oeuvres-coeur-l-ete')
    expect(slug('a'.repeat(30) + ' ' + 'b'.repeat(60)).length).toBeLessThanOrEqual(70)
    expect(riche('<b>x</b> **gras** et *penché*')).toBe('&lt;b&gt;x&lt;/b&gt; <strong>gras</strong> et <em>penché</em>')
  })
})
