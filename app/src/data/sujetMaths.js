// Sujet d'entraînement à l'épreuve anticipée de mathématiques (Première STMG),
// au format fixé par la note de service du 11 septembre 2026 (BO spécial n° 4
// du 17 septembre 2026, NOR MENE2622640N), pour la session 2028 :
// - 2 heures, sans calculatrice ;
// - partie 1 (6 points) : automatismes, questions à réponses courtes ;
// - partie 2 (14 points) : deux ou trois exercices indépendants (ici trois) ;
// - 2 points sur 20 portent sur la maîtrise de la langue : l'application ne
//   peut pas les évaluer, la correction le dit.
// Domaines du tronc commun technologique : automatismes, analyse, statistiques
// et probabilités. Chaque question n'utilise que des notions des chapitres de
// Première de l'application (content/p1-maths). Les nombres sont tirés au hasard
// et choisis pour que les calculs se fassent de tête.
// Ce n'est pas un sujet officiel : la page le dit.

export const DUREE_MATHS = 2 * 60 * 60 // secondes
export const BO_MATHS = 'https://www.education.gouv.fr/sites/default/files/document/bulletin-officiel-special-ndeg-4-du-17-septembre-2026-521113.pdf'

const pgcd = (a, b) => (b ? pgcd(b, a % b) : Math.abs(a))
const arrondi = (x) => Math.round(x * 1e9) / 1e9 || 0 // sans « −0 »
export const nombre = (x) => arrondi(x).toLocaleString('fr-FR', { maximumFractionDigits: 6 }).replace(/\s/g, ' ').replace(/^-/, '−')
// Nombre entre parenthèses s'il est négatif : « 3 − (−5) ».
const par = (x) => (x < 0 ? `(${nombre(x)})` : nombre(x))
const signe = (x) => (x < 0 ? `− ${nombre(-x)}` : `+ ${nombre(x)}`)
// Somme écrite avec ses signes : [18, −0, 4] → « 18 + 4 », [−8, 5] → « −8 + 5 ».
const somme = (termes) => termes.filter((v, i) => v || i === 0).map((v, i) => (i === 0 ? nombre(v) : `${v < 0 ? '−' : '+'} ${nombre(Math.abs(v))}`)).join(' ')
const pourcent = (x) => `${x > 0 ? '+' : ''}${nombre(x)} %`

function tirage(aleatoire) {
  const choix = (liste) => liste[Math.floor(aleatoire() * liste.length)]
  const entier = (a, b) => a + Math.floor(aleatoire() * (b - a + 1))
  return { choix, entier }
}

// Polynôme a·x² + b·x + c écrit proprement (« −x² + 8x − 12 »).
export function polynome(a, b, c) {
  const termes = []
  const ajoute = (k, partie) => {
    if (!k) return
    const abs = Math.abs(k)
    const coef = partie && abs === 1 ? '' : nombre(abs)
    if (!termes.length) termes.push(`${k < 0 ? '−' : ''}${coef}${partie}`)
    else termes.push(`${k < 0 ? '−' : '+'} ${coef}${partie}`)
  }
  ajoute(a, 'x²'); ajoute(b, 'x'); ajoute(c, '')
  return termes.join(' ') || '0'
}

const fraction = (num, den) => { const g = pgcd(num, den); return { num: num / g, den: den / g } }
const ecritFraction = ({ num, den }) => (den === 1 ? `${num}` : `${num}/${den}`)

// ---------- Partie 1 : automatismes (12 questions, 0,5 point chacune) ----------

