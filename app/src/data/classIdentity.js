export const CLASS_NAME_MAX = 60
export function cleanClassName(value) {
 const name=String(value || '').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim()
 if(!name || [...name].length>CLASS_NAME_MAX)throw new Error('CLASS_NAME_INVALID')
 return name
}
