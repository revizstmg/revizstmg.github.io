// Fusion de la progression entre deux appareils du même élève (audit F04) :
// le téléphone et l'ordinateur modifient chacun leur copie, puis passent par
// la copie du compte.
import { describe, expect, it } from 'vitest'
import { mergeProgress, noter, chargeUtile, empreinte, aSauvegarder, apresEnvoi, avecVersionServeur, versionDe, CARNET_MAX } from '../src/progression.js'
import { purchaseItem } from '../src/data/shop.js'

const vide = (extra = {}) => ({
  xp: 0, coins: 0, freezes: 0, totalAnswers: 0, correctAnswers: 0, badges: [], chapters: {}, favorites: [],
  savedDecks: [], fiches: [], erreurs: [], notes: {}, srs: {}, history: {}, themeTime: {}, owned: [],
  shopRewards: {}, shopWalletUpdatedAt: 0, streak: { count: 0, last: null }, weekly: { week: null, done: [] },
  lastChapter: null, bacDate: null, ...extra,
})
// Une modification faite sur un appareil à l'instant `t` (millisecondes).
const sur = (appareil, t, etat, maj) => noter(etat, maj(etat), { appareil, maintenant: t })
// Le compte reçoit la copie d'un appareil ; un autre appareil la récupère.
const compteDe = (etat) => chargeUtile(etat)
const recuperer = (etat, compte) => mergeProgress(etat, compte, 1000)

// Point de départ commun : l'élève a déjà synchronisé ses deux appareils.
function deuxAppareils(depart) {
  const tel = sur('tel', 1, vide(), () => depart)
  const pc = recuperer(vide(), compteDe(tel))
  return { tel, pc }
}

describe('suppressions et modifications', () => {
  it('un favori retiré sur le téléphone ne réapparaît pas', () => {
    let { tel, pc } = deuxAppareils(vide({ favorites: ['gf-t1', 'droit-t2'] }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, favorites: ['gf-t1'] }))
    expect(recuperer(pc, compteDe(tel)).favorites).toEqual(['gf-t1'])
    expect(recuperer(tel, compteDe(pc)).favorites).toEqual(['gf-t1'])
  })
  it('un favori retiré puis remis plus tard sur l’autre appareil revient', () => {
    let { tel, pc } = deuxAppareils(vide({ favorites: ['gf-t1'] }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, favorites: [] }))
    pc = recuperer(pc, compteDe(tel))
    expect(pc.favorites).toEqual([])
    pc = sur('pc', 20, pc, (s) => ({ ...s, favorites: ['gf-t1', 'eco-t3'] }))
    expect(recuperer(tel, compteDe(pc)).favorites.sort()).toEqual(['eco-t3', 'gf-t1'])
    expect(recuperer(pc, compteDe(tel)).favorites.sort()).toEqual(['eco-t3', 'gf-t1'])
  })
  it('un paquet de flashcards supprimé ne réapparaît pas', () => {
    const paquet = (id) => ({ id, title: id, cards: [{ front: 'A', back: 'B' }], savedAt: 5 })
    let { tel, pc } = deuxAppareils(vide({ savedDecks: [paquet('p1'), paquet('p2')] }))
    pc = sur('pc', 10, pc, (s) => ({ ...s, savedDecks: s.savedDecks.filter((d) => d.id !== 'p2') }))
    expect(recuperer(tel, compteDe(pc)).savedDecks.map((d) => d.id)).toEqual(['p1'])
  })
  it('une fiche et une question du carnet supprimées ne réapparaissent pas', () => {
    const erreur = (id) => ({ id, themeId: 'gf-t1', type: 'qcm', q: { q: id }, le: '2026-10-01' })
    let { tel, pc } = deuxAppareils(vide({ fiches: [{ id: 'f1', createdAt: 3 }], erreurs: [erreur('q1'), erreur('q2')] }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, fiches: [], erreurs: [erreur('q2')] }))
    const fusion = recuperer(pc, compteDe(tel))
    expect(fusion.fiches).toEqual([])
    expect(fusion.erreurs.map((e) => e.id)).toEqual(['q2'])
  })
  it('la note la plus récente l’emporte, même plus courte', () => {
    let { tel, pc } = deuxAppareils(vide({ notes: { 'gf-t1': 'Début' } }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, notes: { 'gf-t1': 'Une longue note écrite en premier sur le téléphone' } }))
    pc = sur('pc', 20, pc, (s) => ({ ...s, notes: { 'gf-t1': 'Courte, récente' } }))
    expect(recuperer(tel, compteDe(pc)).notes['gf-t1']).toBe('Courte, récente')
    expect(recuperer(pc, compteDe(tel)).notes['gf-t1']).toBe('Courte, récente')
  })
  it('une note effacée reste effacée', () => {
    let { tel, pc } = deuxAppareils(vide({ notes: { 'gf-t1': 'À effacer' } }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, notes: { 'gf-t1': '' } }))
    expect(recuperer(pc, compteDe(tel)).notes['gf-t1']).toBeUndefined()
  })
  it('une date du bac effacée n’est pas remise par l’autre appareil', () => {
    let { tel, pc } = deuxAppareils(vide({ bacDate: '2027-06-14' }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, bacDate: null }))
    expect(recuperer(pc, compteDe(tel)).bacDate).toBeNull()
  })
  it('la trace d’une suppression est oubliée au bout de 120 jours', () => {
    let { tel } = deuxAppareils(vide({ favorites: ['gf-t1'] }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, favorites: [] }))
    const jour = 86400000
    expect(Object.keys(mergeProgress(tel, compteDe(tel), 10 + 30 * jour)._sync.items.favorites || {})).toHaveLength(1)
    expect(mergeProgress(tel, compteDe(tel), 10 + 130 * jour)._sync.items.favorites).toBeUndefined()
  })
  it('le carnet fusionné garde sa taille maximale', () => {
    const erreurs = (n, d) => Array.from({ length: n }, (_, i) => ({ id: `${d}-${i}`, q: { q: `${d}-${i}` }, le: d }))
    const a = sur('tel', 1, vide(), (s) => ({ ...s, erreurs: erreurs(CARNET_MAX, '2026-10-02') }))
    const b = sur('pc', 2, vide(), (s) => ({ ...s, erreurs: erreurs(40, '2026-10-01') }))
    const f = recuperer(a, compteDe(b)).erreurs
    expect(f).toHaveLength(CARNET_MAX)
    expect(f.every((e) => e.le === '2026-10-02')).toBe(true)
  })
})