const AUTOMATISMES = [
  ({ choix }) => {
    const n = choix([20, 25, 40, 50]), p = choix([20, 40, 60, 80]), k = (n * p) / 100
    return { enonce: `Dans une équipe de ${n} salariés, ${k} travaillent à temps partiel. Quelle proportion des salariés, en pourcentage, travaille à temps partiel ?`, reponse: { valeur: p }, unite: '%', correction: `${k} / ${n} = ${nombre(p / 100)}, soit ${p} %.` }
  },
  ({ choix }) => {
    const p = choix([5, 15, 25, 30, 40, 75]), x = choix([40, 60, 80, 120, 200, 240, 400]), r = (p * x) / 100
    return { enonce: `Calculer ${p} % de ${x} €.`, reponse: { valeur: r }, unite: '€', correction: `${p} % de ${x} = ${nombre(p / 100)} × ${x} = ${nombre(r)} €.` }
  },
  ({ choix }) => {
    const a = choix([40, 80, 120, 200, 400]), t = choix([10, 20, 25, 50, -10, -20, -25, -50]), b = (a * (100 + t)) / 100
    return { enonce: `Le prix d’un article passe de ${a} € à ${nombre(b)} €. Quel est le taux d’évolution, en pourcentage ?`, reponse: { valeur: t }, unite: '%', correction: `t = (${nombre(b)} − ${a}) / ${a} = ${nombre(b - a)} / ${a} = ${nombre(t / 100)}, soit ${pourcent(t)}.` }
  },
  ({ choix }) => {
    const t = choix([3, 5, 8, 12, 15, 20, 35]), hausse = choix([true, false]), cm = (100 + (hausse ? t : -t)) / 100
    return { enonce: `Quel est le coefficient multiplicateur associé à une ${hausse ? 'hausse' : 'baisse'} de ${t} % ?`, reponse: { valeur: cm }, correction: `CM = 1 ${hausse ? '+' : '−'} ${nombre(t / 100)} = ${nombre(cm)}.` }
  },
  ({ choix }) => {
    const [t1, t2] = choix([[10, 10], [20, -20], [50, -50], [10, -10], [-10, -10], [20, 10], [50, 20]])
    const g = ((100 + t1) * (100 + t2)) / 100 - 100
    const mot = (t) => (t > 0 ? `augmente de ${t} %` : `baisse de ${-t} %`)
    return { enonce: `Un prix ${mot(t1)}, puis ${mot(t2).replace('augmente', 'augmente encore').replace('baisse', 'baisse')}. Quel est le taux d’évolution global, en pourcentage ?`, reponse: { valeur: g }, unite: '%', correction: `On multiplie les coefficients : ${nombre((100 + t1) / 100)} × ${nombre((100 + t2) / 100)} = ${nombre((100 + g) / 100)}, soit ${pourcent(g)}. On n’additionne pas les taux.` }
  },
  ({ choix }) => {
    const [t, r] = choix([[25, -20], [100, -50], [-20, 25], [-50, 100], [300, -75]])
    return { enonce: `Un prix ${t > 0 ? 'augmente' : 'baisse'} de ${Math.abs(t)} %. De quel pourcentage doit-il ${r > 0 ? 'augmenter' : 'baisser'} pour revenir à sa valeur de départ ?`, reponse: { valeur: Math.abs(r) }, unite: '%', correction: `Coefficient réciproque : 1 / ${nombre((100 + t) / 100)} = ${nombre((100 + r) / 100)}, soit une ${r > 0 ? 'hausse' : 'baisse'} de ${nombre(Math.abs(r))} %.` }
  },
  ({ choix }) => {
    const [a, b, op, c, d] = choix([[1, 2, '+', 1, 3], [3, 4, '−', 1, 6], [2, 3, '+', 1, 4], [5, 6, '−', 1, 4], [1, 3, '+', 1, 6], [3, 5, '+', 1, 10], [7, 8, '−', 1, 4]])
    const den = (b * d) / pgcd(b, d), num = (a * den) / b + (op === '+' ? 1 : -1) * (c * den) / d
    const f = fraction(num, den)
    return { enonce: `Calculer ${a}/${b} ${op} ${c}/${d}. Donner le résultat sous forme de fraction irréductible.`, reponse: { fraction: f }, correction: `Même dénominateur ${den} : ${(a * den) / b}/${den} ${op} ${(c * den) / d}/${den} = ${num}/${den}${f.den !== den ? ` = ${ecritFraction(f)}` : ''}.` }
  },
  ({ entier, choix }) => {
    const a = entier(-4, 6), b = entier(-6, 4), op = choix(['×', '÷']), n = op === '×' ? a + b : a - b
    const p = (k) => `10${k < 0 ? '⁻' : ''}${String(Math.abs(k)).split('').map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[ch]).join('')}`
    return { enonce: `Écrire ${p(a)} ${op} ${p(b)} sous la forme 10ⁿ. Quelle est la valeur de n ?`, reponse: { valeur: n }, correction: op === '×' ? `On additionne les exposants : ${nombre(a)} + ${par(b)} = ${nombre(n)}.` : `On soustrait les exposants : ${nombre(a)} − ${par(b)} = ${nombre(n)}.` }
  },
  ({ entier }) => {
    const x0 = entier(-6, 9) || 3, a = entier(3, 7), c = entier(1, a - 1), b = entier(-9, 9), d = (a - c) * x0 + b
    const membre = (k, l) => `${k === 1 ? '' : k}x ${signe(l).replace('+ 0', '').replace('− 0', '')}`.trim()
    return { enonce: `Résoudre l’équation ${membre(a, b)} = ${membre(c, d)}.`, reponse: { valeur: x0 }, unite: 'x =', avant: true, correction: `${a}x − ${c === 1 ? '' : c}x = ${nombre(d)} − ${par(b)}, donc ${a - c === 1 ? '' : a - c}x = ${nombre(d - b)} et x = ${nombre(x0)}.` }
  },
  ({ entier }) => {
    let m = entier(-4, 4); if (!m) m = 2
    const x1 = entier(-3, 3), dx = entier(1, 4), y1 = entier(-5, 5), x2 = x1 + dx, y2 = y1 + m * dx
    return { enonce: `Une droite passe par les points A(${nombre(x1)} ; ${nombre(y1)}) et B(${nombre(x2)} ; ${nombre(y2)}). Quel est son coefficient directeur ?`, reponse: { valeur: m }, correction: `m = (${nombre(y2)} − ${par(y1)}) / (${nombre(x2)} − ${par(x1)}) = ${nombre(y2 - y1)} / ${dx} = ${nombre(m)}.` }
  },
  ({ entier }) => {
    let a = entier(-3, 3); if (!a) a = 1
    const b = entier(-5, 5), c = entier(-9, 9), x0 = entier(-3, 3), v = a * x0 * x0 + b * x0 + c
    return { enonce: `Soit f(x) = ${polynome(a, b, c)}. Calculer f(${nombre(x0)}).`, reponse: { valeur: v }, correction: `f(${nombre(x0)}) = ${nombre(a)} × ${par(x0)}²${b ? ` ${signe(b)} × ${par(x0)}` : ''}${c ? ` ${signe(c)}` : ''} = ${somme([a * x0 * x0, b * x0, c])} = ${nombre(v)}.` }
  },
  ({ entier }) => {
    const m = entier(9, 14), notes = Array.from({ length: 4 }, () => entier(m - 5, m + 5))
    let dernier = 5 * m - notes.reduce((s, x) => s + x, 0)
    if (dernier < 0 || dernier > 20) { notes.splice(0, 4, m - 2, m + 3, m - 1, m + 1); dernier = 5 * m - notes.reduce((s, x) => s + x, 0) }
    const serie = [...notes, dernier]
    return { enonce: `Un élève a obtenu les notes ${serie.join(' ; ')}. Quelle est sa moyenne ?`, reponse: { valeur: m }, correction: `Somme : ${serie.join(' + ')} = ${5 * m} ; ${5 * m} / 5 = ${m}.` }
  },
]

