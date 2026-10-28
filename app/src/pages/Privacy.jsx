import TexteRiche from '../components/TexteRiche.jsx'
import LegalContents from '../components/LegalContents.jsx'
import { Link } from 'react-router-dom'
import { MESURE_ACTIVE } from '../mesure.js'
import { useLang, usePublicText } from '../i18n.js'

// Politique de confidentialité & RGPD. Rédigée en français : l'outil s'adresse à
// des lycées français. Accessible depuis « Mon espace », le pied de page et
// l'inscription. Dernière mise à jour : octobre 2026.
export default function Privacy() {
  const lang = useLang()
  const tr = usePublicText()
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="page-hero page-hero-compact">
        <p className="kicker"><TexteRiche texte={"RévizSTMG"} /></p>
        <h1 className="font-display text-3xl font-medium leading-tight"><TexteRiche texte={"Confidentialité & protection des données"} /></h1>
        {lang !== 'fr' && <p role="note" className="mt-2 text-sm">{tr('Texte juridique : seule la version française de cette page fait foi.')}</p>}
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400"><TexteRiche texte={"Dernière mise à jour : octobre 2026 · Conforme au RGPD (règlement UE 2016/679) et à la loi « Informatique et Libertés »"} /></p>
      </header>
      <hr className="rule-gold" /><LegalContents />

      <p className="text-sm text-slate-600 dark:text-slate-300"><TexteRiche texte={"RévizSTMG est un outil de révision gamifié pour les élèves de STMG. Nous appliquons le principe de **minimisation** : nous ne collectons que les données strictement nécessaires, jamais à des fins publicitaires. **Aucune donnée n'est vendue, louée ou cédée**, et il n'y a **ni publicité, ni cookie de mesure d'audience, ni profilage commercial**. Cette page explique quelles données sont traitées, pourquoi, et comment tu gardes le contrôle."} /></p>

      <Section title="1. Responsable du traitement">
        <p><TexteRiche texte={"RévizSTMG est édité par **Matys DONAT** et **Gabriel MERLIN**, responsables conjoints du traitement. Pour toute question relative à tes données ou pour exercer tes droits, écris à  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]."} /></p>
      </Section>

      <Section title="2. Données traitées">
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"**Identité & compte** : prénom, nom, adresse e-mail, mot de passe (stocké **haché**, jamais en clair)."} /></li>
          <li><TexteRiche texte={"**Photo de profil** : facultative, réduite localement avant envoi."} /></li>
          <li><TexteRiche texte={"**Scolarité** : niveau, spécialité, éventuel code de classe."} /></li>
          <li><TexteRiche texte={"**Progression pédagogique** : XP, scores, badges, favoris, séries, temps de révision, historique."} /></li>
          <li><TexteRiche texte={"**Notes de classe** que tu saisis dans « Mes notes de classe » (note, matière, chapitre, date) : sauvegardées avec ta progression, visibles par toi seul (ni ta classe, ni ton professeur, ni l'espace parent)."} /></li>
          <li><TexteRiche texte={"**Contributions** : QCM créés, messages de classe, réponses partagées avec ta classe."} /></li>
          <li><TexteRiche texte={"**Photos de cours** envoyées à la « fiche par photo » : analysées pour créer la fiche, elles ne sont **pas conservées** par RévizSTMG."} /></li>
          <li><TexteRiche texte={"**Aides et exercices générés par IA dans les chapitres** (« Créer ma série », « Créer une question », « Questions type de contrôle », tuteur de cours « Envoyer au tuteur »), « Excellence économique » et « Demande de révision » : uniquement quand tu les demandes, le cours, tes questions, ton texte ou ta réponse sont envoyés à un fournisseur d’IA. Pour une demande de révision, cela inclut les fichiers ou photos que tu choisis. Le site n’ajoute pas ton identité à la demande : masque les données personnelles présentes dans tes fichiers. RévizSTMG ne conserve pas ces échanges. Un plafond local de 60 demandes par jour et par appareil limite les clics répétés ; le serveur applique aussi ses propres limites."} /></li>
          <li><TexteRiche texte={"**Examens blancs personnalisés** : la demande et les extraits de cours sont envoyés au fournisseur d’IA pour créer le sujet. Avec ton accord distinct, le PDF ou les photos de ta copie sont transmis à Gemini pour une correction indicative. RévizSTMG ne conserve pas ces fichiers ; le sujet et le bilan sont enregistrés uniquement sur ton appareil, pour ton compte."} /></li>
          <li><TexteRiche texte={"**Signalements d'erreurs** (bouton « Signaler une erreur ») : ton message, la page concernée et, si tu es connecté, l'identifiant de ton compte (pour limiter les abus)."} /></li>
          <li><TexteRiche texte={"**Rappel de révision sur le téléphone**, seulement si tu l'actives avec un compte : l'adresse d'abonnement fournie par ton navigateur, l'heure choisie et ton fuseau horaire."} /></li>
          <li><TexteRiche texte={"**Données techniques minimales** : celles nécessaires au bon fonctionnement et à la sécurité (journalisation technique par notre hébergeur). Nous n'utilisons **aucun cookie publicitaire**."} /></li>
        </ul>
      </Section>

      <Section title="3. Finalités &amp; bases légales">
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"**Fournir le service** (compte, sauvegarde et synchronisation de la progression, espace classe) — base légale : **exécution du contrat** / mesures précontractuelles."} /></li>
          <li><TexteRiche texte={"**Sécurité et prévention des abus** — base légale : **intérêt légitime**."} /></li>
          <li><TexteRiche texte={"**Éléments facultatifs** (photo, rappels, notifications) — base légale : **ton consentement**, retirable à tout moment."} /></li>
        </ul>
      </Section>

      <Section title="4. Cookies et stockage sur ton appareil">
        <p><TexteRiche texte={"RévizSTMG ne dépose **aucun cookie publicitaire ni cookie de mesure d'audience**. Ton navigateur garde sur ton appareil (stockage local) ce qui fait fonctionner l'application : ta progression, ta session de connexion, tes préférences (thème, langue, affichage), tes notes et tes paquets de flashcards. Ta progression est en plus sauvegardée dans ton compte, pour la retrouver sur un autre appareil. Pour fusionner sans perte ce que tu fais sur plusieurs appareils, chacun reçoit un numéro tiré au hasard, enregistré avec ta progression : il ne dit rien de ton appareil. En **essai sans compte**, ta progression reste sur ton appareil jusqu’à la création d’un compte. Les appels techniques décrits ci-dessous (dont la traduction si tu l’utilises) restent possibles. Ce stockage est strictement nécessaire au service : il ne demande pas de consentement (article 82 de la loi « Informatique et Libertés »). Il disparaît si tu effaces les données du site."} /></p>
        {MESURE_ACTIVE && (
          <p><TexteRiche texte={"**Mesure d'audience anonyme.** Pour savoir quelles parties de l'application servent, chaque écran affiché ajoute 1 à un compteur du jour (par exemple « chapitre » ou « bac blanc »), conservé sur Supabase (UE). Aucun cookie, aucun identifiant, aucune adresse IP ni information sur ton appareil n'est enregistré : on ne peut pas savoir qui a vu quoi. Si ton navigateur demande à ne pas être suivi (« Do Not Track », « Global Privacy Control »), rien n'est compté."} /></p>
        )}
      </Section>

      <Section title="5. Hébergement, localisation &amp; sous-traitants">
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"**Supabase** (serveurs dans l'**Union européenne**, région de Paris) : comptes, progression, espaces partagés, et envoi des e-mails du service (confirmation d'inscription, nouveau mot de passe)."} /></li>
          <li><TexteRiche texte={"**GitHub** (États-Unis) héberge le site : comme tout hébergeur, il reçoit ton adresse IP et garde des journaux techniques."} /></li>
          <li><TexteRiche texte={"**Google (Gemini)** ou **Anthropic (Claude)**, pour la « fiche par photo », la création d’examens blancs et les aides générées par IA dans les chapitres (séries d’exercices, questions de contrôle, tuteur de cours) : la photo, la demande ou les extraits de cours sont transmis pour analyse. La correction de copie utilise Google (Gemini), après ton accord pour chaque envoi de PDF ou de photos. Avec l'offre gratuite de Gemini, Google peut utiliser les contenus reçus pour améliorer ses services : masque ton nom et tes coordonnées avant tout envoi de photo ou de copie."} /></li>
          <li><TexteRiche texte={"**MyMemory** (Translated, Italie) traduit les textes publics qui ne sont pas déjà disponibles dans la langue choisie. Les modèles d’interface sont envoyés sans les noms, messages ni valeurs des champs : les données variables sont ajoutées sur ton appareil. Si tu utilises le dictionnaire, le texte que tu demandes volontairement de traduire est envoyé au service ; n’y saisis pas d’informations personnelles. Comme pour toute requête réseau, le prestataire reçoit techniquement l’adresse IP de la connexion. Les résultats sont mémorisés sur ton appareil."} /></li>
          <li><TexteRiche texte={"**Le service de notification de ton navigateur** (Google pour Chrome et Android, Apple pour Safari et l'iPhone, Mozilla pour Firefox), seulement si tu actives le rappel envoyé même quand l’application est fermée : il achemine le rappel, qui ne contient aucune donnée (le texte affiché est toujours le même)."} /></li>
          <li><TexteRiche texte={"**Cloudflare** (cdnjs), seulement si tu lis le texte d'une photo sur ton appareil : le module de lecture est téléchargé depuis ce service."} /></li>
        </ul>
        <p><TexteRiche texte={"Ces prestataires traitent les données pour notre compte. Ceux qui sont situés aux États-Unis encadrent ces transferts par leurs propres engagements contractuels de protection des données."} /></p>
      </Section>

      <Section title="6. Visibilité au sein de ta classe">
        <p><TexteRiche texte={"Si tu rejoins une classe, un défi entre amis, le classement ou l'espace parent, ton **prénom, ta photo et tes scores** sont partagés (classement, entraide, QCM). Ton **adresse e-mail n'est jamais montrée**. Tu peux quitter une classe à tout moment. Le suivi parent n'est actif que si tu l'actives dans « Mon espace » ; le désactiver efface ce qui avait été partagé."} /></p>
        <p><TexteRiche texte={"Les espaces partagés sont protégés par les règles d’accès de la base. Selon l’espace, l’accès dépend de ton compte, de ton rôle, de ta classe ou du code que tu partages. Utilise un prénom ou un surnom ; la photo est facultative."} /></p>
      </Section>

      <Section title="7. Durée de conservation">
        <p><TexteRiche texte={"Tes données sont conservées **tant que ton compte existe**. Un compte resté **inactif plus de 24 mois** peut être supprimé après information."} /></p>
        <p><TexteRiche texte={"Quand tu supprimes ton compte (« Supprimer mon compte » dans [[Mon espace|/moi]]), tout est **effacé aussitôt** : ton compte de connexion et ton **adresse e-mail**, ta progression, tes notes et tes notes de classe, ta classe et tes contributions, tes amis et tes duels, le suivi parent, tes signalements d'erreurs, ton abonnement au rappel téléphone, et tout ce que l'application gardait sur l'appareil où tu fais la suppression. Le code du site, publié sur GitHub, ne contient aucune donnée d'élève."} /></p>
        <p><TexteRiche texte={"Il ne reste, pour une durée limitée, que ce qui échappe à l'application : les journaux techniques et sauvegardes de l'hébergeur (Supabase), effacés à leur rotation ; les e-mails que tu nous aurais écrits, que nous supprimons sur demande ; et la copie locale gardée par un autre appareil où tu étais connecté, jusqu'à ce que tu t'y déconnectes ou effaces les données du site."} /></p>
        <p><TexteRiche texte={"L'abonnement au rappel téléphone est aussi désactivé dès que tu arrêtes le rappel ou que tu te déconnectes. Les signalements d'erreurs sont gardés le temps de corriger le contenu."} /></p>
      </Section>

      <Section title="8. Sécurité">
        <p>Les échanges sont <b>chiffrés en transit (HTTPS)</b>. Ton compte et ta progression sauvegardée sont
        protégés par des règles de sécurité au niveau des lignes (<i>Row Level Security</i>) : <b>toi seul</b> y as
        accès. Les mots de passe sont <b>hachés</b>. Pour les espaces partagés, voir la partie 6.</p>
      </Section>

      <Section title="9. Tes droits">
        <p><TexteRiche texte={"Conformément au RGPD, tu disposes des droits d'**accès**, de **rectification**, d'**effacement**, de **limitation**, de **portabilité** et d'**opposition**, ainsi que du droit de **retirer ton consentement** à tout moment. En pratique :"} /></p>
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"**Accéder / rectifier** tes informations depuis « Mon espace » (profil et paramètres)."} /></li>
          <li><TexteRiche texte={"**Supprimer ton compte et tes données** depuis [[Mon espace|/moi]] (bouton « Supprimer mon compte »)."} /></li>
          <li><TexteRiche texte={"**Télécharger tes données** depuis [[Mon espace|/moi]] (bouton « Télécharger mes données »)."} /></li>
          <li><TexteRiche texte={"**Exercer un autre droit** : écris à [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]."} /></li>
        </ul>
        <p>Nous répondons dans un délai maximal d'<b>un mois</b>. Tu peux aussi introduire une réclamation auprès
        de la <b>CNIL</b> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#84671b] underline dark:text-[#d9bd77]">www.cnil.fr</a>).</p>
      </Section>

      <Section title="10. Élèves mineurs">
        <p><TexteRiche texte={"RévizSTMG s'utilise dans un **cadre scolaire**. Pour un élève mineur, l'utilisation suppose l'accord de l'**établissement** et/ou du **représentant légal**. L'inscription ne demande que les informations nécessaires, et un parent peut à tout moment demander l'accès ou la suppression des données de son enfant via l'adresse de contact."} /></p>
      </Section>

      <Section title="11. Modifications de cette politique">
        <p><TexteRiche texte={"Cette politique peut évoluer (nouvelle fonctionnalité, obligation légale). En cas de changement important, nous en informons les utilisateurs dans l'application. La date de dernière mise à jour figure en haut de cette page."} /></p>
      </Section>

      <Section title="12. Contact">
        <p><TexteRiche texte={"Une question, une demande, un doute ? Écris à  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]  ou parles-en à ton professeur. RévizSTMG est créé par **Matys DONAT** et **Gabriel MERLIN**."} /></p>
      </Section>

      <div className="pt-2">
        <Link to="/accueil" className="lien-retour">← Retour à l’accueil</Link>
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
