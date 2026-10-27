import {plainCopy} from '../presentation/style.js'
import { createElement, Fragment, forwardRef, useEffect, useState } from 'react'
import { useAutoTranslate, useLang, useT } from '../i18n.js'

// Les valeurs ne quittent pas le navigateur. Seul le modèle public est traduit.
export function interpolate(text, values = []) {
  return String(text).split(/(\{v\d+\})/g).map((part) => {
    const index = /^\{v(\d+)\}$/.exec(part)
    return index ? values[Number(index[1])] ?? '' : part
  })
}
export function TextePublic({ text, values, plain=false }) {
  const translated = useAutoTranslate(text)
  const lang = useLang()
  if(plain)return plainCopy(interpolate(translated,values).join(''))
  const directional = lang === 'ar' ? translated.replace(/[←→↗↖‹›]/g, arrow => ({'←':'→','→':'←','↗':'↖','↖':'↗','‹':'›','›':'‹'}[arrow])) : translated
  const content = interpolate(directional, values).map((value, i) => lang === 'ar' ? <bdi key={i} dir="auto">{value}</bdi> : <Fragment key={i}>{value}</Fragment>)
  return lang === 'ar' ? <bdi dir="auto">{content}</bdi> : content
}
function Attribute({ model, children }) {
  const translated = useAutoTranslate(model.text)
  return children(plainCopy(interpolate(translated, model.values).join('')))
}
export const ElementPublic = forwardRef(function ElementPublic({ as, __translations, ...props }, ref) {
  const entries = Object.entries(__translations)
  const render = (index, translated) => index === entries.length
    ? createElement(as, { ...props, ...translated, ref })
    : <Attribute model={entries[index][1]}>{(value) => render(index + 1, { ...translated, [entries[index][0]]: value })}</Attribute>
  return render(0, {})
})
export function TranslationStatus() {
  const lang = useLang()
  const t = useT()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
    const onError = () => setFailed(true)
    window.addEventListener('stmg-translation-error', onError)
    return () => window.removeEventListener('stmg-translation-error', onError)
  }, [lang])
  if (lang === 'fr' || !failed) return null
  return <div role="status" className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-950"><span>{t('translationPartial')}</span><button className="font-semibold underline" onClick={() => { setFailed(false); window.dispatchEvent(new Event('stmg-translation-retry')) }}>{t('retry')}</button></div>
}