// ---------- Partie 2 : exercices ----------

function secondDegre({ entier, choix }) {
  let r1 = entier(1, 4), r2 = entier(r1 + 2, 12)
  if ((r1 + r2) % 2) r2 += r2 < 12 ? 1 : -1
  const s = r1 + r2, p = r1 * r2, h = s / 2, max = h * h - p, borne = r2 + 2
  const B = (x) => -x * x + s * x - p
  const k = choix([r1 + 1, h - 1, h + 1].filter((x) => x > 0 && x !== h))
  return {
    titre: 'Exercice — Bénéfice et second degré',
    domaine: 'Analyse',
    contexte: `Une entreprise fabrique chaque jour x centaines d’objets, avec 0 ≤ x ≤ ${borne}. Son bénéfice, en milliers d’euros, est B(x) = ${polynome(-1, s, -p)}.`,
    questions: [
      { enonce: `Calculer B(${k}).`, reponse: { valeur: B(k) }, points: 1, correction: `B(${k}) = −${k}² + ${s} × ${k} − ${p} = ${nombre(-k * k)} + ${s * k} − ${p} = ${nombre(B(k))}.` },
      { enonce: `On note B′ la fonction dérivée de B. Calculer le nombre dérivé B′(${k}).`, reponse: { valeur: -2 * k + s }, points: 1, correction: `B′(x) = −2x + ${s}, donc B′(${k}) = ${nombre(-2 * k)} + ${s} = ${nombre(-2 * k + s)}.` },
      { enonce: 'Pour quelle valeur de x le bénéfice est-il maximal ?', reponse: { valeur: h }, points: 1, unite: 'x =', avant: true, correction: `B′(x) = −2x + ${s} s’annule pour x = ${s} / 2 = ${h}. B′ est positive avant ${h} et négative après : B est croissante puis décroissante, son maximum est atteint en x = ${h}.` },
      { enonce: 'Quel est ce bénéfice maximal, en milliers d’euros ?', reponse: { valeur: max }, points: 1, unite: 'k€', correction: `B(${h}) = −${h}² + ${s} × ${h} − ${p} = ${nombre(-h * h)} + ${s * h} − ${p} = ${max}, soit ${nombre(max * 1000)} €.` },
      { enonce: `On a B(${r1}) = 0. Pour quelle autre valeur de x le bénéfice est-il nul ?`, reponse: { valeur: r2 }, points: 1, unite: 'x =', avant: true, correction: `B(x) = −(x − ${r1})(x − ${r2}) : en développant, on retrouve ${polynome(-1, s, -p)}. Le bénéfice s’annule en x = ${r1} et en x = ${r2}.` },
    ],
  }
}

