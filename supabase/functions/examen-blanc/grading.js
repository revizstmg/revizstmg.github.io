export const MAX_COPY_BYTES = 6 * 1024 * 1024
export const MAX_COPY_FILES = 6
export const COPY_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
export function checkFiles(files) {
  if (!Array.isArray(files) || !files.length || files.length > MAX_COPY_FILES) throw new Error('invalid_files')
  let bytes = 0
  return files.map(file => {
    if (!file || !COPY_TYPES.includes(file.mimeType) || typeof file.data !== 'string' || !file.data.length || file.data.length > Math.ceil(MAX_COPY_BYTES / 3) * 4 || file.data.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(file.data)) throw new Error('invalid_files')
    const decoded = atob(file.data)
    bytes += decoded.length
    if (bytes > MAX_COPY_BYTES) throw new Error('too_large')
    const valid = file.mimeType === 'application/pdf' ? decoded.startsWith('%PDF-') : file.mimeType === 'image/jpeg' ? decoded.startsWith('\xff\xd8\xff') : file.mimeType === 'image/png' ? decoded.startsWith('\x89PNG\r\n\x1a\n') : decoded.startsWith('RIFF') && decoded.slice(8, 12) === 'WEBP'
    if (!valid) throw new Error('invalid_files')
    return { mimeType: file.mimeType, data: file.data }
  })
}
const text = (v, n) => typeof v === 'string' && v.trim().length > 0 && v.length <= n
export function checkGrade(result, exam) {
  if (!result || !['graded', 'unreadable', 'mismatch'].includes(result.status) || !text(result.feedback, 3000)) throw new Error('invalid_response')
  if (result.status !== 'graded') return { status: result.status, feedback: result.feedback, total: null, questions: [], advice: [] }
  if (!Array.isArray(result.questions) || result.questions.length !== exam.questions.length || !Array.isArray(result.advice) || result.advice.length > 6 || result.advice.some(a => !text(a, 900))) throw new Error('invalid_response')
  const seen = new Set()
  const questions = result.questions.map(q => {
    const source = exam.questions.find(x => x.id === q.id)
    if (!source || seen.has(q.id) || !['readable', 'unreadable', 'unanswered'].includes(q.status) || !text(q.feedback, 2500) || typeof q.transcription !== 'string' || q.transcription.length > 12000) throw new Error('invalid_response')
    seen.add(q.id)
    if (q.status === 'unreadable' ? q.points !== null : !Number.isFinite(q.points) || q.points < 0 || q.points > source.points || (q.status === 'unanswered' && q.points !== 0)) throw new Error('invalid_response')
    if (q.status === 'readable' && !q.transcription.trim()) throw new Error('invalid_response')
    return { id: q.id, status: q.status, points: q.points, maxPoints: source.points, transcription: q.transcription, feedback: q.feedback }
  })
  questions.sort((a, b) => exam.questions.findIndex(q => q.id === a.id) - exam.questions.findIndex(q => q.id === b.id))
  const total = questions.some(q => q.status === 'unreadable') ? null : Math.round(questions.reduce((sum, q) => sum + q.points, 0) * 100) / 100
  return { status: 'graded', feedback: result.feedback, questions, advice: result.advice, total }
}
