import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useT } from '../i18n.js'

// Ligne « Enregistrer dans Réviser » pour un paquet de flashcards (thème ou
// matière). `deck` = { id, title, cards, … }. Une fois enregistré, le bouton
// mène à « Réviser ».
export function DeckDownload({ deck, color = 'var(--c-accent)', label }) {
  const { state, saveDeck } = useStore()
  const t = useT()
  if (!deck || !deck.cards?.length) return null
  const saved = (state.savedDecks || []).some((d) => d.id === deck.id)
  const col = deck.color || color
  return (
    <section className="no-print card flex items-center gap-3 p-4">
      <span className="w-6 shrink-0 text-center text-lg" aria-hidden>🃏</span>
      <span className="min-w-0 flex-1 font-semibold leading-snug">{label || t('downloadDeckTitle')}</span>
      {saved ? (
        <Link to="/revision" title={t('deckSavedWhere')} className="shrink-0 text-sm font-semibold" style={{ color: col }}>
          ✓ {t('deckSaved')} →
        </Link>
      ) : (
        <button onClick={() => saveDeck(deck)} className="btn-primary shrink-0 !min-h-0 !py-1.5 text-sm text-white" style={{ backgroundColor: col }}>
          {t('downloadDeck')}
        </button>
      )}
    </section>
  )
}