function tableauCroise({ choix }) {
  const N = 200, jeunes = choix([40, 80, 120]), autres = N - jeunes
  const f1 = choix([0.25, 0.5, 0.75]), f2 = choix([0.25, 0.5, 0.75].filter((f) => f !== f1))
  const a = jeunes * f1, b = autres * f2, c = jeunes - a, d = autres - b, cartes = a + b
  const cond = fraction(a, cartes)
  return {
    titre: 'Exercice — Tableau croisé et probabilités',
    domaine: 'Statistiques et probabilités',
    contexte: `Un magasin interroge ${N} clients. Le tableau donne leur âge et s’ils ont une carte de fidélité. Une case est manquante.`,
    tableau: {
      entetes: ['', 'Moins de 30 ans', '30 ans ou plus', 'Total'],
      lignes: [['Avec carte', a, b, cartes], ['Sans carte', c, '?', c + d], ['Total', jeunes, autres, N]],
    },
    questions: [
      { enonce: 'Quel nombre manque dans le tableau ?', reponse: { valeur: d }, points: 1, correction: `Clients de 30 ans ou plus sans carte : ${autres} − ${b} = ${d}.` },
      { enonce: 'Quelle est la fréquence, en pourcentage, des clients qui ont une carte de fidélité ?', reponse: { valeur: (cartes / N) * 100 }, points: 1, unite: '%', correction: `${cartes} / ${N} = ${nombre(cartes / N)}, soit ${nombre((cartes / N) * 100)} %.` },
      { enonce: 'Parmi les clients de moins de 30 ans, quelle est la fréquence, en pourcentage, de ceux qui ont une carte ?', reponse: { valeur: f1 * 100 }, points: 1, unite: '%', correction: `Fréquence conditionnelle : ${a} / ${jeunes} = ${nombre(f1)}, soit ${nombre(f1 * 100)} %.` },
      { enonce: 'On choisit un client au hasard. Quelle est la probabilité qu’il ait moins de 30 ans et une carte ? (écriture décimale)', reponse: { valeur: a / N }, points: 1, correction: `${a} clients sur ${N} : ${a} / ${N} = ${nombre(a / N)}.` },
      { enonce: 'Le client choisi a une carte. Quelle est la probabilité qu’il ait moins de 30 ans ? (fraction irréductible)', reponse: { fraction: cond }, points: 1, correction: `On se limite aux ${cartes} clients avec carte : ${a} / ${cartes} = ${ecritFraction(cond)}.` },
    ],
  }
}

