import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFenetreClavier } from './clavier.js'
import { useT, usePublicText } from '../i18n.js'

// Révision audio mains-libres : lit à voix haute « terme … définition » pour
// chaque carte, en enchaînant automatiquement. Lecture / pause / précédent /
// suivant. Utilise la synthèse vocale de l'appareil (aucune donnée envoyée).
export default function AudioReview({ items = [], color = '#7c3aed', title = '', contentLang = 'fr', onLanguageChange, onClose }) {
  const t = useT()
  const tr = usePublicText()
  const [language,setLanguage] = useState(() => ['fr','en','de','es','it','ar'].includes(contentLang) ? contentLang : 'fr')
  const voiceLang = {fr:'fr-FR',en:'en-US',de:'de-DE',es:'es-ES',it:'it-IT',ar:'ar-SA'}[language]
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [side, setSide] = useState('front')
  const panel = useRef(null), timer = useRef(null)
  const idxRef = useRef(0)
  const playingRef = useRef(false)
  const genRef = useRef(0) // invalide les callbacks des énoncés annulés
  idxRef.current = idx
  playingRef.current = playing

  const cancel = () => { genRef.current++; clearTimeout(timer.current); try { synth?.cancel() } catch { /* */ } }
  const close = () => { playingRef.current = false; cancel(); onClose?.() }
  useFenetreClavier(panel, close)
  useEffect(() => () => { playingRef.current = false; cancel() }, []) // arrêt à la fermeture

  const speak = (text, onEnd) => {
    if (!synth) { onEnd?.(); return }
    const myGen = genRef.current
    const u = new SpeechSynthesisUtterance(String(text || ''))
    u.lang = voiceLang
    u.rate = 0.95
    u.onend = () => { if (genRef.current === myGen) onEnd?.() }
    u.onerror = () => { if (genRef.current === myGen) onEnd?.() }
    synth.speak(u)
  }

  const playFrom = (i) => {
    if (!synth || i >= items.length) { setPlaying(false); playingRef.current = false; setSide('front'); return }
    setIdx(i); idxRef.current = i
    setSide('front')
    speak(items[i].front, () => {
      if (!playingRef.current) return
      setSide('back')
      speak(items[i].back, () => {
        if (!playingRef.current) return
        const generation = genRef.current
        timer.current = setTimeout(() => { if (playingRef.current && generation === genRef.current) playFrom(i + 1) }, 450)
      })
    })
  }

  const start = () => { if (!synth) return; cancel(); setPlaying(true); playingRef.current = true; playFrom(idxRef.current) }
  const pause = () => { setPlaying(false); playingRef.current = false; cancel() }
  const jump = (d) => {
    const ni = Math.min(items.length - 1, Math.max(0, idxRef.current + d))
    cancel()
    if (playingRef.current) playFrom(ni)
    else { setIdx(ni); setSide('front') }
  }

  const card = items[idx] || { front: '', back: '' }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 overflow-y-auto p-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-sm" onClick={close}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title || t('audioReview')} className="card flex w-full max-w-md flex-col overflow-hidden p-4" style={{maxHeight:'calc(100dvh - max(12px, env(safe-area-inset-top)) - 12px)'}} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <span className="truncate font-display text-lg font-semibold">🔊 {title || t('audioReview')}</span>
          <button onClick={close} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={t('quit')}>✕</button>
        </div>

        {!synth ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t('audioUnsupported')}</p>
        ) : (
          <>
            <label className="mb-3 block text-sm">{tr('Langue de lecture')}<select className="ms-2 rounded border p-2" value={language} onChange={e=>{playingRef.current=false;cancel();setPlaying(false);setLanguage(e.target.value);onLanguageChange?.(e.target.value)}}>{[['fr','Français'],['en','English'],['de','Deutsch'],['es','Español'],['it','Italiano'],['ar','العربية']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
            <div className="mb-1 text-xs text-slate-400">{Math.min(idx + 1, items.length)} / {items.length}</div>
            <div className="min-h-0 flex-1 overflow-y-auto break-words rounded-2xl border-2 p-4 text-center" style={{ borderColor: color, background: color + '10' }}>
              <p className="text-lg font-bold">{card.front}</p>
              {side === 'back' && <p className="mt-3 text-[15px] text-slate-700 dark:text-slate-200">{card.back}</p>}
            </div>

            <div className="mt-3 flex shrink-0 items-center justify-center gap-3">
              <button onClick={() => jump(-1)} disabled={idx === 0} className="grid h-11 w-11 place-items-center rounded-full text-lg disabled:opacity-30" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 30%, transparent)' }} aria-label={t('previous')}>⏮</button>
              <button onClick={() => (playing ? pause() : start())} className="grid h-14 w-14 place-items-center rounded-full text-2xl text-white shadow-lg" style={{ backgroundColor: color }} aria-label={playing ? t('pause') : t('play')}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => jump(1)} disabled={idx >= items.length - 1} className="grid h-11 w-11 place-items-center rounded-full text-lg disabled:opacity-30" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 30%, transparent)' }} aria-label={t('nextQuestion')}>⏭</button>
            </div>
            <p className="mt-3 shrink-0 text-center text-xs text-slate-400">🎧 {t('audioHint')}</p>
          </>
        )}
      </div>
    </div>, document.body
  )
}
