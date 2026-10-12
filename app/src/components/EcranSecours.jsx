import { Component } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n.js'

// Écran de secours : si une page plante pendant son affichage, React démonterait
// tout le site (écran blanc). Ce composant attrape l'erreur et ne remplace que la
// page, en gardant l'en-tête et le menu. Il se réarme dès qu'on change d'adresse
// (`cle`), pour que l'élève puisse repartir d'une autre page.
export default class EcranSecours extends Component {
  constructor(props) {
    super(props)
    this.state = { erreur: null }
  }

  static getDerivedStateFromError(erreur) {
    return { erreur }
  }

  componentDidUpdate(avant) {
    if (this.state.erreur && avant.cle !== this.props.cle) this.setState({ erreur: null })
  }

  render() {
    return this.state.erreur ? <PagePlantee /> : this.props.children
  }
}

function PagePlantee() {
  const t = useT()
  return (
    <div role="alert" className="animate-lux mx-auto max-w-md py-10 text-center">
      <p className="text-5xl" aria-hidden>🛠️</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{t('crashTitle')}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('crashText')}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">{t('crashReload')}</button>
        <Link to="/" className="btn-ghost">{t('notFoundHome')}</Link>
      </div>
    </div>
  )
}
