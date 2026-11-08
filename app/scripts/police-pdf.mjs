import {readFile,writeFile} from 'node:fs/promises'
const source=new URL('../resources/fonts/DejaVuSans.ttf',import.meta.url)
await writeFile(new URL('../resources/fonts/DejaVuSans.base64.txt',import.meta.url),(await readFile(source)).toString('base64'))
