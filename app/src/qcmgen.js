// QCM chiffrés à données aléatoires : une question de QCM écrite dans le contenu
// peut porter un « gen » (par ex. « "gen": "taux_evolution" »). À chaque partie,
// elle est alors refaite avec de nouveaux nombres ; les mauvaises réponses
// reprennent les erreurs classiques (diviser par la valeur d'arrivée, confondre
// taux et coefficient, additionner les taux…). La version écrite dans le contenu
// reste la question de secours.
// Les méthodes sont celles du cours de mathématiques (Première et Terminale STMG).

// `r` : générateur de nombres dans [0 ; 1[ (Math.random, ou un tirage semé
// quand la question doit rester la même toute la journée).
const ri = (r, min, max, step = 1) => Math.floor(r() * ((max - min) / step + 1)) * step + min
const pick = (r, liste) => liste[Math.floor(r() * liste.length)]
const arrondi = (n, d) => Math.round(n * 10 ** d) / 10 ** d
// Nombre à la française (virgule, espace insécable pour les milliers, vrai signe moins).
const fr = (n, d = 2) => arrondi(n, d).toLocaleString('fr-FR', { maximumFractionDigits: d }).replace(/\u202f/g, '\u00a0').replace(/^-/, '−')
// Taux signé : « +25 % », « −8 % ».
const pct = (t, d = 2) => `${t > 0 ? '+' : t < 0 ? '−' : ''}${fr(Math.abs(t), d)}\u00a0%`

// Assemble la question : bonne réponse + trois erreurs distinctes, mélangées.
function question(r, q, bonne, fausses, explain) {
  const autres = [...new Set(fausses.filter((f) => f && f !== bonne))].slice(0, 3)
  if (autres.length < 3) return null
  const choices = [bonne, ...autres]
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return { q, choices, answer: choices.indexOf(bonne), explain }
}

// Raison d'une suite géométrique modélisant une évolution de t % par an : q = 1 + t.
function raison(r, t) {
  const a = Math.abs(t)
  return question(
    r,
    t > 0
      ? `Une augmentation de ${a}\u00a0% chaque année se modélise par une suite géométrique de raison…`
      : `Une baisse de ${a}\u00a0% par an correspond à une raison q égale à…`,
    fr(1 + t / 100),
    [fr(a / 100), String(a), fr(1 - t / 100), fr(1 + a)],
    `q = 1 ${t > 0 ? '+' : '−'} ${fr(a / 100)} = ${fr(1 + t / 100)}.`,
  )
}
const TAUX_ANNUELS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]

export const QCM_GEN = {
  // Taux d'évolution entre deux valeurs : (V1 − V0) / V0.
  taux_evolution: (r) => {
    const v0 = ri(r, 2, 20) * 20
    const t = pick(r, [-60, -50, -40, -35, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80])
    const v1 = v0 + (v0 * t) / 100
    return question(
      r,
      `Une valeur passe de ${fr(v0)} à ${fr(v1)}. Quel est le taux d’évolution ?`,
      pct(t),
      [pct(((v1 - v0) / v1) * 100, 1), pct(v1 - v0), pct(-t), pct(2 * t)],
      `Taux = (${fr(v1)} − ${fr(v0)}) / ${fr(v0)} = ${fr(t / 100)}, soit ${pct(t)}.`,
    )
  },

  // Coefficient multiplicateur associé à une hausse ou une baisse : 1 + t.
  coef_multiplicateur: (r) => {
    const t = pick(r, [3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]) * pick(r, [1, -1])
    const a = Math.abs(t)
    return question(
      r,
      `À une ${t > 0 ? 'hausse' : 'baisse'} de ${a}\u00a0% correspond quel coefficient multiplicateur ?`,
      fr(1 + t / 100),
      [fr(a / 100), fr(1 - t / 100), String(a), fr(1 + a)],
      `CM = 1 ${t > 0 ? '+' : '−'} ${fr(a / 100)} = ${fr(1 + t / 100)}.`,
    )
  },

  // Deux évolutions successives : on multiplie les coefficients, on n'additionne pas les taux.
  evolutions_successives: (r) => {
    const taux = [10, 15, 20, 25, 30, 40, 50]
    const a = pick(r, taux)
    const b = pick(r, taux)
    const [t1, t2] = r() < 0.6 ? [a, -b] : [-b, a]
    const cm = (1 + t1 / 100) * (1 + t2 / 100)
    const g = arrondi((cm - 1) * 100, 2)
    const dire = (x) => (x > 0 ? `Une hausse de ${fr(x)}\u00a0%` : x < 0 ? `Une baisse de ${fr(-x)}\u00a0%` : 'Aucun changement')
    const etape = (t) => `${t > 0 ? 'hausse' : 'baisse'} de ${Math.abs(t)}\u00a0%`
    return question(
      r,
      `Une ${etape(t1)} suivie d’une ${etape(t2)}, cela donne au total…`,
      dire(g),
      // Erreurs : additionner les taux, se tromper de sens, doubler, ne garder que la dernière évolution.
      [dire(t1 + t2), dire(-g), dire(arrondi(g * 2, 2)), dire(-(t1 + t2)), dire(t2)],
      `CM global = ${fr(1 + t1 / 100)} × ${fr(1 + t2 / 100)} = ${fr(cm, 4)} : ${dire(g).toLowerCase()}. On multiplie les coefficients, on n’additionne pas les taux.`,
    )
  },

  // Indice base 100 : (indice − 100) donne l'évolution en % depuis la référence.
  indice_base100: (r) => {
    let i = ri(r, 40, 230)
    if (i === 100) i = 125
    const e = i - 100
    const sens = (x) => (x > 0 ? `Augmenté de ${x}\u00a0% depuis la référence` : `Baissé de ${-x}\u00a0% depuis la référence`)
    return question(
      r,
      `Un indice base 100 vaut ${i}. Cela signifie que la valeur a…`,
      sens(e),
      [`Été multipliée par ${i}`, sens(-e), `Augmenté de ${i}\u00a0%`, `Baissé de ${i}\u00a0%`],
      `Indice ${i} : la valeur vaut ${fr(i / 100)} fois la valeur de référence, soit ${e > 0 ? 'une hausse' : 'une baisse'} de ${Math.abs(e)}\u00a0%.`,
    )
  },

  raison_hausse: (r) => raison(r, pick(r, TAUX_ANNUELS)),
  raison_baisse: (r) => raison(r, -pick(r, TAUX_ANNUELS)),
}

// Une question telle qu'on la joue : refaite avec de nouveaux nombres si elle a
// un générateur, sinon telle qu'écrite. Le « gen » n'est pas recopié : la
// question jouée (par exemple gardée dans le carnet d'erreurs) garde ses nombres.
// Les autres champs (thème…) sont conservés.
export function instancierQuestion(q, r = Math.random) {
  if (!q?.gen) return q
  const { gen, ...ecrite } = q
  const fabrique = QCM_GEN[gen]
  for (let essai = 0; fabrique && essai < 5; essai++) {
    const neuve = fabrique(r)
    if (neuve) return { ...ecrite, ...neuve }
  }
  return ecrite
}
