import { useMemo } from 'react'
import { construireFiche, ficheUtile, court, lignes } from '../data/ficheVisuelle.js'

// Première page de la fiche PDF : la version « flemmard » du chapitre, toute en couleurs.
// Invisible à l'écran (classe print-only) ; générée à partir du cours, en français seulement
// (les autres langues gardent la fiche d'avant, qui est traduite à la volée).
const PASTELS = ['#fecaca', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8']
const FORTS = ['#dc2626', '#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777']
const NUMEROS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

function CarteMentale({ titre, branches, couleur }) {
  const pas = 78
  const haut = branches.length * pas + 16
  const cy = haut / 2
  return (
    <svg viewBox={`0 0 760 ${haut}`} role="img" aria-label={`Carte mentale : ${titre}`} className="fiche-carte" style={{ width: '100%', height: 'auto' }}>
      {branches.map((b, i) => {
        const y = 8 + i * pas + pas / 2
        return <path key={`p${i}`} d={`M170 ${cy} C 215 ${cy}, 190 ${y}, 235 ${y}`} fill="none" stroke={FORTS[i % 6]} strokeWidth="4" strokeLinecap="round" />
      })}
      <rect x="6" y={cy - 56} width="164" height="112" rx="8" fill={couleur} />
      {lignes(titre, 19, 5).map((l, k, tab) => (
        <text key={k} x="88" y={cy + (k - (tab.length - 1) / 2) * 17 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{l}</text>
      ))}
      {branches.map((b, i) => {
        const y = 8 + i * pas + pas / 2
        return (
          <g key={i}>
            <rect x="235" y={y - 24} width="200" height="48" rx="8" fill={PASTELS[i % 6]} stroke={FORTS[i % 6]} strokeWidth="2" />
            {lignes(b.titre, 24, 2).map((l, k, tab) => (
              <text key={k} x="335" y={y + (k - (tab.length - 1) / 2) * 15 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#111">{l}</text>
            ))}
            {b.feuilles.map((f, k) => {
              const fy = y + (k - (b.feuilles.length - 1) / 2) * 34
              const ls = lignes(f, 50, 2)
              return (
                <g key={k}>
                  <path d={`M435 ${y} L 460 ${fy}`} stroke={FORTS[i % 6]} strokeWidth="2" fill="none" />
                  <rect x="460" y={fy - 22} width="296" height="44" rx="6" fill="#fff" stroke={FORTS[i % 6]} strokeWidth="1.5" />
                  {ls.map((l, q) => <text key={q} x="468" y={fy + (q - (ls.length - 1) / 2) * 14 + 4} fontSize="11" fill="#111">{l}</text>)}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

export default function FicheVisuelle({ section, glossaire, couleur, icone, matiere, theme, titre, eleve, date }) {
  const fiche = useMemo(() => construireFiche(section, glossaire), [section, glossaire])
  if (!ficheUtile(fiche)) return null
  return (
    <div className="fiche-visuelle print-only" lang="fr" data-no-translate>
      <header className="fiche-bandeau" style={{ backgroundColor: couleur }}>
        <span className="fiche-bandeau-icone" aria-hidden>{icone || '📘'}</span>
        <div>
          <p className="fiche-bandeau-sur">{matiere} · {theme}</p>
          <p className="fiche-bandeau-titre">{titre}</p>
          <p className="fiche-bandeau-sous">{eleve ? `Fiche de ${eleve} · ` : ''}{date}</p>
        </div>
      </header>
      <p className="fiche-flemme">🦥 Version flemmard : lis cette page, le cours complet est juste après.</p>

      {fiche.idees.length > 0 && (
        <section className="fiche-zone">
          <h2>🧠 Les idées en 1 minute</h2>
          <ol className="fiche-idees">
            {fiche.idees.map((x, i) => (
              <li key={i} style={{ backgroundColor: PASTELS[i % 6], borderColor: FORTS[i % 6] }}><span aria-hidden>{NUMEROS[i]}</span><p>{x}</p></li>
            ))}
          </ol>
        </section>
      )}

      {fiche.branches.length >= 2 && (
        <section className="fiche-zone">
          <h2>🗺️ La carte mentale</h2>
          <CarteMentale titre={titre} branches={fiche.branches} couleur={couleur} />
        </section>
      )}

      {fiche.formules.length > 0 && (
        <section className="fiche-zone">
          <h2>🧮 La formule à ne pas oublier</h2>
          <div className="fiche-formules">{fiche.formules.map((f, i) => <p key={i}>{f}</p>)}</div>
        </section>
      )}

      {fiche.mots.length > 0 && (
        <section className="fiche-zone">
          <h2>🔑 Les mots à connaître</h2>
          <ul className="fiche-mots">
            {fiche.mots.map((m, i) => (
              <li key={m.terme} style={{ borderColor: FORTS[i % 6] }}>
                <strong style={{ backgroundColor: PASTELS[i % 6] }}>{m.terme}</strong>
                <span>{m.definition}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(fiche.pieges.length > 0 || fiche.astuces.length > 0 || fiche.exemples.length > 0) && (
        <section className="fiche-zone">
          <h2>🚨 Pièges, astuces et cas réels</h2>
          <div className="fiche-cartes">
            {fiche.pieges.map((x, i) => <div key={`p${i}`} className="fiche-carte-info fiche-piege"><b>🚨 {x.titre || 'Piège'}</b><p>{x.texte}</p></div>)}
            {fiche.astuces.map((x, i) => <div key={`a${i}`} className="fiche-carte-info fiche-astuce"><b>✅ {x.titre || 'Astuce de flemmard'}</b><p>{x.texte}</p></div>)}
            {fiche.exemples.map((x, i) => <div key={`e${i}`} className="fiche-carte-info fiche-exemple"><b>💡 {x.titre || 'Cas réel'}</b><p>{x.texte}</p></div>)}
          </div>
        </section>
      )}

      {fiche.autotest.length > 0 && (
        <section className="fiche-zone">
          <h2>☑️ Auto-test : coche ce que tu sais expliquer</h2>
          <ul className="fiche-test">{fiche.autotest.map((x) => <li key={x}><span aria-hidden>⬜</span> {x}</li>)}</ul>
        </section>
      )}
    </div>
  )
}
