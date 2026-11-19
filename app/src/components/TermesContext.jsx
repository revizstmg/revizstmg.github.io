import { createContext, useContext, useMemo } from 'react'
import { glossaireDe } from '../data/termes.js'

// Glossaire de la matière affichée : les textes de cours (CourseText) y cherchent la
// définition de leurs mots en gras. Hors de ce contexte, le gras reste un gras.
const Termes = createContext(null)

export function TermesProvider({ matiereId, children }) {
  const glossaire = useMemo(() => glossaireDe(matiereId), [matiereId])
  return <Termes.Provider value={glossaire}>{children}</Termes.Provider>
}

export const useTermes = () => useContext(Termes)
