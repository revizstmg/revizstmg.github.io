import LevelToolNotice from '../components/LevelToolNotice.jsx'
import { TextePublic } from '../localisation/PublicText.jsx'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import ETUDE_GESTION from '../../content/commun/etude-gestion.json'
import { SUBJECTS } from '../data/index.js'
import { Rich } from '../components/ui.jsx'
import { useT } from '../i18n.js'
import {
  CHAMP, ETIQUETTE, LIEN, Pli, Detail, Onglets, OngletSources, OngletAnalyse, OngletArguments,
  noteGlobale, virgule, analyseTexte, argumentsTexte, sourcesTexte, aDuContenu, telecharger,
} from '../components/DossierProjet.jsx'

// Étude de gestion (Première STMG) : un espace qui accompagne le projet de bout en
// bout — les consignes (content/commun/etude-gestion.json), les sources de
// l'élève, l'analyse de son organisation (caractérisation, diagnostic, PESTEL),
// puis ses arguments construits avec la méthode A-E-I et évalués avec une grille.
// Tout est sauvegardé avec la progression (state.etudeGestion). Pour ne pas noyer
// l'élève sous le texte, chaque bloc est replié : on n'affiche que son titre, et
// il se déploie quand on appuie dessus. Les briques sont partagées avec le Grand
// Oral (components/DossierProjet.jsx).
const CONTENU = ETUDE_GESTION
const GRILLE = CONTENU.aei.grille
const ONGLETS = [
  { id: 'consignes', icon: '📋', labelKey: 'egTabRules' },
  { id: 'sources', icon: '📚', labelKey: 'egTabSources' },
  { id: 'analyse', icon: '🔍', labelKey: 'egTabAnalysis' },
  { id: 'arguments', icon: '🧩', labelKey: 'egTabArguments' },
]

// Le dossier en texte brut : problématique, analyse, arguments A-E-I et sources.
export function dossierTexte(eg) {
  const sources = eg.sources || []
  const args = eg.arguments || []
  const lignes = ['ÉTUDE DE GESTION', '']
  if (eg.theme) lignes.push(`Thème : ${eg.theme}`)
  if (eg.organisation) lignes.push(`Organisation étudiée : ${eg.organisation}`)
  if (eg.problematique) lignes.push(`Problématique : ${eg.problematique}`)
  lignes.push(...analyseTexte(eg.analyse))
  lignes.push('', 'ARGUMENTS (méthode A-E-I)', ...argumentsTexte(args, sources, GRILLE))
  if (args.length) lignes.push('', `Note de mes arguments (auto-évaluation) : ${virgule(noteGlobale(args, sources, GRILLE))}/20`)
  lignes.push(...sourcesTexte(sources))
  return lignes.join('\n') + '\n'
}

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage.
export default function EtudeGestion() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <EtudeGestionPage />
}

function EtudeGestionPage() {
  const { state, setEtudeGestion } = useStore()
  const t = useT()
  const [onglet, setOnglet] = useState('consignes')
  const eg = state.etudeGestion || {}
  const nb = { sources: (eg.sources || []).length, arguments: (eg.arguments || []).length }

  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <LevelToolNotice level="premiere-stmg">
      <header className="page-hero text-center">
        <p className="kicker">🔎 {t('egTitle')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('egTitle')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400"><TextePublic text={CONTENU.intro} /></p>
      </header>

      <Onglets onglets={ONGLETS.map((o) => ({ ...o, label: t(o.labelKey) }))} actif={onglet} choisir={setOnglet} label={t('egTitle')} nb={nb} />

      {onglet === 'consignes' && <Consignes eg={eg} maj={setEtudeGestion} />}
      {onglet === 'sources' && <OngletSources d={eg} maj={setEtudeGestion} />}
      {onglet === 'analyse' && <OngletAnalyse d={eg} maj={setEtudeGestion} />}
      {onglet === 'arguments' && (
        <OngletArguments d={eg} maj={setEtudeGestion} grille={GRILLE} aei={CONTENU.aei} versSources={() => setOnglet('sources')}
          notion={{ label: 'Notion du cours utilisée', exemple: 'Ex. : valeur ajoutée, risque…' }}
          entete={(
            <section className="card p-4" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 35%, transparent)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ma problématique</p>
              <p className="mt-1 font-display text-lg">{eg.problematique || 'À écrire dans l’onglet « Consignes ».'}</p>
            </section>
          )} />
      )}

      {aDuContenu(eg) && (
        <button onClick={() => telecharger('etude-de-gestion.txt', dossierTexte(eg))} className="btn-gold w-full !py-3">⬇️ {t('egDownload')}</button>
      )}
      </LevelToolNotice>
    </div>
  )
}

