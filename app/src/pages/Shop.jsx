import { useLang, usePublicText } from '../i18n.js'
import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore, levelFromXp } from '../store.jsx'
import { SHOP_ITEMS, SHOP_REWARDS, rewardProgress } from '../data/shop.js'

const CATEGORIES = [{ id: 'all', name: 'Tout explorer', icon: '✦' }, { id: 'theme', name: 'Ambiances', icon: '🎨' }, { id: 'avatar', name: 'Avatars', icon: '🦊' }, { id: 'banner', name: 'Bannières', icon: '🌅' }, { id: 'title', name: 'Titres', icon: '🏷️' }, { id: 'boost', name: 'Objets utiles', icon: '🧊' }]
const accent = { color: 'var(--c-accent-texte)' }
const equipped = (item, ct) => item.type === 'palette' ? ct.accent === item.theme.accent : item.type === 'avatar' ? ct.avatar === item.avatar : item.type === 'banner' ? ct.banner === item.color : item.type === 'title' ? ct.title === item.title : false

function ItemCard({ item, state, buy, equip, notify }) {
  const tr = usePublicText()
  const lang = useLang()
  const number = (n) => new Intl.NumberFormat(lang).format(n)
  const owned = (state.owned || []).includes(item.id)
  const active = equipped(item, state.customTheme || {})
  const locked = state.xp < (item.minXp || 0)
  const affordable = state.coins >= item.price
  const colors = item.theme || {}
  const color = item.color || colors.accent || '#b2965d'
  return (
    <article className="card group flex min-w-0 flex-col overflow-hidden" aria-label={tr(item.name)}>
      <div className="relative flex h-32 items-center justify-center overflow-hidden border-b border-black/5" style={{ background: item.type === 'palette' ? colors.bg : `linear-gradient(140deg, ${color}22, ${color}44)` }}>
        <span aria-hidden className="absolute -right-5 -top-8 h-32 w-32 rounded-full border-[18px]" style={{ borderColor: `${color}18` }} />
        {item.type === 'title' ? <span className="mx-3 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-center text-xs font-bold text-slate-800">{item.icon} {tr(item.title)}</span> : <span aria-hidden className="relative text-5xl transition-transform group-hover:scale-110">{item.icon}</span>}
        {owned && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-emerald-800">✓ Acquis</span>}
        {locked && !owned && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-700">Niv. {levelFromXp(item.minXp).level}</span>}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs font-bold uppercase tracking-widest" style={accent}>{tr(item.rarity || 'commun')}</p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{tr(item.name)}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{tr(item.desc || 'Une palette de couleurs pour réinventer ton espace.')}</p>
        {item.type === 'palette' && <div className="mt-3 flex gap-1.5" role="img" aria-label="Couleurs de l’ambiance">{Object.values(colors).map((c, i) => <span key={i} className="h-3 flex-1 rounded-full border border-black/10" style={{ background: c }} />)}</div>}
        <div className="mb-3 mt-4 flex items-center justify-between gap-1 text-xs"><strong>{item.rewardOnly ? 'Cadeau de niveau' : `🪙 ${number(item.price)}`}</strong>{item.type === 'consumable' && <span className="text-slate-500 dark:text-slate-400">{tr((item.quantity || 1) > 1 ? '{count} gels' : '{count} gel', { count: number(item.quantity || 1) })}</span>}</div>
        {owned ? <button disabled={active} onClick={() => { equip(item); notify('{name} équipé.', item.name) }} className="btn-ghost w-full !min-h-0 !px-2 !py-2 text-xs ring-1 ring-slate-200 dark:ring-slate-700">{active ? '✓ Équipé' : 'Équiper'}</button> : <button disabled={locked || !affordable || item.rewardOnly} onClick={() => { buy(item); notify('{name} ajouté à tes objets.', item.name) }} className="btn-primary w-full !min-h-0 !px-2 !py-2 text-xs disabled:opacity-50">{item.rewardOnly ? 'Dans Récompenses' : locked ? `${number(item.minXp)} XP requis` : !affordable ? 'Pièces insuffisantes' : 'Obtenir'}</button>}
      </div>
    </article>
  )
}

function RewardCard({ reward, state, claim, notify }) {
  const tr = usePublicText()
  const lang = useLang()
  const number = (n) => new Intl.NumberFormat(lang).format(n)
  const progress = rewardProgress(state, reward)
  const offer = !!reward.offer
  const level = levelFromXp(reward.minXp).level
  const mail = `mailto:revizstmg@gmail.com?subject=${encodeURIComponent(tr('Récompense {offer} — RévizSTMG', { offer: reward.offer }))}&body=${encodeURIComponent(tr('Bonjour, je souhaite faire vérifier mon éligibilité à la récompense {gift}.\nCompte : {email}\nIdentifiant : {id}\nXP affichés : {xp}\nTests distincts à au moins {score} % : {tests}\nMerci.', { gift: tr(reward.gift), email: state.account?.email || '', id: state.account?.id || '', xp: state.xp, score: reward.score, tests: progress.tests }))}`

  return (
    <article className={`card relative flex flex-col overflow-hidden p-5 ${offer ? 'border border-[#bd9d58]/40' : ''}`} aria-label={tr(reward.name)}>
      <div className="flex items-start justify-between gap-3"><span aria-hidden className="text-3xl" style={accent}>{reward.icon}</span><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">Niveau {level}</span></div>
      <h3 className="mt-4 font-display text-2xl font-semibold">{tr(reward.name)}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{tr(reward.gift)}</p>
      <ul className="my-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <li>{state.xp >= reward.minXp ? '✓' : '○'} {number(reward.minXp)} XP cumulés</li>
        {reward.tests && <li>{progress.tests >= reward.tests ? '✓' : '○'} {tr('{tests} tests de thèmes différents à {score} % minimum', { tests: number(reward.tests), score: number(reward.score) })} <span className="font-semibold">({Math.min(progress.tests, reward.tests)}/{reward.tests})</span></li>}
      </ul>
      <div className="mt-auto"><progress aria-label={tr('Progression {v0}', { v0: tr(reward.name) })} value={progress.pct} max="100" className="h-1.5 w-full overflow-hidden rounded-full accent-amber-600" />
        <p className="mb-3 mt-1 text-end text-xs text-slate-500 dark:text-slate-400">{progress.pct} % des conditions remplies</p>
        {progress.claimed ? <div><p className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">✓ {offer ? 'Récompense réservée · à faire vérifier' : 'Récompense récupérée'}</p>{offer && <a href={mail} className="mt-3 block text-center text-xs font-semibold underline" style={accent}>Préparer ma demande par e-mail</a>}</div> : <button disabled={!progress.eligible || (offer && !state.account?.id)} onClick={() => { claim(reward.id); notify(offer ? 'Réservation enregistrée. Fais vérifier tes résultats pour le lancement de l’offre.' : 'Récompense récupérée !') }} className="btn-primary w-full !min-h-0 !py-2.5 text-sm disabled:opacity-50">{offer && !state.account?.id ? 'Compte requis' : !progress.eligible ? 'Continuer à progresser' : offer ? 'Réserver mon mois offert' : 'Récupérer ma récompense'}</button>}
        {offer && <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Offre en préparation. Mois offert au lancement, après vérification des résultats. Aucune activation ni facturation aujourd’hui. Une seule attribution par compte et par offre.</p>}
      </div>
    </article>
  )
}

export default function Shop() {
  const tr = usePublicText()
  const lang = useLang()
  const number = (n) => new Intl.NumberFormat(lang).format(n)
  const { state, derived, buy, equip, claimShopReward, resetCustomTheme } = useStore()
  const [tab, setTab] = useState('selection')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recommended')
  const [message, setMessage] = useState(null)
  const notify = (text, name) => setMessage({ text, name })
  const owned = state.owned || []
  const filtered = useMemo(() => SHOP_ITEMS.filter((i) => (category === 'all' || i.category === category) && (tab !== 'owned' || owned.includes(i.id)) && `${i.name} ${tr(i.name)} ${i.desc || ''} ${tr(i.desc || '')}`.toLocaleLowerCase(lang).includes(query.toLocaleLowerCase(lang))).sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rarity' ? (b.minXp || 0) - (a.minXp || 0) : (a.minXp || 0) - (b.minXp || 0)), [category, query, sort, tab, state.owned, lang, tr])
  if (!state.track) return <Navigate to="/" replace />
  const nextReward = SHOP_REWARDS.find((r) => !rewardProgress(state, r).claimed)
  const renderItem = (item) => <ItemCard key={item.id} item={item} state={state} buy={buy} equip={equip} notify={notify} />
  return (
    <div className="animate-lux space-y-6 pb-6">
      <header className="shop-hero relative overflow-hidden rounded-[1.7rem] border border-[#c7a864]/30 bg-[#172d30] p-6 text-[#fff7e2] sm:p-8">
        <span aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[36px] border-[#c8a65e]/10" />
        <div className="relative"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d9c18b]">L’atelier RévizSTMG</p><h1 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Tes efforts ont du style.</h1><p className="mt-3 max-w-md text-sm leading-relaxed text-[#d7d0bb]">Révise, collectionne, démarque-toi. Une boutique de récompenses gagnées à la force de tes révisions.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">🪙 {number(state.coins || 0)} pièces</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">✦ Niveau {derived.level} · {number(state.xp)} XP</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">◈ {owned.length} objets acquis</span></div>
        </div>
      </header>
      <nav aria-label="Rubriques de la boutique" className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">{[['selection', 'À la une'], ['catalog', 'Collections'], ['rewards', 'Récompenses'], ['owned', 'Mes objets']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setMessage(null) }} className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition ${tab === id ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{tr(label)}</button>)}</nav>
      <div role="status" aria-live="polite" className={message ? 'rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'sr-only'}>{message ? tr(message.text, { name: tr(message.name || '') }) : ''}</div>
      {tab === 'selection' && <>
        <section><h2 className="font-display text-2xl font-semibold">Tes premiers objets</h2><p className="mb-4 mt-2 text-sm text-slate-600 dark:text-slate-300">Les petits prix accessibles à ton niveau. Les exercices te permettent de gagner les pièces nécessaires.</p><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{SHOP_ITEMS.filter(i => !i.rewardOnly && (i.minXp || 0) <= state.xp && !owned.includes(i.id)).sort((a,b) => a.price-b.price).slice(0,3).map(renderItem)}</div><Link to="/seance" className="mt-3 inline-block text-sm font-semibold underline" style={accent}>Commencer une séance →</Link></section>
        {nextReward && <section className="card flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-bold uppercase tracking-widest" style={accent}>Ton prochain cap</p><h2 className="mt-1 font-display text-xl font-semibold">{tr(nextReward.gift)}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{rewardProgress(state, nextReward).pct} % des conditions remplies · les pièces dépensées ne réduisent pas tes XP.</p></div><button onClick={() => setTab('rewards')} className="btn-ghost !min-h-0 !py-2 text-xs">Voir les paliers →</button></section>}
        <section><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest" style={accent}>La collection du moment</p><h2 className="mt-1 font-display text-2xl font-semibold">Un nouvel univers de révision</h2></div><button onClick={() => setTab('catalog')} className="text-xs font-semibold underline" style={accent}>Tout voir</button></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{['pal-nebuleuse', 'av-phenix', 'banner-royal'].map((id) => renderItem(SHOP_ITEMS.find((i) => i.id === id)))}</div></section>
        <section><p className="text-xs font-bold uppercase tracking-widest" style={accent}>Les grands objectifs</p><h2 className="mb-4 mt-1 font-display text-2xl font-semibold">De grands résultats. De vrais avantages.</h2><div className="grid gap-4 sm:grid-cols-2">{SHOP_REWARDS.filter((r) => r.offer).map((r) => <RewardCard key={r.id} reward={r} state={state} claim={claimShopReward} notify={notify} />)}</div></section>
      </>}
      {(tab === 'catalog' || tab === 'owned') && <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold">{tab === 'owned' ? 'Ton vestiaire de récompenses' : 'Trouve ta prochaine récompense'}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tab === 'owned' ? 'Tes objets permanents. Les gels sont ajoutés à ta réserve.' : `${SHOP_ITEMS.length} articles · tes anciens achats sont conservés`}</p></div>{tab === 'owned' && <button onClick={() => { resetCustomTheme(); notify('Apparence par défaut restaurée. Tes achats sont conservés.') }} className="text-xs underline" style={accent}>Retirer les personnalisations</button>}</div>
        <div className="flex flex-col gap-3 sm:flex-row"><label className="flex-1"><span className="sr-only">Rechercher un article</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un article…" className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-700" /></label><label><span className="sr-only">Trier les articles</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="recommended">Progression</option><option value="price">Prix croissant</option><option value="rarity">Les plus rares</option></select></label></div>
        <div className="flex flex-wrap gap-2" aria-label="Catégories">{CATEGORIES.map((c) => <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${category === c.id ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{c.icon} {tr(c.name)}</button>)}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{tr(filtered.length === 1 ? '{count} article' : '{count} articles', { count: number(filtered.length) })} · 🧊 {tr(state.freezes === 1 ? '{count} gel en réserve' : '{count} gels en réserve', { count: number(state.freezes || 0) })}</p>
        {filtered.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{filtered.map(renderItem)}</div> : <div className="card p-8 text-center"><p className="font-display text-xl">{tab === 'owned' ? 'Ta collection commence ici.' : 'Aucun article trouvé.'}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tab === 'owned' ? 'Échange tes pièces contre un premier objet dans Collections.' : 'Essaie une autre recherche ou une autre catégorie.'}</p><button className="btn-ghost mt-4 text-xs" onClick={() => { setTab('catalog'); setCategory('all'); setQuery('') }}>Explorer les collections</button></div>}
      </section>}
      {tab === 'rewards' && <section><p className="text-xs font-bold uppercase tracking-widest" style={accent}>La voie de la régularité</p><h2 className="mt-1 font-display text-3xl font-semibold">Chaque palier compte.</h2><p className="mb-5 mt-2 text-sm text-slate-600 dark:text-slate-400">Ces cadeaux ne coûtent aucune pièce. Les mois offerts récompensent aussi la maîtrise : répéter le même test ne compte qu’une fois.</p><div className="grid gap-4 sm:grid-cols-2">{SHOP_REWARDS.map((r) => <RewardCard key={r.id} reward={r} state={state} claim={claimShopReward} notify={notify} />)}</div></section>}
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"><h2 className="font-display text-lg font-semibold">Une boutique qui suit tes progrès</h2><div className="mt-3 grid gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:grid-cols-3"><p><b className="text-slate-800 dark:text-slate-200">01 · Révise.</b><br />Les exercices, défis et objectifs rapportent des XP et des pièces virtuelles.</p><p><b className="text-slate-800 dark:text-slate-200">02 · Choisis.</b><br />Les pièces servent aux achats. Les XP débloquent les niveaux et les collections rares.</p><p><b className="text-slate-800 dark:text-slate-200">03 · Vise plus haut.</b><br />20 tests à 90 % pour Premium, 30 tests à 95 % pour Ultimate, en plus du niveau requis.</p></div><p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">Achat en pièces virtuelles uniquement. Les offres Premium et Ultimate sont en préparation ; toutes les options IA sont prévues dans Ultimate. Elles sont accessibles aux comptes connectés pendant le développement. Les réservations doivent être vérifiées avant attribution. Aucun renouvellement automatique. <Link to="/cgu" className="underline">Conditions des récompenses</Link></p></section>
    </div>
  )
}
