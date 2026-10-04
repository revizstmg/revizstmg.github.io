import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useStore } from './store.jsx'
import Layout from './components/Layout.jsx'
import { getLinkedChild } from './parent.js'
import { Chargement, ContenuMatiere, ContenuFiliere } from './content/Contenu.jsx'

// Chaque page est un fichier compilé à part, chargé quand on l'ouvre.
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Subject = lazy(() => import('./pages/Subject.jsx'))
const Theme = lazy(() => import('./pages/Theme.jsx'))
const Chapter = lazy(() => import('./pages/Chapter.jsx'))
const Favoris = lazy(() => import('./pages/Favoris.jsx'))
const Badges = lazy(() => import('./pages/Badges.jsx'))
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx'))
const Classe = lazy(() => import('./pages/Classe.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Coach = lazy(() => import('./pages/Coach.jsx'))
const Revise = lazy(() => import('./pages/Revise.jsx'))
const Parent = lazy(() => import('./pages/Parent.jsx'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage.jsx'))
const BacBlanc = lazy(() => import('./pages/BacBlanc.jsx'))
const Programme = lazy(() => import('./pages/Programme.jsx'))
const GrandOral = lazy(() => import('./pages/GrandOral.jsx'))
const CoachAI = lazy(() => import('./pages/CoachAI.jsx'))
const PhotoFiche = lazy(() => import('./pages/PhotoFiche.jsx'))
const DailyChallenge = lazy(() => import('./pages/DailyChallenge.jsx'))
const Express = lazy(() => import('./pages/Express.jsx'))
const Formulas = lazy(() => import('./pages/Formulas.jsx'))
const Methodo = lazy(() => import('./pages/Methodo.jsx'))
const Shop = lazy(() => import('./pages/Shop.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Faq = lazy(() => import('./pages/Faq.jsx'))
const Guide = lazy(() => import('./pages/Guide.jsx'))
const Friends = lazy(() => import('./pages/Friends.jsx'))

// Rétro-compatibilité : les anciens liens /subject/:sid/chapter/:cid
// (où le chapitre était en fait un thème) redirigent vers la page Thème.
function OldChapterRedirect() {
  const { sid, cid } = useParams()
  return <Navigate to={`/subject/${sid}/theme/${cid}`} replace />
}

// Entrée « / » : un utilisateur qui a déjà une filière va directement à son
// accueil (redirection synchrone au rendu = aucun écran « choisis ta matière »
// qui clignote à l'ouverture). Sinon on affiche l'écran de choix.
// Le changement de filière volontaire passe par la route « /changer ».
function RootEntry() {
  const { state } = useStore()
  if (state.track) return <Navigate to="/accueil" replace />
  // Un parent déjà relié à un enfant (et sans filière élève) ouvre directement
  // son espace de suivi.
  if (getLinkedChild()) return <Navigate to="/parent" replace />
  return <Landing />
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Chargement />}>
      <Routes>
        <Route path="/" element={<RootEntry />} />
        <Route path="/changer" element={<Landing />} />
        <Route path="/accueil" element={<Home />} />
        <Route path="/subject/:sid" element={<ContenuMatiere><Subject /></ContenuMatiere>} />
        <Route path="/subject/:sid/theme/:tid" element={<ContenuMatiere><Theme /></ContenuMatiere>} />
        <Route path="/subject/:sid/theme/:tid/chapter/:cidx" element={<ContenuMatiere><Chapter /></ContenuMatiere>} />
        <Route path="/subject/:sid/chapter/:cid" element={<OldChapterRedirect />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/classe" element={<Classe />} />
        <Route path="/moi" element={<Profile />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/revision" element={<Revise />} />
        <Route path="/revision/deck/:deckId" element={<FlashcardsPage />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/bac-blanc" element={<ContenuFiliere><BacBlanc /></ContenuFiliere>} />
        <Route path="/programme" element={<Programme />} />
        <Route path="/grand-oral" element={<GrandOral />} />
        <Route path="/coach-ia" element={<ContenuFiliere><CoachAI /></ContenuFiliere>} />
        <Route path="/fiches-photo" element={<PhotoFiche />} />
        <Route path="/defi" element={<ContenuFiliere><DailyChallenge /></ContenuFiliere>} />
        <Route path="/express" element={<ContenuFiliere><Express /></ContenuFiliere>} />
        <Route path="/formules" element={<Formulas />} />
        <Route path="/methodo" element={<Methodo />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/classement" element={<Leaderboard />} />
        <Route path="/amis" element={<ContenuFiliere><Friends /></ContenuFiliere>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Layout>
  )
}
