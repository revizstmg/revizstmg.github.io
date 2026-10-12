// Règle des hooks React : un composant doit appeler les mêmes hooks à chaque
// affichage. Un « if (…) return » placé avant un hook casse cette règle dès que
// la condition change (par exemple à la déconnexion) et laisse un écran blanc.
// Ce test relit le code des composants pour repérer ce cas.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = new URL('../src/', import.meta.url).pathname

function fichiersJsx(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return fichiersJsx(chemin)
    return nom.endsWith('.jsx') ? [chemin] : []
  })
}

// Lignes de premier niveau d'un composant (indentées de 2 espaces) : un return
// conditionnel suivi plus bas d'un appel de hook dans le même composant.
function hooksApresUnReturn(code) {
  const fautes = []
  let composant = null
  let retour = null
  code.split('\n').forEach((ligne, i) => {
    const debut = ligne.match(/^(?:export (?:default )?)?function ([A-Z]\w*)\(/)
    if (debut) { composant = debut[1]; retour = null; return }
    if (!composant || !/^ {2}\S/.test(ligne)) return
    const s = ligne.trim()
    if (/^if \(.*\) return\b/.test(s)) retour = i + 1
    else if (retour && !s.startsWith('//') && /\buse[A-Z]\w*\(/.test(s)) {
      fautes.push(`${composant}, ligne ${i + 1} (return ligne ${retour})`)
      retour = null
    }
  })
  return fautes
}

describe('règle des hooks', () => {
  it('aucun hook après un return conditionnel', () => {
    const fautes = fichiersJsx(SRC).flatMap((f) => hooksApresUnReturn(readFileSync(f, 'utf8')).map((x) => `${f.slice(SRC.length)} : ${x}`))
    expect(fautes).toEqual([])
  })

  it('le contrôle repère bien le cas fautif', () => {
    const fautif = 'export default function Page() {\n  const { state } = useStore()\n  if (!state.track) return null\n  const [a] = useState(0)\n}\n'
    expect(hooksApresUnReturn(fautif)).toHaveLength(1)
  })
})
