// Menus et fenêtres utilisables au clavier :
// - à l'ouverture, le focus entre dans la fenêtre (premier élément utilisable,
//   sauf si un champ a déjà pris le focus, par exemple avec autoFocus) ;
// - Tab et Maj+Tab tournent à l'intérieur, sans repartir dans la page derrière ;
// - Échap ferme (si la fenêtre a une fermeture) ;
// - à la fermeture, le focus revient sur l'élément qui l'a ouverte.
// Seule la fenêtre ouverte en dernier réagit au clavier (fenêtres empilées).
// `focusSurRacine` : le focus se pose sur la fenêtre elle-même (un exercice ne
// doit pas s'ouvrir avec le focus sur « Quitter »).
import { useEffect, useRef } from 'react'

const pile = []
const FOCALISABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focalisables(racine) {
  return [...racine.querySelectorAll(FOCALISABLES)].filter((el) => el.getClientRects().length > 0)
}

export function useFenetreClavier(ref, onClose, actif = true, { focusSurRacine = false } = {}) {
  const fermer = useRef(onClose)
  fermer.current = onClose
  useEffect(() => {
    const racine = ref.current
    if (!actif || !racine) return
    const avant = document.activeElement
    const entree = {}
    pile.push(entree)
    if (!racine.contains(document.activeElement)) {
      const [premier] = focusSurRacine ? [] : focalisables(racine)
      if (premier) premier.focus()
      else { racine.setAttribute('tabindex', '-1'); racine.focus({ preventScroll: true }) }
    }
    const surTouche = (e) => {
      if (pile[pile.length - 1] !== entree) return
      if (e.key === 'Escape' && fermer.current) {
        e.preventDefault()
        e.stopPropagation()
        fermer.current()
        return
      }
      if (e.key !== 'Tab') return
      const liste = focalisables(racine)
      if (!liste.length) { e.preventDefault(); return }
      const premier = liste[0], dernier = liste[liste.length - 1]
      if (!racine.contains(document.activeElement)) { e.preventDefault(); premier.focus() }
      else if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
      else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
    }
    document.addEventListener('keydown', surTouche, true)
    return () => {
      document.removeEventListener('keydown', surTouche, true)
      const i = pile.indexOf(entree)
      if (i >= 0) pile.splice(i, 1)
      if (avant && typeof avant.focus === 'function' && document.contains(avant)) avant.focus()
    }
  }, [ref, actif])
}
