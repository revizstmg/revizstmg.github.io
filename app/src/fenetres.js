// Une seule fenêtre automatique par visite. À l'arrivée, l'information sur les
// cookies (première visite), la récompense du jour et l'invitation à installer
// l'application se disputaient l'écran : la première qui le demande, dans cet
// ordre, est la seule montrée pendant la visite (onglet ouvert). Les autres
// attendent une visite suivante ; la récompense du jour est créditée quand même.
import { useEffect, useState } from 'react'

const CLE = 'stmg_fenetre_visite'
const ORDRE = ['cookies', 'recompense', 'installer']
const demandes = new Set()
const abonnes = new Set()
let choisie = (() => { try { return sessionStorage.getItem(CLE) } catch { return null } })()

function choisir() {
  if (choisie) return
  const id = ORDRE.find((x) => demandes.has(x))
  if (!id) return
  choisie = id
  try { sessionStorage.setItem(CLE, id) } catch { /* stockage indisponible */ }
  abonnes.forEach((maj) => maj())
}

// Vrai si la fenêtre `id`, qui veut s'ouvrir, est celle de la visite.
export function useFenetreAutomatique(id, veut) {
  const [, maj] = useState(0)
  useEffect(() => {
    const f = () => maj((v) => v + 1)
    abonnes.add(f)
    return () => { abonnes.delete(f) }
  }, [])
  useEffect(() => {
    if (!veut) return
    demandes.add(id)
    // Les fenêtres qui se déclarent au même moment passent par l'ordre de priorité.
    const minuteur = setTimeout(choisir, 0)
    return () => { clearTimeout(minuteur); demandes.delete(id) }
  }, [id, veut])
  return !!veut && choisie === id
}
