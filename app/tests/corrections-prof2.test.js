import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

// Corrections issues du second audit « professeur exigeant » (24/11/2026).
const lire = (f) => readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8')
const termes = (f) => {
  const j = JSON.parse(lire(f))
  const plat = Object.values(j).every((v) => typeof v === 'string') ? j : Object.assign({}, ...Object.values(j))
  const parAlias = {}
  for (const [cle, def] of Object.entries(plat)) for (const a of cle.split('|')) parAlias[a.trim().toLowerCase()] = def
  return parAlias
}

describe('corrections du second audit des professeurs', () => {
  it('l’indépendance financière est le ratio capitaux propres / total du bilan, pas le taux d’endettement', () => {
    for (const f of ['gestion-finance/matiere.json', 'gestion-finance/cours-complets.json']) {
      expect(lire(f)).not.toMatch(/ndépendance financière\*{0,2} = dettes financières/)
    }
    expect(lire('gestion-finance/matiere.json')).toContain('capitaux propres / total du bilan')
  })
  it('l’apport en compte courant d’associé est un financement externe', () => {
    const m = lire('gestion-finance/matiere.json')
    expect(m).not.toMatch(/\*\*internes\*\* : autofinancement \(CAF moins dividendes\), apports/)
    expect(m).toContain('Seul l’autofinancement')
  })
  it('la rotation des stocks et la durée de stockage ne sont plus confondues', () => {
    expect(lire('commun/formules.json')).toContain('Durée de stockage (rotation des stocks en jours)')
    expect(lire('commun/atelier-formules.json')).not.toContain('"name": "Rotation des stocks"')
    expect(lire('gestion-finance/approfondi-1.json')).not.toContain('stock moyen divisé par les achats')
  })
  it('les alias du glossaire ouvrent la bonne définition', () => {
    const eco = termes('economie/termes.json')
    expect(eco['15 ans ou plus']).toBeUndefined()
    expect(eco['creuse le déficit']).toMatch(/flux/)
    expect(eco['plus cher']).toBeUndefined()
    expect(eco['stabilité des prix']).toMatch(/moyen terme/)
    expect(termes('rh-communication/termes.json')['équitable']).toMatch(/juste/)
    expect(termes('rh-communication/termes.json')['iniquité']).toMatch(/injustice/)
    expect(termes('maths/termes.json')['indice']).toMatch(/base 100/)
    expect(termes('p1-sgn/termes.json')['socialisation primaire']).toMatch(/enfance/)
    expect(termes('p1-sgn/termes.json')['empreinte carbone']).not.toMatch(/lancement/)
    expect(termes('management/termes.json')['intégration / externalisation']).toBeUndefined()
    expect(termes('gestion-finance/termes.json')['dilue le pouvoir']).toMatch(/part de chaque associé/)
    expect(termes('gestion-finance/termes.json')['taux d’intérêt inférieur']).toMatch(/endettement augmente/)
  })
  it('les définitions juridiques et marketing sont exactes', () => {
    expect(termes('droit/termes.json')['tribunal judiciaire']).toMatch(/délits/)
    expect(termes('droit/termes.json')['tribunal judiciaire']).not.toMatch(/infractions les plus graves/)
    expect(termes('droit/termes.json')['plus favorable']).toMatch(/sauf exceptions/)
    expect(termes('mercatique/termes.json')['part de marché relative']).not.toMatch(/supérieure à 1 pour le leader/)
    expect(lire('droit/cours-complets.json')).toContain('L212-1 du Code de la consommation')
  })
  it('le chômage n’est plus défini comme une personne, ni les maths ambiguës', () => {
    expect(lire('economie/definitions.json')).toContain('"Chômeur (BIT)"')
    expect(lire('maths/matiere.json')).not.toContain('Une baisse d’environ 4 %')
    expect(lire('p1-maths/matiere.json')).toContain('t en écriture décimale')
    expect(lire('maths/definitions.json')).toContain('P_A(B) = P(A∩B) / P(A)')
  })
  it('corrections de l’élève de Première : alias, formules lisibles, cours complet, QCM sans doublon', () => {
    const m = termes('p1-maths/termes.json')
    expect(m['symétrique']).toBeUndefined()
    expect(m['multiplie']).toBeUndefined()
    const eco = termes('p1-economie/termes.json')
    expect(eco['subventions sur les produits']).not.toBe(eco['impôts sur les produits'])
    expect(eco['subventions sur les produits']).toMatch(/[Aa]ides/)
    expect(eco['somme des valeurs ajoutées']).not.toMatch(/^Le PIB est la somme/)
    for (const f of ['maths/matiere.json', 'maths/cours-complets.json', 'p1-maths/matiere.json']) {
      const t = lire(f)
      expect(t).not.toMatch(/u_\{n|u_\(n|q\^n/)
    }
    expect(lire('p1-maths/matiere.json')).toContain('Taux moyen et indice base 100')
    expect(lire('p1-droit/matiere.json')).toContain('Trois principes structurants')
    expect(lire('p1-droit/matiere.json')).not.toContain('Deux principes structurants')
    expect(lire('p1-economie/matiere.json')).toContain('couvre au moins la moitié des coûts de production')
  })
  it('aucun bloc « formule » ne contient de gras (il s’affiche en texte brut, astérisques visibles)', () => {
    const racine = new URL('../content/', import.meta.url)
    const trouve = []
    const parcourir = (o, f) => {
      if (Array.isArray(o)) o.forEach((v) => parcourir(v, f))
      else if (o && typeof o === 'object') {
        if (o.t === 'formula' && String(o.c).includes('**')) trouve.push(`${f} : ${o.c}`)
        Object.values(o).forEach((v) => parcourir(v, f))
      }
    }
    for (const d of readdirSync(racine)) {
      let fichiers = []
      try { fichiers = readdirSync(new URL(`${d}/`, racine)).filter((x) => x.endsWith('.json')) } catch { continue }
      for (const x of fichiers) parcourir(JSON.parse(lire(`${d}/${x}`)), `${d}/${x}`)
    }
    expect(trouve).toEqual([])
  })
})