describe('pièces, gels et XP', () => {
  it('un achat sur le téléphone n’est pas remboursé par un gain sur l’ordinateur', () => {
    let { tel, pc } = deuxAppareils(vide({ xp: 4000, coins: 1000, shopWalletUpdatedAt: 100 }))
    tel = sur('tel', 10, tel, (s) => purchaseItem(s, 'av-fox'))
    expect(tel.coins).toBe(850)
    // Gain plus récent sur l'ordinateur, avant d'avoir vu l'achat.
    pc = sur('pc', 20, pc, (s) => ({ ...s, xp: s.xp + 40, coins: s.coins + 40, shopWalletUpdatedAt: 200 }))
    for (const fusion of [recuperer(tel, compteDe(pc)), recuperer(pc, compteDe(tel))]) {
      expect(fusion.coins).toBe(890)
      expect(fusion.xp).toBe(4040)
      expect(fusion.owned).toContain('av-fox')
    }
  })
  it('un gel utilisé sur un appareil et un gel acheté sur l’autre comptent tous les deux', () => {
    let { tel, pc } = deuxAppareils(vide({ freezes: 2 }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, freezes: s.freezes - 1 }))
    pc = sur('pc', 11, pc, (s) => ({ ...s, freezes: s.freezes + 1 }))
    expect(recuperer(tel, compteDe(pc)).freezes).toBe(2)
  })
  it('deux séances faites en même temps sur deux appareils ajoutent leurs XP et réponses', () => {
    let { tel, pc } = deuxAppareils(vide({ xp: 100, totalAnswers: 10, correctAnswers: 8 }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, xp: s.xp + 50, totalAnswers: s.totalAnswers + 5, correctAnswers: s.correctAnswers + 4 }))
    pc = sur('pc', 10, pc, (s) => ({ ...s, xp: s.xp + 30, totalAnswers: s.totalAnswers + 3, correctAnswers: s.correctAnswers + 3 }))
    const f = recuperer(tel, compteDe(pc))
    expect([f.xp, f.totalAnswers, f.correctAnswers]).toEqual([180, 18, 15])
  })
  it('fusionner deux fois, ou dans l’autre sens, ne change rien', () => {
    let { tel, pc } = deuxAppareils(vide({ xp: 100, coins: 100 }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, xp: s.xp + 50, coins: s.coins - 30 }))
    pc = sur('pc', 10, pc, (s) => ({ ...s, xp: s.xp + 20, coins: s.coins + 20 }))
    const une = recuperer(tel, compteDe(pc))
    const deux = recuperer(une, compteDe(pc))
    const inverse = recuperer(pc, compteDe(tel))
    for (const f of [deux, inverse]) expect([f.xp, f.coins]).toEqual([une.xp, une.coins])
    expect([une.xp, une.coins]).toEqual([170, 90])
  })
  it('une copie d’une ancienne version de l’application garde l’ancienne règle', () => {
    // L'ancienne version renvoie la progression sans métadonnées, après une
    // dépense plus récente : son solde l'emporte, comme avant.
    const tel = sur('tel', 10, vide({ coins: 100, shopWalletUpdatedAt: 100 }), (s) => ({ ...s, coins: 120, shopWalletUpdatedAt: 150 }))
    const ancienne = { ...vide(), coins: 90, shopWalletUpdatedAt: 300, xp: 5 }
    const f = recuperer(tel, ancienne)
    expect(f.coins).toBe(90)
    // Ensuite, les comptes reprennent appareil par appareil.
    const apres = sur('tel', 20, f, (s) => ({ ...s, coins: s.coins + 10 }))
    expect(apres.coins).toBe(100)
    expect(recuperer(vide(), compteDe(apres)).coins).toBe(100)
  })
  it('deux appareils passés au nouveau format chacun de leur côté ne remboursent pas un achat', () => {
    // L'ordinateur a acheté (portefeuille récent), le téléphone garde une copie
    // ancienne ; chacun gagne des pièces avant d'avoir vu l'autre.
    const pc = sur('pc', 10, vide({ xp: 4000, coins: 850, shopWalletUpdatedAt: 300 }), (s) => ({ ...s, coins: s.coins + 10, shopWalletUpdatedAt: 310 }))
    const tel = sur('tel', 11, vide({ xp: 4000, coins: 1000, shopWalletUpdatedAt: 100 }), (s) => ({ ...s, xp: s.xp + 5, coins: s.coins + 5, shopWalletUpdatedAt: 320 }))
    for (const f of [recuperer(tel, compteDe(pc)), recuperer(pc, compteDe(tel))]) {
      expect(f.coins).toBe(865)
      expect(f.xp).toBe(4005)
    }
  })
  it('un appareil neuf récupère exactement la copie du compte', () => {
    let { tel } = deuxAppareils(vide({ xp: 300, coins: 70, freezes: 1 }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, xp: s.xp + 10, coins: s.coins - 20 }))
    const neuf = recuperer(vide(), compteDe(tel))
    expect([neuf.xp, neuf.coins, neuf.freezes]).toEqual([310, 50, 1])
  })
})

