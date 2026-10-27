import { Link } from 'react-router-dom'
import { useAutoTranslate } from '../i18n.js'

const LIEN = 'font-semibold text-[#84671b] underline dark:text-[#d9bd77]'

// Une phrase entière est traduite d'un bloc (jamais morceau par morceau), puis
// mise en forme : **gras**, [[libellé|/route]] pour un lien interne et
// [[libellé|mailto:adresse]] pour un lien e-mail.
export default function TexteRiche({ texte }) {
  const traduit = useAutoTranslate(texte)
  return String(traduit).split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g).map((part, i) => {
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    if (part.startsWith('[[')) {
      const [libelle, cible] = part.slice(2, -2).split('|')
      return cible.startsWith('mailto:')
        ? <a key={i} href={cible} className={LIEN}>{libelle}</a>
        : <Link key={i} to={cible} className={LIEN}>{libelle}</Link>
    }
    return part
  })
}