function arbre({ choix }) {
  const pa = choix([20, 30, 40, 60, 70]), q1 = choix([10, 20, 50, 80, 90]), q2 = choix([10, 20, 30, 40].filter((x) => x !== q1))
  const inter = (pa * q1) / 10000, pb = (pa * q1 + (100 - pa) * q2) / 10000
  return {
    titre: 'Exercice — Arbre pondéré',
    domaine: 'Statistiques et probabilités',
    contexte: `Sur un site de vente, ${pa} % des visiteurs arrivent par une publicité (événement A). Parmi eux, ${q1} % achètent (événement B). Parmi les autres visiteurs, ${q2} % achètent. On choisit un visiteur au hasard. Les réponses s’écrivent en écriture décimale.`,
    questions: [
      { enonce: 'Calculer P(Ā), la probabilité que le visiteur ne vienne pas d’une publicité.', reponse: { valeur: (100 - pa) / 100 }, points: 1, correction: `P(Ā) = 1 − ${nombre(pa / 100)} = ${nombre((100 - pa) / 100)}.` },
      { enonce: 'Calculer P_A(B̄), la probabilité qu’un visiteur venu d’une publicité n’achète pas.', reponse: { valeur: (100 - q1) / 100 }, points: 1, correction: `P_A(B̄) = 1 − P_A(B) = 1 − ${nombre(q1 / 100)} = ${nombre((100 - q1) / 100)}.` },
      { enonce: 'Calculer P(A ∩ B).', reponse: { valeur: inter }, points: 1, correction: `P(A ∩ B) = P(A) × P_A(B) = ${nombre(pa / 100)} × ${nombre(q1 / 100)} = ${nombre(inter)}.` },
      { enonce: 'Calculer P(B), la probabilité que le visiteur achète.', reponse: { valeur: pb }, points: 1, correction: `Formule des probabilités totales : P(B) = P(A ∩ B) + P(Ā ∩ B) = ${nombre(inter)} + ${nombre((100 - pa) / 100)} × ${nombre(q2 / 100)} = ${nombre(pb)}.` },
      { enonce: 'Sur 1 000 visiteurs, combien d’achats peut-on prévoir ?', reponse: { valeur: pb * 1000 }, points: 1, correction: `1 000 × ${nombre(pb)} = ${nombre(pb * 1000)} achats environ.` },
    ],
  }
}

