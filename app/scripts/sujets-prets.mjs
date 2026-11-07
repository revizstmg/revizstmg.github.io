import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import SUJETS_PRETS from '../src/data/sujets/prets.json'
import { buildExamPdf } from '../src/data/examPdf.js'
import { checkGeneratedExam } from '../../supabase/functions/examen-blanc/contract.js'
export function genererSujetsPrets(dist) {
  const dir = join(dist, 'sujets-prets')
  mkdirSync(dir, { recursive: true })
  for (const subject of SUJETS_PRETS) {
    checkGeneratedExam(subject.exam, subject.courses, subject.duration)
    for (const correction of [false, true]) {
      const doc = buildExamPdf(subject, correction)
      writeFileSync(join(dir, `${subject.id}-${correction ? 'corrige' : 'sujet'}.pdf`), Buffer.from(doc.output('arraybuffer')))
    }
  }
  console.log(`[sujets-prets] ${SUJETS_PRETS.length} sujets et leurs corrigés PDF générés`)
}
