import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { fetchMembers } from '../classroom.js'
import { todayKey, daysBetween } from '../data/srs.js'

// Accueil du professeur : ses classes et les élèves à relancer, plutôt que
// l'accueil d'un élève (séance, série, boutique…). Le détail de chaque classe
// reste dans l'espace classe (tableau de bord, groupes, quiz, direct).
const INACTIF = 7 // jours sans activité

function resumeClasse(membres, jour) {
  const eleves = (membres || []).filter((m) => m.role !== 'prof')
  const depuis = (m) => (m.active_day ? daysBetween(m.active_day, jour) : Infinity)
  return {
    eleves: eleves.length,
    actifs: eleves.filter((m) => depuis(m) < INACTIF).length,
    aRelancer: eleves.filter((m) => depuis(m) >= INACTIF || m.courses_week === 0).length,
  }
}

function CarteClasse({ classe, active, ouvrir }) {
  const [resume, setResume] = useState(null)
  const [erreur, setErreur] = useState(false)
  useEffect(() => {
    let vivant = true
    fetchMembers(classe.code).then((m) => { if (vivant) setResume(resumeClasse(m, todayKey())) }).catch(() => { if (vivant) setErreur(true) })
    return () => { vivant = false }
  }, [classe.code])
  return (
    <li className="card flex flex-wrap items-center gap-3 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 16%, transparent)' }} aria-hidden>🧑‍🏫</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display font-semibold leading-tight">{classe.label}{active && <span className="ms-2 text-xs font-normal text-slate-400">· classe ouverte</span>}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          Code <span className="font-mono font-semibold" translate="no">{classe.code}</span>
          {resume && <> · {resume.eleves > 1 ? `${resume.eleves} élèves` : `${resume.eleves} élève`} · {resume.actifs > 1 ? `${resume.actifs} actifs cette semaine` : `${resume.actifs} actif cette semaine`}</>}
          {erreur && ' · élèves indisponibles hors connexion'}
        </span>
        {resume?.aRelancer > 0 && <span className="mt-1 block text-xs font-semibold text-rose-600 dark:text-rose-400">{resume.aRelancer > 1 ? `${resume.aRelancer} élèves à relancer` : 'Un élève à relancer'}</span>}
      </span>
      <button onClick={ouvrir} className="btn-primary shrink-0 !py-2 text-sm" style={{ backgroundColor: 'var(--c-accent-fort)' }}>Ouvrir la classe</button>
    </li>
  )
}

export default function AccueilProf() {
  const { state, setClassCode } = useStore()
  const navigate = useNavigate()
  const classes = state.teacherClasses || []
  const prenom = state.profile?.firstName?.trim() || ''
  const ouvrir = (code) => { setClassCode(code); navigate('/classe') }
  return (
    <div className="animate-lux space-y-6">
      <section className="card-lux relative overflow-hidden rounded-[1.6rem] p-6 text-[#f4ecd8] sm:p-8" style={{ background: 'linear-gradient(140deg, color-mix(in srgb, var(--c-accent) 14%, #17130d) 0%, #221d15 55%, #17130d 100%)' }}>
        <p className="kicker" style={{ color: 'color-mix(in srgb, var(--c-accent) 62%, #fff)' }}>Espace professeur</p>
        <h1 className="font-display text-[1.7rem] font-medium leading-tight text-[#faf3e1] sm:text-[2.1rem]">Bonjour{prenom ? `, ${prenom}` : ''}</h1>
        <p className="mt-2 max-w-prose text-sm text-[#d8cca8]">Suivez vos classes, repérez les élèves à relancer et préparez un quiz à projeter.</p>
      </section>

      <section aria-labelledby="titre-classes" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 id="titre-classes" className="font-display text-lg font-semibold">Mes classes</h2>
          <Link to="/classe" className="text-xs font-semibold text-[var(--c-accent-texte)] hover:underline">Gérer les classes →</Link>
        </div>
        {classes.length ? (
          <ul className="space-y-2.5">
            {classes.map((c) => <CarteClasse key={c.code} classe={c} active={c.code === state.classCode} ouvrir={() => ouvrir(c.code)} />)}
          </ul>
        ) : (
          <div className="card space-y-2 p-5 text-sm text-slate-500 dark:text-slate-400">
            <p>Aucune classe pour l’instant.</p>
            <Link to="/classe" className="inline-block font-semibold text-[var(--c-accent-texte)] underline">Créer une classe et donner son code aux élèves</Link>
          </div>
        )}
      </section>

      <section aria-labelledby="titre-outils-prof" className="space-y-3">
        <h2 id="titre-outils-prof" className="px-1 font-display text-lg font-semibold">En classe</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/classe" className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-xl" aria-hidden>📊</span><span className="mt-1 block font-semibold">Tableau de bord</span><span className="block text-xs text-slate-500 dark:text-slate-400">Activité et niveau par matière</span></Link>
          <Link to="/classe" className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-xl" aria-hidden>📝</span><span className="mt-1 block font-semibold">Quiz et direct</span><span className="block text-xs text-slate-500 dark:text-slate-400">Créer, assigner, projeter</span></Link>
          <Link to="/cours" className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md"><span className="text-xl" aria-hidden>📖</span><span className="mt-1 block font-semibold">Cours et exercices</span><span className="block text-xs text-slate-500 dark:text-slate-400">Ce que voient vos élèves</span></Link>
        </div>
      </section>
    </div>
  )
}