function statistiques({ entier }) {
  const valeurs = Array.from({ length: 8 }, () => entier(5, 25))
  let m = Math.round(valeurs.reduce((s, x) => s + x, 0) / 8)
  let dernier = 9 * m - valeurs.reduce((s, x) => s + x, 0)
  while (dernier < 5) { m++; dernier += 9 }
  while (dernier > 25) { m--; dernier -= 9 }
  const serie = [...valeurs, dernier]
  const tri = [...serie].sort((x, y) => x - y)
  // Rangs pour 9 valeurs : médiane 5e ; Q1 = 3e (25 % de 9 = 2,25) ; Q3 = 7e (6,75).
  const med = tri[4], q1 = tri[2], q3 = tri[6]
  return {
    titre: 'Exercice — Statistiques',
    domaine: 'Statistiques et probabilités',
    contexte: `Voici le temps d’attente, en minutes, de 9 clients à un guichet : ${serie.join(' ; ')}.`,
    questions: [
      { enonce: 'Quelle est l’étendue de la série ?', reponse: { valeur: tri[8] - tri[0] }, points: 1, unite: 'min', correction: `Série rangée : ${tri.join(' ; ')}. Étendue : ${tri[8]} − ${tri[0]} = ${tri[8] - tri[0]}.` },
      { enonce: 'Quelle est la médiane ?', reponse: { valeur: med }, points: 1, unite: 'min', correction: `9 valeurs : la médiane est la 5e valeur de la série rangée, ${med}.` },
      { enonce: 'Quel est le premier quartile Q1 ?', reponse: { valeur: q1 }, points: 1, unite: 'min', correction: `25 % de 9 = 2,25 : Q1 est la 3e valeur de la série rangée, ${q1}.` },
      { enonce: 'Quel est l’écart interquartile Q3 − Q1 ?', reponse: { valeur: q3 - q1 }, points: 1, unite: 'min', correction: `75 % de 9 = 6,75 : Q3 est la 7e valeur, ${q3}. Écart interquartile : ${q3} − ${q1} = ${q3 - q1}.` },
      { enonce: 'Quelle est la moyenne de la série ?', reponse: { valeur: m }, points: 1, unite: 'min', correction: `Somme : ${9 * m} ; ${9 * m} / 9 = ${m}.` },
    ],
  }
}

function suiteArithmetique({ choix, entier }) {
  const u0 = choix([150, 200, 250, 300]), r = choix([12, 15, 20, 25]), seuil = u0 + r * entier(5, 9) + choix([5, 8, 10])
  const n = Math.floor((seuil - u0) / r) + 1
  return {
    titre: 'Exercice — Suite arithmétique',
    domaine: 'Analyse',
    contexte: `En janvier 2027, une salle de sport compte ${u0} abonnés. Chaque mois, elle en gagne ${r}. On note uₙ le nombre d’abonnés n mois après janvier 2027 : u₀ = ${u0}.`,
    questions: [
      { enonce: 'Calculer u₁.', reponse: { valeur: u0 + r }, points: 1, correction: `u₁ = u₀ + ${r} = ${u0 + r}.` },
      { enonce: 'La suite (uₙ) est arithmétique. Quelle est sa raison ?', reponse: { valeur: r }, points: 1, correction: `On ajoute ${r} chaque mois : la raison est r = ${r}.` },
      { enonce: 'Calculer u₁₂.', reponse: { valeur: u0 + 12 * r }, points: 1, correction: `uₙ = u₀ + n × r, donc u₁₂ = ${u0} + 12 × ${r} = ${u0 + 12 * r}.` },
      { enonce: `Au bout de combien de mois le nombre d’abonnés dépasse-t-il ${seuil} pour la première fois ?`, reponse: { valeur: n }, points: 1, unite: 'mois', correction: `${u0} + n × ${r} > ${seuil} ⟺ n > ${nombre((seuil - u0) / r)}. Le plus petit entier qui convient est n = ${n}.` },
    ],
  }
}

function suiteGeometrique({ choix }) {
  const [u0, q] = choix([[200, 1.1], [500, 1.2], [1000, 0.9], [500, 0.8], [400, 1.5], [800, 0.5]])
  const u1 = arrondi(u0 * q), u2 = arrondi(u1 * q), t = arrondi((q * q - 1) * 100)
  const sens = q > 1 ? `augmente de ${nombre((q - 1) * 100)} %` : `baisse de ${nombre((1 - q) * 100)} %`
  return {
    titre: 'Exercice — Suite géométrique',
    domaine: 'Analyse',
    contexte: `Un site reçoit ${nombre(u0)} commandes en janvier. Chaque mois, le nombre de commandes ${sens}. On note uₙ le nombre de commandes n mois après janvier : u₀ = ${u0}.`,
    questions: [
      { enonce: 'Calculer u₁.', reponse: { valeur: u1 }, points: 1, correction: `u₁ = ${nombre(u0)} × ${nombre(q)} = ${nombre(u1)}.` },
      { enonce: 'Calculer u₂.', reponse: { valeur: u2 }, points: 1, correction: `u₂ = ${nombre(u1)} × ${nombre(q)} = ${nombre(u2)}.` },
      { enonce: 'La suite (uₙ) est géométrique. Quelle est sa raison ?', reponse: { valeur: q }, points: 1, correction: `On multiplie par ${nombre(q)} chaque mois : la raison est q = ${nombre(q)}.` },
      { enonce: 'Quel est le taux d’évolution global, en pourcentage, entre janvier et mars (de u₀ à u₂) ?', reponse: { valeur: t }, points: 1, unite: '%', correction: `CM global = ${nombre(q)}² = ${nombre(q * q)}, soit ${pourcent(t)}.` },
    ],
  }
}

