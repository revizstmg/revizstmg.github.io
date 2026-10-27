import { useT } from '../i18n.js'
import { STUDY_LANGUAGES, normalizeStudyLanguages } from '../data/studyLanguages.js'

export default function StudyLanguages({ value, onChange, parametres = false }) {
  const t = useT()
  const selected = normalizeStudyLanguages(value)
  return <fieldset className="my-4 min-w-0 space-y-3">
    <legend className="font-display text-lg">{t('studyLanguagesTitle')}</legend>
    <p className="text-sm">{t(parametres ? 'studyLanguagesHelpSettings' : 'studyLanguagesHelp')}</p>
    <div className="flex flex-wrap gap-2">
      {STUDY_LANGUAGES.map(language => <button key={language.id} type="button" aria-pressed={selected.includes(language.id)} onClick={() => onChange(selected.includes(language.id) ? selected.filter(id => id !== language.id) : [...selected, language.id])} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold" style={selected.includes(language.id) ? { background: 'var(--c-accent-fort)', color: '#fff', borderColor: 'var(--c-accent-fort)' } : { background: 'var(--c-card)', color: 'var(--c-ink)', borderColor: 'color-mix(in srgb, var(--c-ink) 25%, transparent)' }}>{t(language.key)}{selected.includes(language.id) && <span aria-hidden> ✓</span>}</button>)}
    </div>
  </fieldset>
}