describe('autres champs', () => {
  it('la récompense de la semaine reste réclamée après fusion', () => {
    const a = vide({ weekly: { week: '2026-W43', done: ['a', 'b', 'c', 'd', 'e'], rewarded: '2026-W43' } })
    const b = vide({ weekly: { week: '2026-W43', done: ['f'] } })
    expect(mergeProgress(b, a).weekly).toEqual({ week: '2026-W43', done: ['f', 'a', 'b', 'c', 'd', 'e'], rewarded: '2026-W43' })
  })
  it('à date égale, la série la plus longue est gardée', () => {
    const a = vide({ streak: { count: 3, last: '2026-10-19' } })
    const b = vide({ streak: { count: 5, last: '2026-10-19' } })
    expect(mergeProgress(a, b).streak.count).toBe(5)
  })
})

describe('détection de ce qui reste à envoyer', () => {
  it('rien à envoyer après un envoi réussi, puis à nouveau après une modification', () => {
    let s = sur('tel', 1, vide(), (x) => ({ ...x, xp: 10, notes: { 'gf-t1': 'TVA' } }))
    expect(aSauvegarder(s)).toBe(true)
    const charge = chargeUtile(s, 42)
    s = apresEnvoi(s, 42, empreinte(charge))
    expect(aSauvegarder(s)).toBe(false)
    expect(s._sync.vuServeur).toBe(42)
    s = sur('tel', 2, s, (x) => ({ ...x, notes: { 'gf-t1': 'TVA collectée' } }))
    expect(aSauvegarder(s)).toBe(true)
  })
  it('la version et l’appareil ne changent pas l’empreinte', () => {
    const s = sur('tel', 1, vide(), (x) => ({ ...x, xp: 10 }))
    expect(empreinte(chargeUtile(s, 1))).toBe(empreinte(chargeUtile(s, 2)))
  })
  it('la version lue sur le compte est retenue pour le prochain envoi', () => {
    const compte = chargeUtile(sur('pc', 1, vide(), (x) => ({ ...x, xp: 5 })), 77)
    expect(versionDe(compte)).toBe(77)
    expect(versionDe({ xp: 5 })).toBeNull()
    expect(avecVersionServeur(mergeProgress(vide(), compte), versionDe(compte))._sync.vuServeur).toBe(77)
  })
  it('une modification sans effet sur la progression ne crée pas de changement', () => {
    const s = sur('tel', 1, vide(), (x) => ({ ...x, xp: 10 }))
    expect(noter(s, { ...s, theme: 'dark' })._sync).toBe(s._sync)
  })
})
describe('solde de pièces', () => {
  it('deux achats hors ligne sur deux appareils ne rendent jamais le solde négatif', () => {
    let { tel, pc } = deuxAppareils(vide({ xp: 4000, coins: 50, shopWalletUpdatedAt: 100 }))
    tel = sur('tel', 10, tel, (s) => ({ ...s, coins: s.coins - 50, shopWalletUpdatedAt: 200 }))
    pc = sur('pc', 11, pc, (s) => ({ ...s, coins: s.coins - 50, shopWalletUpdatedAt: 201 }))
    const une = recuperer(tel, compteDe(pc))
    const inverse = recuperer(pc, compteDe(tel))
    expect(une.coins).toBeGreaterThanOrEqual(0)
    expect(inverse.coins).toBeGreaterThanOrEqual(0)
    // Refusionner ne fait pas redescendre sous zéro ni remonter le solde.
    expect(recuperer(une, compteDe(pc)).coins).toBe(une.coins)
    expect(recuperer(une, compteDe(tel)).coins).toBe(une.coins)
  })
})