// Trois exercices de domaines différents : 5 + 5 + 4 = 14 points.
const EXERCICES = { analyse: [secondDegre], statsProbas: [tableauCroise, arbre, statistiques], suites: [suiteArithmetique, suiteGeometrique] }

export function composerSujetMaths(aleatoire = Math.random) {
  const t = tirage(aleatoire)
  const automatismes = AUTOMATISMES.map((f, i) => ({ id: `a${i + 1}`, points: 0.5, ...f(t) }))
  const exercices = [t.choix(EXERCICES.analyse), t.choix(EXERCICES.statsProbas), t.choix(EXERCICES.suites)]
    .map((f, i) => { const e = f(t); return { ...e, id: `e${i + 1}`, questions: e.questions.map((q, j) => ({ ...q, id: `e${i + 1}q${j + 1}` })) } })
  return {
    titre: 'Épreuve anticipée de mathématiques — sujet d’entraînement',
    duree: DUREE_MATHS,
    parties: [
      { titre: 'Partie 1 — Automatismes', bareme: 6, consigne: 'Questions à réponses courtes, sans justification.', exercices: [{ id: 'auto', questions: automatismes }] },
      { titre: 'Partie 2 — Exercices', bareme: 14, consigne: 'Trois exercices indépendants. À l’épreuve, chaque réponse doit être justifiée : écris ta démarche sur une feuille.', exercices },
    ],
  }
}

// Lecture d'une réponse saisie : « 12,5 », « 12.5 », « −4 », « +21 % », « 7/12 ».
export function lireReponse(texte) {
  const s = String(texte ?? '').replace(/[\s  %€]/g, '').replace(/[−–]/g, '-').replace(',', '.').replace(/^x=/i, '').replace(/[a-zéè]+$/i, '')
  if (!s) return null
  const f = s.match(/^([+-]?\d+)\/(\d+)$/)
  if (f) return Number(f[2]) ? { num: Number(f[1]), den: Number(f[2]) } : null
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(s) ? { valeur: Number(s) } : null
}

export function reponseJuste(question, texte) {
  const r = lireReponse(texte)
  if (!r) return false
  const attendu = question.reponse
  if (attendu.fraction) {
    const { num, den } = attendu.fraction
    if (r.num != null) return r.num * den === num * r.den && pgcd(r.num, r.den) === 1
    return den === 1 && Math.abs(r.valeur - num) < 1e-9
  }
  const v = r.num != null ? r.num / r.den : r.valeur
  return Math.abs(v - attendu.valeur) < 1e-9
}

export function texteReponse(question) {
  const { fraction: f, valeur } = question.reponse
  return f ? ecritFraction(f) : nombre(valeur)
}

// Points obtenus par partie (sur 6 et sur 14) d'après les réponses saisies.
export function corriger(sujet, reponses) {
  const parties = sujet.parties.map((p) => {
    let points = 0
    for (const e of p.exercices) for (const q of e.questions) if (reponseJuste(q, reponses[q.id])) points += q.points
    return { titre: p.titre, points, bareme: p.bareme }
  })
  return { parties, total: parties.reduce((s, p) => s + p.points, 0) }
}
