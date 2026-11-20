// Chargé uniquement lors d’un téléchargement. Les corrigés ne figurent jamais
// dans le PDF du sujet ; la copie est à rédiger sur papier, comme au bac.
import { jsPDF } from 'jspdf'
import unicodeFont from '../../resources/fonts/DejaVuSans.base64.txt?raw'
// Times reste utilisé pour le texte courant ; les notations et écritures non
// WinAnsi utilisent une vraie police embarquée, sans suppression de symboles.
const clean = s => String(s ?? '').replace(/\*\*/g, '').replace(/[‐‑–—]/g, '-').replace(/[\u00a0\u202f]/g, ' ').replace(/[\u{1D400}-\u{1D7FF}]/gu, c => c.normalize('NFKC'))
const needsUnicode = s => /[^\t\r\n\x20-\x7e\xa0-\xff€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•˜™š›œžŸ]/u.test(s)

export function buildExamPdf(draft, correction = false) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.setProperties({ title: `${correction ? 'Corrigé' : 'Sujet'} - ${draft.exam.title}`, author: 'RévizSTMG', subject: draft.kind === 'ready' ? 'Sujet prêt - entraînement non officiel' : 'Examen blanc personnalisé - entraînement non officiel' })
  // Sujet en bleu, corrigé en vert : on reconnaît d'un coup d'œil lequel on a sous les yeux.
  const accent = correction ? [5, 150, 105] : [37, 99, 235], pastel = correction ? [220, 252, 231] : [219, 234, 254]
  const left = 22, width = 166, bottom = 272
  let y = 25, unicodeLoaded = false
  const page = () => { doc.addPage(); y = 24 }
  const rule = () => { doc.setDrawColor(35); doc.setLineWidth(0.3); doc.line(left, y, left + width, y); y += 7 }
  const text = (value, size = 11, bold = false, gap = 3, color = 20) => {
    doc.setFont('times', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(color)
    for (const paragraph of clean(value).split('\n')) {
      if (needsUnicode(paragraph)) {
        if (!unicodeLoaded) {doc.addFileToVFS('DejaVuSans.ttf',unicodeFont);doc.addFont('DejaVuSans.ttf','Unicode','normal');unicodeLoaded=true}
        doc.setFont('Unicode','normal')
      } else doc.setFont('times',bold?'bold':'normal')
      const lines = doc.splitTextToSize(paragraph || ' ', width)
      for (const line of lines) { if (y + size * 0.4 > bottom) page(); doc.text(line, left, y); y += size * 0.43 }
      y += gap
    }
  }
  const heading = value => { if (y > bottom - 25) page(); y += draft.kind === 'ready' ? 3 : 5; doc.setFillColor(...accent); doc.rect(left - 4, y - 4, 1.8, 6.5, 'F'); text(value, draft.kind === 'ready' ? 12 : 13, true, draft.kind === 'ready' ? 2 : 4) }
  const scope = () => {
  heading('Périmètre de révision')
  for (const c of draft.courses) text(`${c.subject} - ${c.level === 'premiere' ? 'Première' : 'Terminale'} : ${c.title}`, draft.kind === 'ready' ? 9 : 10, false, draft.kind === 'ready' ? 0.5 : 3)
  }
  // Bandeau de couverture en aplat, avec trois pastilles décoratives.
  doc.setFont('times', 'bold'); doc.setFontSize(17)
  const lignesTitre = doc.splitTextToSize(clean(draft.exam.title), width).length
  const hauteurBandeau = 63.8 + lignesTitre * 7.31 + 5
  doc.setFillColor(...accent); doc.rect(0, 0, 210, hauteurBandeau, 'F')
  doc.setFillColor(...pastel); doc.circle(190, 14, 7, 'F'); doc.circle(176, 24, 3.5, 'F'); doc.circle(196, 32, 2.5, 'F')
  text('BACCALAURÉAT TECHNOLOGIQUE · STMG', 15, true, 3, 255)
  text(draft.kind === 'ready' ? 'SUJET D’ENTRAÎNEMENT' : 'EXAMEN BLANC PERSONNALISÉ', 11, true, 3, 255)
  y += 10
  text(correction ? 'ÉLÉMENTS DE CORRECTION' : 'SUJET', 20, true, 3, 255)
  text(draft.exam.title, 17, true, 3, 255)
  y += 8; rule()
  // Durée et barème en pastilles.
  doc.setFillColor(...pastel); doc.roundedRect(left, y - 5.5, 62, 8.5, 1.5, 1.5, 'F'); doc.roundedRect(left + 68, y - 5.5, 50, 8.5, 1.5, 1.5, 'F')
  doc.setFont('times', 'bold'); doc.setFontSize(12); doc.setTextColor(20)
  doc.text(`Durée : ${draft.duration} minutes`, left + 3, y); doc.text('Barème : 20 points', left + 71, y)
  y += 12 * 0.43 + 3
  text(draft.kind === 'ready' ? 'Sujet préconçu RévizSTMG. Cas fictifs. Document non officiel.' : 'Entraînement RévizSTMG généré avec l’aide de l’IA. Document non officiel.', 10)
  if (correction) text('Proposition de correction et critères d’auto-évaluation. À vérifier avec le cours ; ne constitue pas un barème officiel.', 11)
  else {
    text('Répondez sur une copie séparée. Numérotez vos réponses et justifiez votre raisonnement à partir des documents et de vos connaissances.', 12)
    text(draft.exam.instructions, 11)
    y += 6; rule()
    text('COMPOSITION DU SUJET', 12, true)
    text(`${draft.exam.questions.length} questions · ${draft.exam.documents.length} documents\nLe corrigé est fourni dans un fichier séparé.`, 11)
  }
  if (draft.kind === 'ready') scope()
  page()
  heading(correction ? 'Proposition de corrigé et barème indicatif' : 'Travail à faire')
  if (correction) {
    for (const [i, q] of draft.exam.questions.entries()) {
      heading(`${i + 1}. ${q.enonce} (${q.points} points)`)
      text(q.correction)
      text('Critères de réussite', 11, true)
      for (const c of q.criteria) text(`✓ ${c}`)
    }
  } else {
    for (const [i, q] of draft.exam.questions.entries()) {
      heading(`${i + 1}. ${q.enonce} (${q.points} points)`)
      if (q.documentIds.length) text('Documents : ' + q.documentIds.map(id => draft.exam.documents.find(d => d.id === id)?.title || id).join(' ; '), 10)
      else text('Connaissances personnelles du cours - sans document.', 10)
    }
    if (draft.exam.documents.length) {
      if (draft.kind !== 'ready' || y > bottom - 55) page(); heading('Dossier documentaire')
      for (const d of draft.exam.documents) { heading(d.title); text(d.text) }
    }
  }
  if (draft.kind !== 'ready') scope()
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i); doc.setDrawColor(...accent); doc.setLineWidth(0.8); doc.line(left, 282, left + width, 282); doc.setLineWidth(0.3)
    doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(70)
    doc.text(`RévizSTMG - ${correction ? 'Corrigé indicatif' : 'Sujet d’entraînement'} - ${draft.duration} min`, left, 288)
    doc.setFillColor(...accent); doc.roundedRect(left + width - 17, 283.8, 17, 6, 1.5, 1.5, 'F'); doc.setTextColor(255); doc.text(`${i} / ${total}`, left + width - 8.5, 288, { align: 'center' })
  }
  return doc
}
export function downloadExamPdf(draft, correction = false) {
  const safe = clean(draft.exam.title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 80)
  buildExamPdf(draft, correction).save(`RevizSTMG-${safe}-${correction ? 'corrige' : 'sujet'}.pdf`)
}
