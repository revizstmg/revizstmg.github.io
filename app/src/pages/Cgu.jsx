import { Link } from 'react-router-dom'

// Conditions générales d'utilisation et mentions légales. Rédigées en français,
// comme la politique de confidentialité (Privacy.jsx). Accessibles depuis le
// pied de page. Dernière mise à jour : octobre 2026.
const lien = 'font-semibold text-[#84671b] underline dark:text-[#d9bd77]'

export default function Cgu() {
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header>
        <p className="kicker">RévizSTMG</p>
        <h1 className="font-display text-3xl font-medium leading-tight">Conditions d’utilisation &amp; mentions légales</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Dernière mise à jour : octobre 2026</p>
      </header>
      <hr className="rule-gold" />

      <Section title="Mentions légales">
        <p><b>Éditeurs</b> : Matys DONAT et Gabriel MERLIN, élèves, à titre non professionnel et non commercial.
        Ils sont aussi responsables de la publication. Contact :{' '}
        <a href="mailto:revizstmg@gmail.com" className={lien}>revizstmg@gmail.com</a>.</p>
        <p><b>Hébergement du site</b> : GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco,
        CA 94107, États-Unis.</p>
        <p><b>Hébergement des comptes et de la progression</b> : Supabase, serveurs situés dans l’Union
        européenne (région de Paris).</p>
      </Section>

      <Section title="1. Objet">
        <p>Ces conditions encadrent l’utilisation de RévizSTMG, application gratuite de révision du bac STMG
        (cours, exercices, flashcards, bacs blancs, espace classe). Utiliser l’application vaut acceptation de ces
        conditions.</p>
      </Section>

      <Section title="2. Accès au service">
        <ul className="list-disc space-y-1 pl-5">
          <li>L’application est <b>gratuite</b>, sans publicité.</li>
          <li>Elle demande un <b>compte</b> (adresse e-mail et mot de passe), qui sauvegarde ta progression, te
          permet de la retrouver sur plusieurs appareils et de rejoindre une classe. Les informations données
          doivent être exactes ; le mot de passe est personnel et ne doit pas être partagé.</li>
          <li>Pour un élève mineur, l’utilisation suppose l’accord de l’établissement ou du représentant légal.</li>
          <li>Le service est fourni « en l’état ». Les éditeurs font de leur mieux pour qu’il reste disponible, sans
          pouvoir le garantir (maintenance, panne d’un hébergeur).</li>
        </ul>
      </Section>

      <Section title="3. Règles de bonne conduite">
        <p>Dans les espaces partagés (classe, mur, défis entre amis, classement, nom affiché) :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>respecter les autres : aucun propos insultant, harcelant, discriminatoire ou illégal ;</li>
          <li>ne pas publier d’informations personnelles sur quelqu’un d’autre, ni de photo sans son accord ;</li>
          <li>ne pas envoyer de messages en masse (spam), ne pas tenter d’accéder aux données des autres ni de
          perturber le service.</li>
        </ul>
        <p>Les professeurs peuvent retirer un contenu ou exclure un élève de leur classe. Les éditeurs peuvent
        supprimer un contenu ou un compte qui ne respecte pas ces règles. Pour signaler un problème :{' '}
        <a href="mailto:revizstmg@gmail.com" className={lien}>revizstmg@gmail.com</a>.</p>
      </Section>

      <Section title="4. Contenu pédagogique">
        <p>Les cours et exercices suivent le programme officiel de STMG et sont relus avec soin. Ils peuvent
        malgré tout contenir des erreurs : ils complètent le cours du professeur sans le remplacer. Une erreur
        repérée ? Écris-nous, elle sera corrigée.</p>
        <p>Les vidéos et documents proposés en lien appartiennent à leurs auteurs et s’ouvrent sur leur propre
        site, sous leurs propres conditions.</p>
      </Section>

      <Section title="5. Fonctions qui s’appuient sur d’autres services">
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Fiche par photo</b> : la photo est envoyée à un service d’intelligence artificielle (Google Gemini
          ou Anthropic Claude) qui en tire une fiche. N’y mets pas d’informations personnelles.</li>
          <li><b>Traduction</b> de l’interface dans une autre langue que le français : les textes à traduire sont
          envoyés au service MyMemory.</li>
        </ul>
        <p>Le détail figure dans la <Link to="/confidentialite" className={lien}>politique de confidentialité</Link>.</p>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <p>Les textes, exercices, illustrations et le code de RévizSTMG appartiennent à leurs auteurs. Tu peux les
        utiliser pour réviser, seul ou en classe. Toute autre reproduction ou réutilisation, en particulier
        commerciale, demande l’accord des éditeurs.</p>
      </Section>

      <Section title="7. Données personnelles">
        <p>La façon dont tes données sont traitées, et tes droits, sont décrits dans la{' '}
        <Link to="/confidentialite" className={lien}>politique de confidentialité</Link>.</p>
      </Section>

      <Section title="8. Modification des conditions">
        <p>Ces conditions peuvent évoluer avec l’application. La date de mise à jour figure en haut de la page ; en
        cas de changement important, l’information est donnée dans l’application.</p>
      </Section>

      <Section title="9. Droit applicable">
        <p>Ces conditions relèvent du droit français. En cas de difficulté, écris d’abord à{' '}
        <a href="mailto:revizstmg@gmail.com" className={lien}>revizstmg@gmail.com</a> : nous chercherons une solution
        à l’amiable.</p>
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
