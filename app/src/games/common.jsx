// Utilitaires partagés par les mini-jeux.
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useT } from '../i18n.js'
import { ALL_CHAPTERS, notionDuChoix } from '../data/index.js'

// Normalise une saisie : minuscules, sans accents, espaces réduits.
export function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function answerMatches(input, answer, alt = []) {
  const n = normalize(input)
  if (!n) return false
  return [answer, ...alt].some((a) => normalize(a) === n)
}

// Réponse débarrassée de ce qui n'est pas la notion elle-même : article,
// numéro de liste, trait d'union, ponctuation finale.
export function sansHabillage(s) {
  return normalize(s)
    .replace(/^\d+\s*[.)]\s+/, '') // « 5. La mineure » ; pas « 5.5 »
    .replace(/^[\u2460-\u2473]\s*/, '')
    .replace(/^(l'|d'|le |la |les |un |une |des |du |de la |de l')/, '')
    .replace(/[-‐‑]/g, ' ')
    .replace(/[\s.;:!?…,]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Écritures équivalentes d'une même réponse chiffrée ou datée : « 2000 € » et
// « 2 000 € », « 10% » et « 10 % », « 5.5 » et « 5,5 », « 2 septembre 1945 » et
// « 2 sept. 1945 ». Appliqué aux réponses de cours, jamais aux langues.
const MOIS = { janv: 'janvier', fevr: 'fevrier', avr: 'avril', juil: 'juillet', sept: 'septembre', oct: 'octobre', nov: 'novembre', dec: 'decembre' }
export function formeCanonique(s) {
  return sansHabillage(s)
    .replace(/(\d)\s+(?=\d{3}(?!\d))/g, '$1')
    .replace(/(\d)\.(?=\d)/g, '$1,')
    .replace(/\s*([€%])/g, ' $1')
    .replace(/\b(janv|fevr|avr|juil|sept|oct|nov|dec)\.?(?=\s|$)/g, (_, m) => MOIS[m])
    .replace(/\s+/g, ' ')
    .trim()
}

// Formes acceptées pour une réponse attendue : avec ou sans sigle entre
// parenthèses (« hors taxes (HT) »), le sigle seul, sans « TTC » / « HT » final.
function formesAcceptees(a) {
  const brut = String(a)
  const formes = [brut]
  const paren = brut.match(/^(.*?)\s*\(([^()]{1,12})\)\s*\.?$/)
  if (paren) {
    formes.push(paren[1])
    // Le sigle entre parenthèses est une réponse seulement s'il a au moins deux
    // caractères et n'est pas une simple date (« Lois de Nuremberg (1935) »).
    const sigle = paren[2].trim()
    if (sigle.length >= 2 && !/^[\d\s.,/-]+$/.test(sigle)) formes.push(sigle)
  }
  for (const f of [...formes]) { const sans = f.replace(/\s+(ttc|ht)\s*$/i, ''); if (sans !== f) formes.push(sans) }
  return formes.filter((f) => f.trim())
}

// Valeur numérique d'une réponse chiffrée : « 240 € », « 2,00 € », « 10 % »,
// « 240 euros », « 10 pour cent ». Retourne { n, unite } ou null.
export function valeurNumerique(s) {
  const t = String(s ?? '')
    .toLowerCase()
    .replace(/[\u2212\u2013]/g, '-')
    .replace(/[\s\u00a0\u202f]+/g, ' ')
    .trim()
  const m = t.match(/^(-?\s?\d+(?: \d{3})*(?:[.,]\d+)?|-?\s?\d+(?:[.,]\d+)?)\s*(€|euros?|%|pour ?cent|pourcents?)?\s*\.?$/)
  if (!m) return null
  const n = parseFloat(m[1].replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(n)) return null
  const u = m[2] || ''
  return { n, unite: !u ? '' : /€|euro/.test(u) ? 'eur' : 'pct' }
}
// Saisie chiffrée stricte pour les calculs : « 7 000 », « 8,45 », « −5 », « 12 € »,
// « 7.000 » (séparateur de milliers). « 3/4 » ou « 12 abc » ne sont pas des nombres.
export function parseNombre(s) {
  const t = String(s ?? '').replace(/[\s\u00a0\u202f]+/g, ' ').trim()
  if (/^[+\-−]?\s?[1-9]\d{0,2}(\.\d{3})+(\s*(€|euros?|%))?$/.test(t)) return parseNombre(t.replace(/\./g, ''))
  const v = valeurNumerique(t.replace(/^\+\s?/, ''))
  return v ? v.n : null
}
function memeValeur(saisie, attendu) {
  const a = valeurNumerique(saisie)
  const b = valeurNumerique(attendu)
  if (!a || !b || a.n !== b.n) return false
  return !a.unite || !b.unite || a.unite === b.unite
}

// Exercices de cours (saisie, texte à trous, cas) : « convention collective »
// vaut « La convention collective », « mineure » vaut « 5. La mineure »,
// « 240 » ou « 240 euros » valent « 240 € ». Pas pour les langues, où
// l'article fait partie de la réponse.
export function answerMatchesCours(input, answer, alt = []) {
  if (answerMatches(input, answer, alt)) return true
  const n = formeCanonique(input)
  if (!n) return false
  const formes = [answer, ...alt].flatMap(formesAcceptees)
  return formes.some((f) => formeCanonique(f) === n || memeValeur(input, f))
}

// Langues : les diacritiques font partie de la réponse (« está » ≠ « esta »,
// « où » ≠ « ou »). Seules la casse, la ponctuation, l'apostrophe, la ligature
// et les voyelles brèves de l'arabe sont tolérées.
export function normalizeLangue(s) {
  return String(s ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[’`´]/g, "'")
    .replace(/[.,;:!?¡¿…«»"“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
export function answerMatchesLangue(input, answer, alt = []) {
  const n = normalizeLangue(input)
  if (!n) return false
  return [answer, ...alt].some((a) => normalizeLangue(a) === n)
}
export const estJeuLangue = (game) => /^(?:p1-)?lng-/.test(String(game?.id || ''))
// Correcteur adapté au jeu : strict sur les accents en langues, tolérant ailleurs.
export const correcteurDe = (game) => (estJeuLangue(game) ? answerMatchesLangue : answerMatchesCours)

// Mélange les propositions d'une question et recale l'indice de la bonne
// réponse. Les QCM des études de documents sont écrits avec la bonne réponse
// en premier : sans ce mélange, la réponse serait toujours « A ».
export function melangerChoix(q) {
  if (!q || q.type === 'redac' || !Array.isArray(q.choices) || !Number.isInteger(q.answer)) return q
  const ordre = shuffle(q.choices.map((_, k) => k))
  return { ...q, choices: ordre.map((k) => q.choices[k]), answer: ordre.indexOf(q.answer) }
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Chronomètre pour le mode Défi (temps écoulé, en secondes).
export function useStopwatch(active) {
  const [s, setS] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (!active) return
    ref.current = setInterval(() => setS((v) => v + 1), 1000)
    return () => clearInterval(ref.current)
  }, [active])
  return s
}

export function fmtTime(s) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

// Bandeau de correction (bonne / mauvaise réponse + explication).
// Thème et chapitre de l'exercice en cours (fournis par GameHost) : la
// correction peut dire où revoir la notion.
export const ContexteCorrection = createContext(null)

// Correction d'une réponse. « Pourquoi ? » se déplie dessous : à quelle notion
// correspond la proposition choisie à tort (`choisi`), et un lien vers le
// chapitre du cours (ouvert à côté, pour ne pas perdre la série). `themeId`
// remplace le thème du contexte (modes qui mélangent les thèmes).
export function Feedback({ ok, children, choisi, themeId }) {
  const t = useT()
  const ctx = useContext(ContexteCorrection)
  const tid = themeId || ctx?.themeId
  const theme = tid ? ALL_CHAPTERS[tid] : null
  const notion = !ok && choisi && theme ? notionDuChoix(tid, choisi) : null
  const idx = notion?.idx ?? (themeId && themeId !== ctx?.themeId ? null : ctx?.idx)
  const lien = theme?.subjectId ? `#/subject/${theme.subjectId}/theme/${tid}${idx != null ? `/chapter/${idx}` : ''}` : null
  return (
    <div
      className={`mt-3 animate-slide-up rounded-xl px-4 py-3 text-sm ${
        ok
          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/60'
          : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800/60'
      }`}
      role="status"
    >
      <span className="mr-1 font-bold"><span className="pop-badge mr-1">{ok ? '✅' : '❌'}</span>{ok ? t('feedbackGood') : t('feedbackBad')}</span>
      {children}
      {(notion || lien) && (
        <details className="mt-2 border-t border-black/10 pt-2 dark:border-white/10">
          <summary className="cursor-pointer select-none font-semibold">Pourquoi ?</summary>
          {notion && (
            <p className="mt-1">
              {notion.est === 'definition'
                ? `« ${choisi} » : c’est la définition de « ${notion.term} », une autre notion du cours.`
                : `« ${notion.term} » est une autre notion du cours : ${notion.def}`}
            </p>
          )}
          {lien && <a href={lien} target="_blank" rel="noopener" className="mt-1 inline-block font-semibold underline underline-offset-2">{idx != null ? 'Revoir ce chapitre du cours' : 'Revoir le cours du thème'} ↗</a>}
        </details>
      )}
    </div>
  )
}

// Barre de progression « question i / n » d'un jeu.
export function GameProgress({ index, total, color }) {
  const t = useT()
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>{t('question')} {Math.min(index + 1, total)} / {total}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(index / total) * 100}%`, backgroundColor: color || '#7c3aed' }}
        />
      </div>
    </div>
  )
}
