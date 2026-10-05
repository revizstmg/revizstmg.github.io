import { Link } from 'react-router-dom'
import { MESURE_ACTIVE } from '../mesure.js'

// Politique de confidentialité & RGPD. Rédigée en français : l'outil s'adresse à
// des lycées français. Accessible depuis « Mon espace », le pied de page et
// l'inscription. Dernière mise à jour : octobre 2026.
export default function Privacy() {
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header>
        <p className="kicker">RévizSTMG</p>
        <h1 className="font-display text-3xl font-medium leading-tight">Confidentialité &amp; protection des données</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Dernière mise à jour : octobre 2026 · Conforme au RGPD (règlement UE 2016/679) et à la loi « Informatique et Libertés »</p>
      </header>
      <hr className="rule-gold" />

      <p className="text-sm text-slate-600 dark:text-slate-300">
        RévizSTMG est un outil de révision gamifié pour les élèves de STMG. Nous appliquons le principe de
        <b> minimisation</b> : nous ne collectons que les données strictement nécessaires, jamais à des fins
        publicitaires. <b>Aucune donnée n'est vendue, louée ou cédée</b>, et il n'y a <b>ni publicité, ni
        cookie de mesure d'audience, ni profilage commercial</b>. Cette page explique quelles données sont traitées, pourquoi,
        et comment tu gardes le contrôle.
      </p>

      <Section title="1. Responsable du traitement">
        <p>RévizSTMG est édité par <b>Matys DONAT</b> et <b>Gabriel MERLIN</b>, responsables conjoints du
        traitement. Pour toute question relative à tes données ou pour exercer tes droits, écris à{' '}
        <a href="mailto:revizstmg@gmail.com" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">revizstmg@gmail.com</a>.</p>
      </Section>

      <Section title="2. Données traitées">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Identité &amp; compte</b> : prénom, nom, adresse e-mail, mot de passe (stocké <b>haché</b>, jamais en clair).</li>
          <li><b>Photo de profil</b> : facultative, réduite localement avant envoi.</li>
          <li><b>Scolarité</b> : niveau, spécialité, éventuel code de classe.</li>
          <li><b>Progression pédagogique</b> : XP, scores, badges, favoris, séries, temps de révision, historique.</li>
          <li><b>Contributions</b> : QCM créés, messages de classe, réponses partagées avec ta classe.</li>
          <li><b>Photos de cours</b> envoyées à la « fiche par photo » : analysées pour créer la fiche, elles ne sont
          <b> pas conservées</b> par RévizSTMG.</li>
          <li><b>Données techniques minimales</b> : celles nécessaires au bon fonctionnement et à la sécurité
          (journalisation technique par notre hébergeur). Nous n'utilisons <b>aucun cookie publicitaire</b>.</li>
        </ul>
      </Section>

      <Section title="3. Finalités &amp; bases légales">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Fournir le service</b> (compte, sauvegarde et synchronisation de la progression, espace classe) — base légale : <b>exécution du contrat</b> / mesures précontractuelles.</li>
          <li><b>Sécurité et prévention des abus</b> — base légale : <b>intérêt légitime</b>.</li>
          <li><b>Éléments facultatifs</b> (photo, rappels, notifications) — base légale : <b>ton consentement</b>, retirable à tout moment.</li>
        </ul>
      </Section>

      <Section title="4. Cookies et stockage sur ton appareil">
        <p>RévizSTMG ne dépose <b>aucun cookie publicitaire ni cookie de mesure d'audience</b>. Ton navigateur
        garde sur ton appareil (stockage local) ce qui fait fonctionner l'application : ta progression, ta
        session de connexion, tes préférences (thème, langue, affichage), tes notes et tes paquets de flashcards.
        Ta progression est en plus sauvegardée dans ton compte, pour la retrouver sur un autre appareil. Ce
        stockage est strictement nécessaire au service : il ne demande
        pas de consentement (article 82 de la loi « Informatique et Libertés »). Il disparaît si tu effaces les
        données du site.</p>
        {MESURE_ACTIVE && (
          <p><b>Mesure d'audience anonyme.</b> Pour savoir quelles parties de l'application servent, chaque écran
          affiché ajoute 1 à un compteur du jour (par exemple « chapitre » ou « bac blanc »), conservé sur Supabase
          (UE). Aucun cookie, aucun identifiant, aucune adresse IP ni information sur ton appareil n'est enregistré :
          on ne peut pas savoir qui a vu quoi. Si ton navigateur demande à ne pas être suivi (« Do Not Track »,
          « Global Privacy Control »), rien n'est compté.</p>
        )}
      </Section>

      <Section title="5. Hébergement, localisation &amp; sous-traitants">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Supabase</b> (serveurs dans l'<b>Union européenne</b>, région de Paris) : comptes, progression,
          espaces partagés, et envoi des e-mails du service (confirmation d'inscription, nouveau mot de passe).</li>
          <li><b>GitHub</b> (États-Unis) héberge le site : comme tout hébergeur, il reçoit ton adresse IP et garde
          des journaux techniques.</li>
          <li><b>Google (Gemini)</b> ou <b>Anthropic (Claude)</b>, seulement si tu utilises la « fiche par photo » :
          la photo leur est envoyée pour analyse. Avec l'offre gratuite de Gemini, Google peut utiliser les contenus
          reçus pour améliorer ses services : n'envoie pas de photo qui contient des informations personnelles.</li>
          <li><b>MyMemory</b> (Translated, Italie), seulement si l'interface est dans une autre langue que le
          français : les textes de l'application lui sont envoyés pour être traduits, pas tes données.</li>
          <li><b>Cloudflare</b> (cdnjs), seulement si tu lis le texte d'une photo sur ton appareil : le module de
          lecture est téléchargé depuis ce service.</li>
        </ul>
        <p>Ces prestataires traitent les données pour notre compte. Ceux qui sont situés aux États-Unis encadrent
        ces transferts par leurs propres engagements contractuels de protection des données.</p>
      </Section>

      <Section title="6. Visibilité au sein de ta classe">
        <p>Si tu rejoins une classe, un défi entre amis, le classement ou l'espace parent, ton <b>prénom, ta
        photo et tes scores</b> sont partagés (classement, entraide, QCM). Ton <b>adresse e-mail n'est jamais
        montrée</b>. Tu peux quitter une classe à tout moment.</p>
        <p>Les règles qui protègent ces espaces partagés doivent encore être renforcées : aujourd'hui, ces
        informations peuvent être lues par d'autres utilisateurs de l'application que ta classe. N'y mets rien de
        sensible (utilise un prénom ou un surnom, la photo est facultative).</p>
      </Section>

      <Section title="7. Durée de conservation">
        <p>Tes données sont conservées <b>tant que ton compte existe</b>. Un compte resté <b>inactif plus de
        24 mois</b> peut être supprimé après information. À la suppression du compte, tes données personnelles
        sont <b>effacées</b> (des sauvegardes techniques transitoires peuvent subsister quelques jours avant
        rotation).</p>
      </Section>

      <Section title="8. Sécurité">
        <p>Les échanges sont <b>chiffrés en transit (HTTPS)</b>. Ton compte et ta progression sauvegardée sont
        protégés par des règles de sécurité au niveau des lignes (<i>Row Level Security</i>) : <b>toi seul</b> y as
        accès. Les mots de passe sont <b>hachés</b>. Pour les espaces partagés, voir la partie 6.</p>
      </Section>

      <Section title="9. Tes droits">
        <p>Conformément au RGPD, tu disposes des droits d'<b>accès</b>, de <b>rectification</b>, d'<b>effacement</b>,
        de <b>limitation</b>, de <b>portabilité</b> et d'<b>opposition</b>, ainsi que du droit de <b>retirer ton
        consentement</b> à tout moment. En pratique :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Accéder / rectifier</b> tes informations depuis « Personnaliser mon profil ».</li>
          <li><b>Supprimer ton compte et tes données</b> depuis <Link to="/moi" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">Mon espace</Link> (bouton « Supprimer mon compte »).</li>
          <li><b>Exporter</b> ta progression ou exercer un autre droit : écris à <a href="mailto:revizstmg@gmail.com" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">revizstmg@gmail.com</a>.</li>
        </ul>
        <p>Nous répondons dans un délai maximal d'<b>un mois</b>. Tu peux aussi introduire une réclamation auprès
        de la <b>CNIL</b> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">www.cnil.fr</a>).</p>
      </Section>

      <Section title="10. Élèves mineurs">
        <p>RévizSTMG s'utilise dans un <b>cadre scolaire</b>. Pour un élève mineur, l'utilisation suppose l'accord
        de l'<b>établissement</b> et/ou du <b>représentant légal</b>. L'inscription ne demande que les informations
        nécessaires, et un parent peut à tout moment demander l'accès ou la suppression des données de son enfant
        via l'adresse de contact.</p>
      </Section>

      <Section title="11. Modifications de cette politique">
        <p>Cette politique peut évoluer (nouvelle fonctionnalité, obligation légale). En cas de changement
        important, nous en informons les utilisateurs dans l'application. La date de dernière mise à jour figure
        en haut de cette page.</p>
      </Section>

      <Section title="12. Contact">
        <p>Une question, une demande, un doute ? Écris à{' '}
        <a href="mailto:revizstmg@gmail.com" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">revizstmg@gmail.com</a>{' '}
        ou parles-en à ton professeur. RévizSTMG est créé par <b>Matys DONAT</b> et <b>Gabriel MERLIN</b>.</p>
      </Section>

      <div className="pt-2">
        <Link to="/accueil" className="btn-ghost !min-h-0 !py-2 text-sm">← Retour</Link>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-2 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}