// ---- 1. Consignes -------------------------------------------------------------
function Consignes({ eg, maj }) {
  const themes = SUBJECTS.find((s) => s.id === 'p1-sgn')?.chapters || []
  const coches = eg.coches || {}
  const faits = CONTENU.dossier.filter((d) => coches[d.id]).length
  return (
    <div className="space-y-3">
      <Pli icon="🎯" titre="Mon projet" sous={eg.organisation || 'Thème, organisation, problématique'} initial>
        <div className="space-y-3">
          <label className="block">
            <span className={ETIQUETTE}>Thème du programme</span>
            <select value={eg.theme || ''} onChange={(e) => maj({ theme: e.target.value })} className={CHAMP}>
              <option value="">Choisis un thème…</option>
              {themes.map((th) => <option key={th.id} value={th.name}><TextePublic text={th.name} /></option>)}
            </select>
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Organisation étudiée</span>
            <input value={eg.organisation || ''} onChange={(e) => maj({ organisation: e.target.value })} placeholder="Ex. : la boulangerie de mon quartier" className={CHAMP} maxLength={160} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Ma problématique</span>
            <textarea value={eg.problematique || ''} onChange={(e) => maj({ problematique: e.target.value })} rows={3} placeholder="Une question précise, tirée du programme." className={CHAMP} maxLength={400} />
          </label>
          {eg.problematique && !eg.problematique.trim().endsWith('?') && (
            <p className="text-xs text-amber-700 dark:text-amber-300">💡 Termine ta problématique par un point d'interrogation.</p>
          )}
        </div>
      </Pli>

      <Pli icon="📏" titre="Les règles" sous={`${CONTENU.regles.length} règles officielles`}>
        <div className="space-y-2">
          {CONTENU.regles.map((r) => <Detail key={r.h} titre={<TextePublic text={r.h} />}><Rich translate text={r.c} /></Detail>)}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Le calendrier et la forme exacte sont fixés par ton professeur.</p>
      </Pli>

      <Pli icon="🧭" titre="La démarche" sous={`${CONTENU.demarche.length} étapes`}>
        <div className="space-y-2">
          {CONTENU.demarche.map((d, k) => <Detail key={d.h} repere={k + 1} titre={<TextePublic text={d.h} />}><TextePublic text={d.c} /></Detail>)}
        </div>
      </Pli>

      <Pli icon="✅" titre="Mon dossier" sous={`${faits} / ${CONTENU.dossier.length} parties prêtes`}>
        <div className="space-y-1">
          {CONTENU.dossier.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input type="checkbox" checked={!!coches[d.id]} onChange={(e) => maj((x) => ({ ...x, coches: { ...(x.coches || {}), [d.id]: e.target.checked } }))} className="h-4 w-4" style={{ accentColor: 'var(--c-accent-fort)' }} />
              <span className="text-sm"><TextePublic text={d.label} /></span>
            </label>
          ))}
        </div>
      </Pli>

      <Pli icon="💡" titre="Les conseils" sous={`${CONTENU.conseils.length} conseils`}>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {CONTENU.conseils.map((c) => <li key={c}><TextePublic text={c} /></li>)}
        </ul>
      </Pli>

      {themes.length > 0 && (
        <Pli icon="📖" titre="Revoir le cours" sous={`${themes.length} thèmes`}>
          <div className="grid gap-2">
            {themes.map((th) => (
              <Link key={th.id} to={`/subject/p1-sgn/theme/${th.id}`} className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"><TextePublic text={th.name} /> ›</Link>
            ))}
          </div>
        </Pli>
      )}

      <Pli icon="📜" titre="Textes officiels" sous={`${CONTENU.references.length} textes`}>
        <ul className="space-y-2 text-sm">
          {CONTENU.references.map((r) => (
            <li key={r.lien}><a href={r.lien} target="_blank" rel="noopener noreferrer" className="underline" style={LIEN}><TextePublic text={r.titre} /></a></li>
          ))}
        </ul>
      </Pli>
    </div>
  )
}
