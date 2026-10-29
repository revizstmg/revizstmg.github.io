import { TextePublic } from '../localisation/PublicText.jsx'
import { Link } from 'react-router-dom'
import TexteRiche from '../components/TexteRiche.jsx'

const CONTACT = 'revizstmg@gmail.com'

// Foire aux questions. Rédigée en français (public : lycées français).
export default function Faq() {
  const items = [
    ['Séance, mission, défi ou parcours ?', 'Une **séance** est un temps de révision. Une **mission** regroupe les étapes d’un chapitre. Un **défi** est un exercice avec une contrainte de temps. Un **parcours** organise les révisions sur plusieurs semaines. Le **programme** présente le calendrier. Une **série de jours** mesure la régularité ; une **série de questions** est un ensemble d’exercices.'],
    ['Le minuteur reste-t-il après un rechargement ?', 'Oui, dans le même onglet : la durée restante est conservée et le minuteur reprend en pause. Le temps passé avec le site fermé ne rapporte pas de points.'],
    ['Comment créer un compte ?', "Sur l'écran d'accueil, choisis **« Créer un compte »**, puis **Élève**, **Professeur** ou **Parent**, et remplis tes informations. Tu peux aussi **« Essayer sans compte »** : ta progression reste alors sur cet appareil. Le compte permet de la sauvegarder et de la retrouver partout."],
    ["J'ai oublié mon mot de passe.", "Sur l'écran **« Se connecter »**, clique sur **« Mot de passe oublié ? »**, entre ton adresse e‑mail : tu reçois un **code par mail**, puis tu choisis un nouveau mot de passe."],
    ['Comment rejoindre la classe de mon professeur ?', "Va dans [[Mon espace|/moi]], touche **« Rejoindre une classe »** et saisis le **code de classe** que ton professeur t'a communiqué."],
    ['Je suis professeur : comment créer une classe ?', "Crée un compte **Professeur** : un **code de classe unique** est généré automatiquement. Tu le retrouves à tout moment dans la page « Classe » de ton menu (bouton copier) et tu le partages à tes élèves. Tu peux en créer d'autres, et exclure un élève si besoin."],
    ['Ma progression est‑elle sauvegardée ?', "Oui. Elle est enregistrée sur **ton compte** : connecte‑toi et tu la retrouves sur **tous tes appareils** (téléphone, ordinateur…). Si tu essaies le site sans compte, elle reste uniquement sur cet appareil."],
    ["Comment changer ma photo ou l'apparence du site ?", "Ouvre **ton menu** (ton prénom ou ton initiale) → **« Personnaliser mon profil »** (couleurs, police, avatar, photo…). Cette fonction est réservée à l’application installée : installe RévizSTMG sur ton écran d’accueil pour l’utiliser."],
    ['Qui voit mes informations ?', "Dans ta classe, ton **prénom, ta photo et tes scores** sont visibles par tes camarades et ton professeur. Ton **e‑mail** sert uniquement à la connexion. Détails dans la [[Politique de confidentialité|/confidentialite]]."],
    ['Comment supprimer mon compte ?', "Va dans [[« Mon espace »|/moi]] → tout en bas → **« Supprimer mon compte »**. Ta progression, ta classe, tes amis, tes duels et le suivi parent sont effacés. Ton adresse e-mail de connexion est supprimée en même temps."],
    ['Le site est‑il gratuit ?', "Les cours et les exercices de base sont gratuits, sans publicité. Le reste (bac blanc, sujets, révision, Grand Oral, boutique, classement…) demande Premium (9,99 € TTC par mois ou 90 € TTC par an) ou Ultimate (14,99 € TTC par mois ou 130 € TTC par an). Si ton compte a été créé avant le 1er novembre 2026, tout reste ouvert jusqu’au 30 novembre 2026. Voir les [[offres|/offres]]."],
  ]
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="page-hero page-hero-compact">
        <p className="kicker">RévizSTMG</p>
        <h1 className="font-display text-3xl font-medium leading-tight">Foire aux questions</h1>
      </header>
      <hr className="rule-gold" />
      {items.map(([q, a], i) => (
        <section key={i} className="card p-5">
          <h2 className="mb-2 font-display text-lg font-semibold"><TextePublic text={q} /></h2>
          <p className="text-sm text-slate-600 dark:text-slate-300"><TexteRiche texte={a} /></p>
        </section>
      ))}
      <div className="card card-lux p-5 text-center">
        <h2 className="font-display text-lg font-semibold">Une autre question ?</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Écris‑nous, on te répond :</p>
        <a href={`mailto:${CONTACT}`} className="mt-2 inline-block font-semibold text-[#84671b] underline dark:text-[#d9bd77]">{CONTACT}</a>
      </div>
      <div className="pt-1">
        <Link to="/accueil" className="lien-retour">← Retour à l’accueil</Link>
      </div>
    </div>
  )
}
