// Chargé uniquement lors d’un téléchargement. Les corrigés ne figurent jamais
// dans le PDF du sujet ; la copie est à rédiger sur papier, comme au bac.
import { jsPDF } from 'jspdf'
const clean = s => String(s ?? '').replace(/\*\*/g, '').replace(/[‐‑–—]/g, '-').replace(/\u00a0/g, ' ').replace(/→/g, ' : ')
export function buildExamPdf(draft, correction = false) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.setProperties({ title: `${correction ? 'Corrigé' : 'Sujet'} - ${draft.exam.title}`, author: 'RévizSTMG', subject: 'Examen blanc personnalisé - entraînement non officiel' })
  const left = 22, width = 166, bottom = 272
  let y = 25
  const page = () => { doc.addPage(); y = 24 }
  const rule = () => { doc.setDrawColor(35); doc.setLineWidth(0.3); doc.line(left, y, left + width, y); y += 7 }
  const text = (value, size = 11, bold = false, gap = 3) => {
    doc.setFont('times', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(20)
    for (const paragraph of clean(value).split('\n')) {
      const lines = doc.splitTextToSize(paragraph || ' ', width)
      for (const line of lines) { if (y + size * 0.4 > bottom) page(); doc.text(line, left, y); y += size * 0.43 }
      y += gap
    }
  }
  const heading = value => { if (y > bottom - 25) page(); y += 5; text(value, 13, true, 4) }
  text('BACCALAURÉAT TECHNOLOGIQUE · STMG', 15, true)
  text('EXAMEN BLANC PERSONNALISÉ', 11, true)
  y += 10
  text(correction ? 'ÉLÉMENTS DE CORRECTION' : 'SUJET', 20, true)
  text(draft.exam.title, 17, true)
  y += 8; rule()
  text(`Durée : ${draft.duration} minutes                  Barème : 20 points`, 12, true)
  text('Entraînement RévizSTMG généré avec l’aide de l’IA. Document non officiel.', 10)
  if (correction) text('Proposition de correction et critères d’auto-évaluation. À vérifier avec le cours ; ne constitue pas un barème officiel.', 11)
  else {
    text('Répondez sur une copie séparée. Numérotez vos réponses et justifiez votre raisonnement à partir des documents et de vos connaissances.', 12)
    text(draft.exam.instructions, 11)
    y += 6; rule()
    text('COMPOSITION DU SUJET', 12, true)
    text(`${draft.exam.questions.length} questions · ${draft.exam.documents.length} documents\nLe corrigé est fourni dans un fichier séparé.`, 11)
  }
  page()
  heading(correction ? 'Proposition de corrigé et barème indicatif' : 'Travail à faire')
  if (correction) {
    for (const [i, q] of draft.exam.questions.entries()) {
      heading(`${i + 1}. ${q.enonce} (${q.points} points)`)
      text(q.correction)
      text('Critères de réussite', 11, true)
      for (const c of q.criteria) text(`- ${c}`)
    }
  } else {
    for (const [i, q] of draft.exam.questions.entries()) {
      heading(`${i + 1}. ${q.enonce} (${q.points} points)`)
      if (q.documentIds.length) text('Documents : ' + q.documentIds.map(id => draft.exam.documents.find(d => d.id === id)?.title || id).join(' ; '), 10)
    }
    if (draft.exam.documents.length) {
      page(); heading('Dossier documentaire')
      for (const d of draft.exam.documents) { heading(d.title); text(d.text) }
    }
  }
  heading('Périmètre de révision')
  for (const c of draft.courses) text(`${c.subject} - ${c.level === 'premiere' ? 'Première' : 'Terminale'} : ${c.title}`, 10)
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i); doc.setDrawColor(160); doc.line(left, 282, left + width, 282)
    doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(70)
    doc.text(`RévizSTMG - ${correction ? 'Corrigé indicatif' : 'Sujet d’entraînement'} - ${draft.duration} min`, left, 288)
    doc.text(`${i} / ${total}`, left + width, 288, { align: 'right' })
  }
  return doc
}
export function downloadExamPdf(draft, correction = false) {
  const safe = clean(draft.exam.title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 80)
  buildExamPdf(draft, correction).save(`RevizSTMG-${safe}-${correction ? 'corrige' : 'sujet'}.pdf`)
}
