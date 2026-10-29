import { Link, Navigate } from 'react-router-dom'
import { InstallCard } from '../components/InstallApp.jsx'
import { useInstall } from '../pwa.js'
import TexteRiche from '../components/TexteRiche.jsx'

// Guide de démarrage (élèves) — accessible depuis le pied de page et le menu.
// Rédigé en français (public : lycées français).
const SITE = 'revizstmg.github.io'

function Step({ n, title, children }) {
  return (
    <section className="card p-5">
      <div className="flex items-start gap-4">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg font-semibold"
          style={{ color: 'var(--c-accent-texte)', border: '1.5px solid color-mix(in srgb, var(--c-accent) 40%, transparent)' }}
          aria-hidden
        >
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="mb-1 font-display text-lg font-semibold">{title}</h2>
          <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function Guide() {
  const { standalone } = useInstall()
  // Le tutoriel d'installation n'a pas de sens dans l'app déjà installée.
  if (standalone) return <Navigate to="/accueil" replace />
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="page-hero page-hero-compact text-center">
        <p className="kicker">🎓 Guide de démarrage</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">Bien commencer en 5 minutes</h1>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Crée ton compte, choisis ta filière, installe l’appli — et révise le bac STMG en jouant.</p>
      </header>

      {/* Adresse du site */}
      <div className="card card-lux flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Adresse du site</p>
          <p className="font-display text-xl font-semibold" style={{ color: 'var(--c-accent-texte)' }}>{SITE}</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Ouvre-le dans ton navigateur pour commencer.</p>
      </div>

      <Step n={1} title="Va sur le site">
        <TexteRiche texte={`Ouvre **${SITE}** dans ton navigateur. Rien à télécharger pour l’instant.`} />
      </Step>

      <Step n={2} title="Crée ton compte">
        <p><TexteRiche texte="Choisis **« Créer un compte »**, saisis ton **e-mail** et un **mot de passe**." /></p>
        <p className="mt-1"><TexteRiche texte="Un e-mail de confirmation t’est envoyé : **ouvre-le et clique sur le lien** (pense à regarder dans les spams), puis reviens te connecter. Ensuite, tu restes connecté." /></p>
      </Step>

      <Step n={3} title="Choisis ta filière">
        <TexteRiche texte="**Première STMG**, ou **Terminale STMG** avec ta spécialité : Gestion & Finance, RH & Communication, Mercatique ou Systèmes d’information de gestion." />
      </Step>

      <Step n={4} title="Installe l’appli sur ton téléphone">
        <div className="mb-3"><InstallCard /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-1.5 flex items-center gap-2 font-semibold"><span aria-hidden>📱</span> iPhone</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li><TexteRiche texte="Ouvre le site dans **Safari**" /></li>
              <li><TexteRiche texte="Touche **Partager** (le carré avec la flèche ↑)" /></li>
              <li><TexteRiche texte="Choisis **« Sur l’écran d’accueil »**" /></li>
              <li><TexteRiche texte="Touche **Ajouter**" /></li>
            </ol>
            <p className="mt-2 rounded-lg px-2 py-1.5 text-xs" style={{ backgroundColor: 'color-mix(in srgb, #c8a24e 16%, transparent)', color: 'var(--c-accent-texte)' }}><TexteRiche texte="⚠️ Sur iPhone, ça marche **uniquement dans Safari** — pas dans Chrome." /></p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-1.5 flex items-center gap-2 font-semibold"><span aria-hidden>🤖</span> Android</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li><TexteRiche texte="Ouvre le site dans **Chrome**" /></li>
              <li><TexteRiche texte="Touche le menu **⋮** (en haut à droite)" /></li>
              <li><TexteRiche texte="Choisis **« Installer l’application »**" /></li>
              <li>Confirme l’installation</li>
            </ol>
            <p className="mt-2 rounded-lg px-2 py-1.5 text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 12%, transparent)' }}>💡 L’icône RévizSTMG s’ajoute à ton écran d’accueil.</p>
          </div>
        </div>
      </Step>

      <Step n={5} title="Révise partout">
        <TexteRiche texte="Une fois connecté, ta **progression se synchronise** automatiquement entre tous tes appareils. Les cours et exercices de base sont gratuits ; la révision intelligente, le bac blanc et le Grand Oral sont inclus dans Premium et Ultimate (voir les [[offres|/offres]]). Le minuteur fonctionne aussi dans le navigateur. La personnalisation du profil demande l’application installée." />
      </Step>

      {/* Code de classe */}
      <div className="card flex items-center gap-4 p-5" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 30%, transparent)' }}>
        <span className="text-3xl" aria-hidden>🔑</span>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <TexteRiche texte="**Un code de classe ?** Si ton prof t’en donne un, saisis-le dans [[Mon espace|/moi]] (« Rejoindre une classe ») pour rejoindre ta classe et suivre le classement de la semaine." />
        </p>
      </div>

      <div className="card card-lux p-5 text-center">
        <h2 className="font-display text-lg font-semibold">Une question ?</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Écris-nous, on te répond :</p>
        <a href="mailto:revizstmg@gmail.com" className="mt-2 inline-block font-semibold text-[#84671b] underline dark:text-[#d9bd77]">revizstmg@gmail.com</a>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to="/accueil" className="lien-retour">← Retour à l’accueil</Link>
        <Link to="/faq" className="btn-ghost !min-h-0 !py-2 text-sm">Foire aux questions →</Link>
      </div>
    </div>
  )
}
