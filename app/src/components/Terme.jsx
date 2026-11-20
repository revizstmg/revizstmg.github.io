import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Mot en gras d'un cours dont le glossaire donne la définition : un bouton discret
// (soulignement pointillé) qui ouvre une petite fenêtre de définition. Échap, un clic
// ailleurs ou le bouton « Fermer » la referment ; le focus revient sur le mot.
// Dans le lecteur de cours (fenêtre modale), la fenêtre de définition s'y place aussi :
// sinon elle passerait derrière lui et échapperait au piège du focus.
export default function Terme({ terme, definition }) {
  const [ouvert, setOuvert] = useState(false)
  const [pos, setPos] = useState(null)
  const bouton = useRef(null)
  const fenetre = useRef(null)
  const id = useId()

  const placer = () => {
    const b = bouton.current?.getBoundingClientRect()
    if (!b) return
    const largeur = Math.min(320, window.innerWidth - 24)
    const hauteur = fenetre.current?.offsetHeight || 120
    let gauche = b.left + b.width / 2 - largeur / 2
    gauche = Math.max(12, Math.min(gauche, window.innerWidth - largeur - 12))
    const placeEnBas = window.innerHeight - b.bottom
    const dessus = placeEnBas < hauteur + 16 && b.top > hauteur + 16
    setPos({ gauche, largeur, haut: dessus ? b.top - hauteur - 8 : b.bottom + 8 })
  }

  useLayoutEffect(() => { if (ouvert) placer() }, [ouvert])
  useEffect(() => {
    if (!ouvert) return undefined
    // Échap : écouté sur window en phase de capture, donc avant le lecteur de cours (fenêtre modale)
    // qui, sinon, se fermerait en même temps que la définition.
    const touche = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); setOuvert(false); bouton.current?.focus() } }
    const dehors = (e) => { if (!fenetre.current?.contains(e.target) && !bouton.current?.contains(e.target)) setOuvert(false) }
    window.addEventListener('keydown', touche, true)
    document.addEventListener('pointerdown', dehors, true)
    window.addEventListener('resize', placer)
    window.addEventListener('scroll', placer, true)
    return () => {
      window.removeEventListener('keydown', touche, true)
      document.removeEventListener('pointerdown', dehors, true)
      window.removeEventListener('resize', placer)
      window.removeEventListener('scroll', placer, true)
    }
  }, [ouvert])

  return (
    <>
      <button ref={bouton} type="button" className="terme-clic text-slate-900 dark:text-white" aria-expanded={ouvert} aria-controls={ouvert ? id : undefined}
        aria-haspopup="true" onClick={(e) => { e.stopPropagation(); setOuvert((v) => !v) }}>{terme}</button>
      {ouvert && createPortal(
        <div ref={fenetre} id={id} role="dialog" aria-label={`Définition : ${terme}`} lang="fr" className="terme-def no-print" onClick={(e) => e.stopPropagation()}
          style={pos ? { left: pos.gauche, top: pos.haut, width: pos.largeur } : { left: 12, top: 0, width: 280, visibility: 'hidden' }}>
          <p className="terme-def-titre">{terme}</p>
          <p className="terme-def-texte">{definition}</p>
          <button type="button" className="terme-def-fermer" onClick={() => { setOuvert(false); bouton.current?.focus() }}>Fermer</button>
        </div>, bouton.current?.closest('[role="dialog"]') || document.body)}
    </>
  )
}
